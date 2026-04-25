import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";
import { connectDB } from "../../src/config/db.js";
import { initializeEnv } from "../../src/config/env.js";
import { logger } from "../../src/config/logger.js";
import { 
  Tenant, User, Patient, Ward, Bed, Visit, 
  Prescription, Bill, Inventory, MedicineMaster, DiagnosisMaster, Service, IpdAdmission,
  AuditLog, Notification, RxTemplate, Sequence, PharmacyAlertLog
} from "../../src/models/index.js";
import { generateMedicineMasterRecords, generateDiagnosisRecords } from "../../src/database/seedGenerators.js";
import { ensureDefaultServicesForTenant } from "../../src/database/serviceProvisioning.js";

const TENANT_ID = "69ea1192134323948b328ae9";
const PASSWORD = "Password123!";

const seed = async () => {
  await initializeEnv();
  await connectDB();

  logger.info("Starting ENHANCED master seeding process...");

  const report = {};

  // 1. Ensure Tenant exists
  let tenant = await Tenant.findById(TENANT_ID);
  if (!tenant) {
    logger.info("Target tenant not found, creating a new one...");
    tenant = await Tenant.create({
      _id: new mongoose.Types.ObjectId(TENANT_ID),
      name: "CareSync Multispeciality Hospital",
      slug: "caresync-demo",
      legalName: "CareSync Healthcare Pvt Ltd",
      ownerName: "Abhi Pandey",
      plan: "enterprise",
      status: "active",
      contact: {
        email: "contact@caresync.com",
        phone: "+919876543210"
      },
      address: {
        line1: "123 Health Ave",
        city: "Lucknow",
        state: "Uttar Pradesh",
        pincode: "226001"
      }
    });
  }
  report.tenant = tenant.name;

  // 2. Ensure Default Services
  const servicesCreatedCount = await ensureDefaultServicesForTenant(TENANT_ID);
  report.servicesProvisioned = servicesCreatedCount;

  // 3. Create Users (Doctors, Nurses, Staff)
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const userRoles = ["doctor", "nurse", "receptionist", "admin", "pharmacist", "billing"];
  
  logger.info("Ensuring users...");
  const existingUsersCount = await User.countDocuments({ tenantId: TENANT_ID });
  if (existingUsersCount < 20) {
    const users = [];
    for (let i = 0; i < 25; i++) {
      const role = faker.helpers.arrayElement(userRoles);
      users.push({
        tenantId: TENANT_ID,
        name: faker.person.fullName(),
        phone: faker.string.numeric(10),
        email: faker.internet.email().toLowerCase(),
        role,
        passwordHash,
        isActive: true,
        profile: role === "doctor" ? {
          specialization: faker.helpers.arrayElement(["Cardiology", "Neurology", "Pediatrics", "Orthopedics", "General Medicine", "Dermatology", "Oncology"]),
          registrationNumber: `REG-${faker.string.alphanumeric(6).toUpperCase()}`
        } : undefined
      });
    }
    const createdUsers = await User.insertMany(users);
    report.usersCreated = createdUsers.length;
  } else {
    report.usersCreated = "Sufficient users exist";
  }

  const allDoctors = await User.find({ tenantId: TENANT_ID, role: "doctor" });
  const allStaff = await User.find({ tenantId: TENANT_ID, role: { $ne: "doctor" } });
  const admins = await User.find({ tenantId: TENANT_ID, role: "admin" });

  // 4. Refined Wards and Beds (Ground to 3rd Floor)
  logger.info("Creating refined ward and bed layout...");
  await Bed.deleteMany({ tenantId: TENANT_ID });
  await Ward.deleteMany({ tenantId: TENANT_ID });

  const floors = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"];
  const wardTypes = ["General Ward", "Semi-Private", "Private", "ICU", "Emergency", "Maternity", "Pediatric"];
  
  let totalWards = 0;
  let totalBeds = 0;

  for (const floor of floors) {
    for (const type of wardTypes) {
      const ward = await Ward.create({
        tenantId: TENANT_ID,
        name: `${type} (${floor})`,
        floor,
        capacity: 20,
        description: `${type} facilities on ${floor}`
      });
      totalWards++;

      const beds = [];
      for (let j = 1; j <= 20; j++) {
        beds.push({
          tenantId: TENANT_ID,
          wardId: ward._id,
          bedNumber: `${floor[0]}${type[0]}-${j}`,
          type: type === "ICU" ? "icu" : type === "Emergency" ? "emergency" : type.includes("Private") ? "private" : "general",
          dailyRate: type === "ICU" ? 800000 : type.includes("Private") ? 500000 : 150000, // paise
          status: "available"
        });
      }
      await Bed.insertMany(beds);
      totalBeds += beds.length;
    }
  }
  report.wardsCreated = totalWards;
  report.bedsCreated = totalBeds;

  // 5. Clinical Master Data
  const medCount = await MedicineMaster.countDocuments();
  if (medCount < 1000) {
    logger.info("Generating Medicine Master records...");
    const meds = generateMedicineMasterRecords(3000);
    await MedicineMaster.insertMany(meds);
    report.medicinesCreated = meds.length;
  } else {
    report.medicinesCreated = "Existing";
  }

  const diagCount = await DiagnosisMaster.countDocuments();
  if (diagCount < 500) {
    logger.info("Generating Diagnosis Master records...");
    const diags = generateDiagnosisRecords(1500);
    await DiagnosisMaster.insertMany(diags);
    report.diagnosesCreated = diags.length;
  } else {
    report.diagnosesCreated = "Existing";
  }

  // 6. Inventories
  logger.info("Seeding Inventories...");
  const medicineMasters = await MedicineMaster.find().limit(500);
  const inventories = [];
  for (const med of medicineMasters) {
    const batches = [];
    const numBatches = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numBatches; i++) {
      batches.push({
        batchNumber: `BAT-${faker.string.alphanumeric(6).toUpperCase()}`,
        mfgDate: faker.date.past({ years: 1 }),
        expiryDate: faker.date.future({ years: 2 }),
        qty: faker.number.int({ min: 10, max: 500 }),
        mrp: faker.number.int({ min: 10000, max: 100000 }), // paise
        purchasePrice: faker.number.int({ min: 5000, max: 80000 }) // paise
      });
    }

    inventories.push({
      tenantId: TENANT_ID,
      medicineId: med._id,
      medicineCode: med.code,
      medicineName: med.medicineName,
      genericName: med.genericName,
      manufacturer: med.manufacturer,
      hsnCode: "30049099",
      gstRate: 12,
      unit: med.form || "Tab",
      reorderLevel: 50,
      batches
    });
  }
  await Inventory.deleteMany({ tenantId: TENANT_ID });
  const createdInventories = await Inventory.insertMany(inventories);
  report.inventoriesCreated = createdInventories.length;

  // 7. Patients
  logger.info("Generating patients...");
  const patients = [];
  for (let i = 0; i < 300; i++) {
    patients.push({
      tenantId: TENANT_ID,
      uhid: `UHID-${faker.string.alphanumeric(8).toUpperCase()}`,
      name: faker.person.fullName(),
      phone: faker.string.numeric(10),
      gender: faker.helpers.arrayElement(["male", "female"]),
      dateOfBirth: faker.date.birthdate({ min: 0, max: 90, mode: "age" }),
      bloodGroup: faker.helpers.arrayElement(["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]),
      address: {
        line1: faker.location.streetAddress(),
        city: "Lucknow",
        state: "Uttar Pradesh",
        pincode: "226001"
      }
    });
  }
  const createdPatients = await Patient.insertMany(patients);
  report.patientsCreated = createdPatients.length;

  // 8. Visits, Prescriptions & Bills
  logger.info("Generating clinical activity (Visits, Prescriptions, Bills)...");
  const visits = [];
  const allMeds = await MedicineMaster.find().limit(200);
  const allDiags = await DiagnosisMaster.find().limit(200);

  for (let i = 0; i < 500; i++) {
    const patient = faker.helpers.arrayElement(createdPatients);
    const doctor = faker.helpers.arrayElement(allDoctors);
    
    visits.push({
      tenantId: TENANT_ID,
      patientId: patient._id,
      doctorId: doctor._id,
      visitDate: faker.date.past({ years: 0.5 }),
      type: faker.helpers.arrayElement(["opd", "follow_up", "emergency"]),
      status: "completed",
      chiefComplaint: faker.lorem.sentence(),
      diagnosisCodes: [faker.helpers.arrayElement(allDiags).code]
    });
  }
  const createdVisits = await Visit.insertMany(visits);
  report.visitsCreated = createdVisits.length;

  const prescriptions = [];
  const bills = [];
  for (const visit of createdVisits) {
    // Prescription
    if (faker.datatype.boolean(0.85)) {
      prescriptions.push({
        tenantId: TENANT_ID,
        visitId: visit._id,
        patientId: visit.patientId,
        doctorId: visit.doctorId,
        status: "finalized",
        medicines: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() => {
          const med = faker.helpers.arrayElement(allMeds);
          return {
            medicineCode: med.code,
            name: med.medicineName,
            genericName: med.genericName,
            dose: "1",
            frequency: faker.helpers.arrayElement(["1-0-1", "1-1-1", "0-0-1", "1-0-0"]),
            duration: "7 days",
            route: "oral"
          };
        }),
        advice: faker.lorem.sentence(),
        finalizedAt: visit.visitDate
      });
    }

    // Bill
    const subtotal = faker.number.int({ min: 30000, max: 200000 });
    const gst = Math.round(subtotal * 0.18);
    const total = subtotal + gst;
    bills.push({
      tenantId: TENANT_ID,
      patientId: visit.patientId,
      visitId: visit._id,
      type: "opd",
      billNumber: `BILL-${faker.string.alphanumeric(10).toUpperCase()}`,
      status: "paid",
      subtotal,
      totalTax: gst,
      total,
      amountPaid: total,
      payments: [{
        mode: faker.helpers.arrayElement(["cash", "upi", "card"]),
        amount: total,
        timestamp: visit.visitDate,
        receivedBy: faker.helpers.arrayElement(allStaff)._id
      }]
    });
  }
  await Prescription.insertMany(prescriptions);
  await Bill.insertMany(bills);
  report.prescriptionsCreated = prescriptions.length;
  report.billsCreated = bills.length;

  // 9. Pharmacy Sales (Bills with type 'pharmacy')
  logger.info("Seeding Pharmacy Sales...");
  const pharmacySales = [];
  for (let i = 0; i < 100; i++) {
    const patient = faker.helpers.arrayElement(createdPatients);
    const amount = faker.number.int({ min: 50000, max: 500000 });
    pharmacySales.push({
      tenantId: TENANT_ID,
      patientId: patient._id,
      type: "pharmacy",
      billNumber: `PHARM-${faker.string.alphanumeric(10).toUpperCase()}`,
      status: "paid",
      subtotal: amount,
      total: amount,
      amountPaid: amount,
      payments: [{
        mode: "cash",
        amount: amount,
        timestamp: new Date(),
        receivedBy: faker.helpers.arrayElement(allStaff)._id
      }]
    });
  }
  await Bill.insertMany(pharmacySales);
  report.pharmacySalesCreated = pharmacySales.length;

  // 10. RxTemplates
  logger.info("Seeding RxTemplates...");
  const templates = [];
  for (const doctor of allDoctors) {
    for (let i = 0; i < 3; i++) {
      templates.push({
        tenantId: TENANT_ID,
        doctorId: doctor._id,
        speciality: doctor.profile?.specialization,
        name: `${doctor.profile?.specialization || "General"} Template ${i + 1}`,
        medicines: Array.from({ length: 3 }).map(() => {
          const med = faker.helpers.arrayElement(allMeds);
          return {
            name: med.medicineName,
            genericName: med.genericName,
            dose: "1",
            frequency: "1-0-1",
            duration: "5 days"
          };
        }),
        advice: "Take after meals."
      });
    }
  }
  await RxTemplate.deleteMany({ tenantId: TENANT_ID });
  await RxTemplate.insertMany(templates);
  report.rxTemplatesCreated = templates.length;

  // 11. Notifications
  logger.info("Seeding Notifications...");
  const notifications = [];
  for (let i = 0; i < 200; i++) {
    notifications.push({
      tenantId: TENANT_ID,
      channel: faker.helpers.arrayElement(["sms", "whatsapp", "email", "in_app"]),
      recipient: faker.phone.number(),
      status: faker.helpers.arrayElement(["sent", "read", "queued"]),
      payload: { message: faker.lorem.sentence() },
      sentAt: faker.date.past()
    });
  }
  await Notification.deleteMany({ tenantId: TENANT_ID });
  await Notification.insertMany(notifications);
  report.notificationsCreated = notifications.length;

  // 12. AuditLogs
  logger.info("Seeding AuditLogs...");
  const auditLogs = [];
  const resources = ["patient", "visit", "bill", "inventory", "user"];
  for (let i = 0; i < 500; i++) {
    auditLogs.push({
      tenantId: TENANT_ID,
      userId: faker.helpers.arrayElement(allStaff)._id,
      action: faker.helpers.arrayElement(["create", "update", "delete"]),
      resource: faker.helpers.arrayElement(resources),
      resourceId: new mongoose.Types.ObjectId().toString(),
      ipAddress: faker.internet.ip(),
      userAgent: faker.internet.userAgent(),
      timestamp: faker.date.past(),
      meta: { details: "Bulk seed operation" }
    });
  }
  await AuditLog.deleteMany({ tenantId: TENANT_ID });
  await AuditLog.insertMany(auditLogs);
  report.auditLogsCreated = auditLogs.length;

  // 13. Sequences
  logger.info("Seeding Sequences...");
  const sequenceTypes = ["UHID", "BILL", "IPD", "OPD", "PHARMACY", "INV"];
  await Sequence.deleteMany({ tenantId: TENANT_ID });
  for (const type of sequenceTypes) {
    await Sequence.create({
      tenantId: TENANT_ID,
      type,
      value: faker.number.int({ min: 1000, max: 5000 }),
      prefix: type.substring(0, 3)
    });
  }
  report.sequencesCreated = sequenceTypes.length;

  // 14. PharmacyAlertLogs
  logger.info("Seeding PharmacyAlertLogs...");
  const alertLogs = [];
  const alertInventories = createdInventories.slice(0, 50);
  for (const inv of alertInventories) {
    alertLogs.push({
      tenantId: TENANT_ID,
      medicineId: inv._id,
      alertType: faker.helpers.arrayElement(["expiry-30", "low-stock"]),
      alertDate: dayjs().format("YYYY-MM-DD"),
      sentAt: new Date()
    });
  }
  await PharmacyAlertLog.deleteMany({ tenantId: TENANT_ID });
  await PharmacyAlertLog.insertMany(alertLogs);
  report.pharmacyAlertLogsCreated = alertLogs.length;

  // 15. IPD Admissions
  logger.info("Generating IPD Admissions...");
  const availableBeds = await Bed.find({ tenantId: TENANT_ID, status: "available" }).limit(50);
  const admissions = [];
  for (const bed of availableBeds) {
    if (faker.datatype.boolean(0.6)) {
      const patient = faker.helpers.arrayElement(createdPatients);
      const doctor = faker.helpers.arrayElement(allDoctors);
      
      admissions.push({
        tenantId: TENANT_ID,
        patientId: patient._id,
        doctorId: doctor._id,
        bedId: bed._id,
        admissionNumber: `IPD-${faker.string.alphanumeric(8).toUpperCase()}`,
        admissionDate: faker.date.past(),
        status: "admitted",
        diagnosis: faker.lorem.sentence(),
        depositAmount: 1000000
      });
      await Bed.findByIdAndUpdate(bed._id, { status: "occupied" });
    }
  }
  await IpdAdmission.deleteMany({ tenantId: TENANT_ID });
  const createdAdmissions = await IpdAdmission.insertMany(admissions);
  report.ipdAdmissionsCreated = createdAdmissions.length;

  logger.info("ENHANCED Seeding complete!", report);
  
  console.log("\n--- ENHANCED SEEDING REPORT ---");
  console.table(report);
  
  await mongoose.disconnect();
};

seed().catch(err => {
  logger.error("Seeding failed", err);
  process.exit(1);
});
