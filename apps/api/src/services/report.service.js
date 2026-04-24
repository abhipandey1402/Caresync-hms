import dayjs from "dayjs";
import mongoose from "mongoose";
import { Visit, Bill, IpdAdmission, Bed, ReportJob, User, Patient, Inventory } from "../models/index.js";
import { cacheGet, cacheSet } from "../shared/cache.js";
import { queue } from "../shared/adapters/queue.adapter.js";
import { nanoid } from "nanoid";

// ==========================================
// Dashboard Stats
// ==========================================

export const getOPDStats = async (tenantId, startOfDay, endOfDay, doctorId) => {
  const query = { tenantId, visitDate: { $gte: startOfDay, $lte: endOfDay } };
  if (doctorId) query.doctorId = doctorId;

  const visits = await Visit.find(query).lean();

  return {
    total: visits.length,
    completed: visits.filter(v => v.status === "completed").length,
    pending: visits.filter(v => ["queued", "checked_in", "in_consultation"].includes(v.status)).length,
    cancelled: visits.filter(v => ["cancelled", "no_show"].includes(v.status)).length
  };
};

export const getRevenueStats = async (tenantId, startOfDay, endOfDay, doctorId) => {
  // Find bills finalized today
  // If doctorId is provided, we need to filter bills by visits associated with that doctor, 
  // or just rely on createdBy/receivedBy if direct correlation isn't straightforward.
  // Assuming 'Visit' ties to doctor, but for simplicity, we'll fetch bills directly 
  // and manually correlate if doctorId is present.
  
  const query = { 
    tenantId, 
    finalizedAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["paid", "partial"] }
  };

  if (doctorId) {
    // get visits for this doctor today
    const visits = await Visit.find({ tenantId, doctorId, visitDate: { $gte: startOfDay, $lte: endOfDay } }, "_id").lean();
    const visitIds = visits.map(v => v._id);
    query.visitId = { $in: visitIds };
  }

  const bills = await Bill.find(query).lean();

  const total = bills.reduce((sum, b) => sum + (b.total || 0), 0);
  const collected = bills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const pending = total - collected;

  return { total, collected, pending };
};

export const getIPDStats = async (tenantId, startOfDay, endOfDay) => {
  const [beds, admissionsToday, dischargesToday] = await Promise.all([
    Bed.find({ tenantId }).lean(),
    IpdAdmission.countDocuments({ tenantId, admissionDate: { $gte: startOfDay, $lte: endOfDay } }),
    IpdAdmission.countDocuments({ tenantId, dischargeDate: { $gte: startOfDay, $lte: endOfDay } })
  ]);

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === "occupied").length;

  return {
    occupied: occupiedBeds,
    total: totalBeds,
    admittedToday: admissionsToday,
    dischargedToday: dischargesToday
  };
};

export const getPharmacyStats = async (tenantId, startOfDay, endOfDay) => {
  const bills = await Bill.find({
    tenantId,
    type: "pharmacy",
    finalizedAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["paid", "partial"] }
  }).lean();

  const salesToday = bills.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  return { salesToday };
};

export const getDoctorWise = async (tenantId, startOfDay, endOfDay) => {
  // Aggregate doctor stats
  const doctors = await User.find({ tenantId, role: "doctor" }).lean();
  
  const visits = await Visit.find({ tenantId, visitDate: { $gte: startOfDay, $lte: endOfDay } }).lean();
  
  // To get collection, we check bills linked to these visits
  const visitIds = visits.map(v => v._id);
  const bills = await Bill.find({
    tenantId,
    visitId: { $in: visitIds },
    finalizedAt: { $gte: startOfDay, $lte: endOfDay }
  }).lean();

  const billMap = new Map(); // visitId -> collection
  bills.forEach(b => {
    if (b.visitId) {
      billMap.set(String(b.visitId), (billMap.get(String(b.visitId)) || 0) + (b.amountPaid || 0));
    }
  });

  return doctors.map(doc => {
    const docVisits = visits.filter(v => String(v.doctorId) === String(doc._id));
    const collection = docVisits.reduce((sum, v) => sum + (billMap.get(String(v._id)) || 0), 0);
    
    return {
      doctorId: doc._id,
      doctor: doc.name,
      opd: docVisits.length,
      collection
    };
  }).filter(d => d.opd > 0 || d.collection > 0);
};

export const getRevenueByHour = async (tenantId, startOfDay, endOfDay) => {
  const bills = await Bill.find({
    tenantId,
    finalizedAt: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["paid", "partial"] }
  }).lean();

  const hourly = {};
  for (let i = 0; i < 24; i++) {
    hourly[String(i).padStart(2, "0") + ":00"] = 0;
  }

  bills.forEach(b => {
    const hour = dayjs(b.finalizedAt).format("HH:00");
    if (hourly[hour] !== undefined) {
      hourly[hour] += (b.amountPaid || 0);
    }
  });

  return Object.entries(hourly).map(([hour, amount]) => ({ hour, amount }));
};

export const getDashboard = async (tenantId, { from, to, date: dateStr }, userRole, userId) => {
  // If doctor, scope everything to their own
  const doctorId = userRole === "doctor" ? userId : null;
  const isDoctor = !!doctorId;

  let startOfDay, endOfDay, dateKey;

  if (from && to) {
    startOfDay = dayjs(from).startOf("day").toDate();
    endOfDay = dayjs(to).endOf("day").toDate();
    dateKey = `${dayjs(startOfDay).format("YYYY-MM-DD")}_to_${dayjs(endOfDay).format("YYYY-MM-DD")}`;
  } else {
    let date;
    if (!dateStr || dateStr === 'today') {
      date = dayjs().startOf("day");
    } else {
      date = dayjs(dateStr).startOf("day");
    }
    startOfDay = date.toDate();
    endOfDay = date.endOf("day").toDate();
    dateKey = date.format("YYYY-MM-DD");
  }

  const cacheKey = `dashboard:${tenantId}:${dateKey}${doctorId ? `:${doctorId}` : ""}`;
  
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const [opd, revenue, ipd, pharmacy, doctorWise, revenueByHour] = await Promise.all([
    getOPDStats(tenantId, startOfDay, endOfDay, doctorId),
    getRevenueStats(tenantId, startOfDay, endOfDay, doctorId),
    isDoctor ? Promise.resolve(null) : getIPDStats(tenantId, startOfDay, endOfDay),
    isDoctor ? Promise.resolve(null) : getPharmacyStats(tenantId, startOfDay, endOfDay),
    isDoctor ? Promise.resolve([]) : getDoctorWise(tenantId, startOfDay, endOfDay),
    getRevenueByHour(tenantId, startOfDay, endOfDay)
  ]);

  const dashboard = { 
    date: dateKey, 
    opd, 
    revenue, 
    ipd, 
    pharmacy, 
    doctorWise, 
    revenueByHour 
  };

  cacheSet(cacheKey, dashboard, 300); // 5 minute TTL
  return dashboard;
};

// ==========================================
// Reporting & Async Export
// ==========================================

export const getRevenueReport = async (tenantId, { from, to, groupBy }) => {
  // Quick synchronous report (optional for UI)
  const start = dayjs(from).startOf("day").toDate();
  const end = dayjs(to).endOf("day").toDate();

  const bills = await Bill.find({
    tenantId,
    finalizedAt: { $gte: start, $lte: end },
    status: { $in: ["paid", "partial"] }
  }).lean();

  return bills;
};

export const getOutstandingDues = async (tenantId) => {
  return Bill.find({
    tenantId,
    status: { $in: ["unpaid", "partial"] },
    balance: { $gt: 0 }
  }).populate("patientId", "name phone uhid").lean();
};

export const getPatientInsights = async (tenantId, { from, to }) => {
  const start = dayjs(from).startOf("day").toDate();
  const end = dayjs(to).endOf("day").toDate();

  const [totalPatients, newPatients, visitStats] = await Promise.all([
    Patient.countDocuments({ tenantId }),
    Patient.countDocuments({ tenantId, createdAt: { $gte: start, $lte: end } }),
    Patient.aggregate([
      { $match: { tenantId: new mongoose.Types.ObjectId(tenantId), createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ])
  ]);

  return { totalPatients, newPatients, visitStats };
};

export const getInventoryReports = async (tenantId) => {
  const [totalItems, lowStock, expiringSoon] = await Promise.all([
    Inventory.countDocuments({ tenantId }),
    Inventory.countDocuments({ tenantId, $expr: { $lte: ["$quantity", "$minStock"] } }),
    Inventory.countDocuments({ 
      tenantId, 
      expiryDate: { $lte: dayjs().add(3, "month").toDate() } 
    })
  ]);

  return { totalItems, lowStock, expiringSoon };
};

export const getPatientsList = async (tenantId) => {
  return Patient.find({ tenantId }).lean();
};

export const getInventoryList = async (tenantId) => {
  return Inventory.find({ tenantId }).lean();
};

export const requestExport = async (tenantId, userId, params) => {
  const jobId = nanoid(12);

  // Register the job
  await ReportJob.create({
    tenantId,
    userId,
    jobId,
    reportType: params.type,
    filters: { from: params.from, to: params.to }
  });

  const payload = {
    type: "csv-export",
    reportType: params.type,
    tenantId,
    userId,
    jobId,
    filters: { from: params.from, to: params.to }
  };

  try {
    // Queue SQS message for report generation
    await queue.send("report", payload);
  } catch (err) {
    // Fallback for local development if SQS is not configured
    console.warn(`[Local Fallback] SQS queue failed, processing report job ${jobId} inline asynchronously.`);
    import("../jobs/processors/report.processor.js").then(({ processReport }) => {
      processReport(payload);
    }).catch(console.error);
  }

  return { jobId, message: "Report being generated. You will receive it shortly." };
};

export const getExportJobStatus = async (tenantId, jobId) => {
  const job = await ReportJob.findOne({ tenantId, jobId }).lean();
  if (!job) return null;
  
  return {
    status: job.status,
    url: job.pdfKey ? `/api/v1/storage/download?key=${job.pdfKey}` : null,
    pdfKey: job.pdfKey,
    createdAt: job.createdAt,
    reportType: job.reportType
  };
};

export const getRecentExportJobs = async (tenantId, userId) => {
  return ReportJob.find({ tenantId, userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
};
