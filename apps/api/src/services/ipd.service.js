import mongoose from "mongoose";
import { Bed, IpdAdmission, Sequence, Ward, Bill } from "../models/index.js";
import { ApiError } from "../utils/apiError.js";
import { queue } from "../shared/adapters/queue.adapter.js";

/**
 * Generates an IPD admission number.
 */
const generateAdmissionNumber = async (tenantId, session) => {
  const seq = await Sequence.findOneAndUpdate(
    { tenantId, type: "IPD_ADMISSION" },
    { $inc: { value: 1 } },
    { upsert: true, new: true, session, setDefaultsOnInsert: true }
  );
  return `IPD-${String(seq.value).padStart(4, "0")}`;
};

/**
 * Generates a bill number for discharge.
 */
const generateBillNumber = async (tenantId, session) => {
  const seq = await Sequence.findOneAndUpdate(
    { tenantId, type: "BILL" },
    { $inc: { value: 1 } },
    { upsert: true, new: true, session, setDefaultsOnInsert: true }
  );
  return `BILL-${String(seq.value).padStart(4, "0")}`;
};

// ── Wards & Beds ─────────────────────────────────────────────────────────────

export const createWard = async (tenantId, data) => {
  return Ward.create({ ...data, tenantId });
};

export const addBeds = async (tenantId, wardId, bedsData) => {
  const beds = bedsData.map(bed => ({
    ...bed,
    wardId,
    tenantId,
    status: "available"
  }));
  return Bed.insertMany(beds);
};

export const getBedMap = async (tenantId) => {
  const wards = await Ward.find({ tenantId }).lean();
  const beds = await Bed.find({ tenantId }).lean();

  return wards.map(ward => ({
    ...ward,
    beds: beds.filter(bed => String(bed.wardId) === String(ward._id))
  }));
};

export const listBeds = async (tenantId, query = {}) => {
  const filter = { tenantId };
  if (query.wardId) filter.wardId = query.wardId;
  if (query.status) filter.status = query.status;
  return Bed.find(filter).populate("wardId", "name floor").lean();
};

// ── Admissions ────────────────────────────────────────────────────────────────

export const admitPatient = async (tenantId, userId, data) => {
  const session = await mongoose.startSession();
  let admission;

  try {
    await session.withTransaction(async () => {
      // 1. Verify bed availability
      const bed = await Bed.findOne({ 
        _id: data.bedId, 
        tenantId, 
        status: "available" 
      }).session(session);

      if (!bed) {
        throw new ApiError(409, "Bed is not available", [{ code: "BED_UNAVAILABLE" }]);
      }

      // 2. Generate admission number
      const admissionNumber = await generateAdmissionNumber(tenantId, session);

      // 3. Create admission record
      [admission] = await IpdAdmission.create([
        {
          ...data,
          tenantId,
          admissionNumber,
          admissionDate: new Date(),
          status: "admitted",
          createdBy: userId,
          updatedBy: userId,
          dailyCharges: [{
            date: new Date(),
            services: [{
              name: "Initial Bed Charge",
              qty: 1,
              rate: bed.dailyRate,
              total: bed.dailyRate
            }],
            notes: "Admission day charge"
          }]
        }
      ], { session });

      // 4. Update bed status
      await Bed.findByIdAndUpdate(
        data.bedId,
        { status: "occupied", currentAdmissionId: admission._id },
        { session }
      );
    });

    // Queue notifications outside transaction
    await queue.send("sms", { 
      type: "admission-confirm", 
      admissionId: admission._id, 
      tenantId 
    });

    return admission;
  } finally {
    await session.endSession();
  }
};

export const addDailyCharges = async (tenantId, admissionId, data) => {
  const admission = await IpdAdmission.findOne({ _id: admissionId, tenantId });
  if (!admission || admission.status !== "admitted") {
    throw new ApiError(404, "Active admission not found");
  }

  const chargeDate = data.date || new Date();
  
  // Helper to map and compute totals
  const mapCharges = (items) => (items || []).map(item => ({
    ...item,
    total: item.qty * item.rate
  }));

  admission.dailyCharges.push({
    date: chargeDate,
    services: mapCharges(data.services),
    medicines: mapCharges(data.medicines),
    notes: data.notes
  });

  await admission.save();
  return admission;
};

export const listAdmissions = async (tenantId, query = {}) => {
  const filter = { tenantId };
  if (query.status) filter.status = query.status;
  
  return IpdAdmission.find(filter)
    .populate("patientId", "name uhid phone")
    .populate("doctorId", "name")
    .populate("bedId")
    .sort({ admissionDate: -1 })
    .lean();
};

// ── Discharge ─────────────────────────────────────────────────────────────────

export const dischargePatient = async (tenantId, userId, admissionId) => {
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      const admission = await IpdAdmission.findOne({ 
        _id: admissionId, 
        tenantId, 
        status: "admitted" 
      }).populate("bedId").session(session);

      if (!admission) {
        throw new ApiError(404, "Active admission not found");
      }

      // 1. Calculate final bill
      const allCharges = admission.dailyCharges.flatMap(d => [
        ...(d.services || []),
        ...(d.medicines || [])
      ]);
      
      const subtotal = allCharges.reduce((sum, item) => sum + item.total, 0);
      const deposit = admission.depositAmount || 0;
      const total = subtotal; // Simplified (taxes could be added here)
      const balance = total - deposit;

      // 2. Create Final Bill
      const billNumber = await generateBillNumber(tenantId, session);
      const [bill] = await Bill.create([
        {
          tenantId,
          patientId: admission.patientId,
          type: "ipd",
          billNumber,
          status: balance <= 0 ? "paid" : "unpaid",
          lineItems: allCharges.map(c => ({
            description: c.name,
            quantity: c.qty,
            rate: c.rate,
            baseAmount: c.total,
            gstAmount: 0 // Simplified
          })),
          subtotal,
          totalTax: 0,
          total,
          amountPaid: deposit,
          balance: Math.max(0, balance),
          finalizedAt: new Date(),
          createdBy: userId,
          updatedBy: userId
        }
      ], { session });

      // 3. Update Admission status
      admission.status = "discharged";
      admission.dischargeDate = new Date();
      admission.finalBillId = bill._id;
      await admission.save({ session });

      // 4. Free the bed
      await Bed.findByIdAndUpdate(
        admission.bedId._id,
        { status: "available", currentAdmissionId: null },
        { session }
      );

      result = { admission, bill };
    });

    // Queue PDF generation
    await queue.send("pdf", { 
      type: "invoice", 
      resourceId: result.bill._id, 
      tenantId 
    });

    return result;
  } finally {
    await session.endSession();
  }
};
