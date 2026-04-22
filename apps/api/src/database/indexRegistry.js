import { COLLECTION_NAMES } from "./constants.js";

export const INDEXES_TO_CREATE = Object.freeze([
  { collection: COLLECTION_NAMES.tenants, index: { slug: 1 }, options: { unique: true } },
  { collection: COLLECTION_NAMES.tenants, index: { planExpiresAt: 1 } },

  { collection: COLLECTION_NAMES.users, index: { tenantId: 1, phone: 1 }, options: { unique: true } },
  { collection: COLLECTION_NAMES.users, index: { tenantId: 1, role: 1 } },

  { collection: COLLECTION_NAMES.patients, index: { tenantId: 1, uhid: 1 }, options: { unique: true } },
  { collection: COLLECTION_NAMES.patients, index: { tenantId: 1, phone: 1 } },
  { collection: COLLECTION_NAMES.patients, index: { tenantId: 1, name: "text", phone: "text" } },
  { collection: COLLECTION_NAMES.patients, index: { tenantId: 1, abhaId: 1 } },

  { collection: COLLECTION_NAMES.visits, index: { tenantId: 1, visitDate: -1 } },
  { collection: COLLECTION_NAMES.visits, index: { tenantId: 1, doctorId: 1, visitDate: -1 } },
  { collection: COLLECTION_NAMES.visits, index: { tenantId: 1, patientId: 1, visitDate: -1 } },
  { collection: COLLECTION_NAMES.visits, index: { tenantId: 1, status: 1, visitDate: -1 } },

  {
    collection: COLLECTION_NAMES.prescriptions,
    index: { tenantId: 1, visitId: 1 },
    options: { unique: true }
  },
  { collection: COLLECTION_NAMES.prescriptions, index: { tenantId: 1, patientId: 1, createdAt: -1 } },

  { collection: COLLECTION_NAMES.bills, index: { tenantId: 1, billNumber: 1 }, options: { unique: true } },
  { collection: COLLECTION_NAMES.bills, index: { tenantId: 1, patientId: 1, createdAt: -1 } },
  { collection: COLLECTION_NAMES.bills, index: { tenantId: 1, status: 1, createdAt: -1 } },
  { collection: COLLECTION_NAMES.bills, index: { tenantId: 1, createdAt: -1 } },

  {
    collection: COLLECTION_NAMES.inventories,
    index: { tenantId: 1, medicineName: "text", genericName: "text" }
  },
  { collection: COLLECTION_NAMES.inventories, index: { tenantId: 1, "batches.expiryDate": 1 } },
  { collection: COLLECTION_NAMES.inventories, index: { tenantId: 1, totalQty: 1 } },

  {
    collection: COLLECTION_NAMES.ipdAdmissions,
    index: { tenantId: 1, admissionNumber: 1 },
    options: { unique: true }
  },
  { collection: COLLECTION_NAMES.ipdAdmissions, index: { tenantId: 1, status: 1 } },
  { collection: COLLECTION_NAMES.ipdAdmissions, index: { tenantId: 1, bedId: 1, status: 1 } },

  { collection: COLLECTION_NAMES.auditLogs, index: { tenantId: 1, timestamp: -1 } },
  {
    collection: COLLECTION_NAMES.auditLogs,
    index: { timestamp: 1 },
    options: { expireAfterSeconds: 63072000 }
  },

  { collection: COLLECTION_NAMES.sequences, index: { tenantId: 1, type: 1 }, options: { unique: true } },

  { collection: COLLECTION_NAMES.notifications, index: { tenantId: 1, createdAt: -1 } },

  { collection: COLLECTION_NAMES.otps, index: { createdAt: 1 }, options: { expireAfterSeconds: 600 } },
  { collection: COLLECTION_NAMES.otps, index: { phone: 1, otp: 1 } },

  { collection: COLLECTION_NAMES.services, index: { tenantId: 1, code: 1 }, options: { unique: true } },
  { collection: COLLECTION_NAMES.services, index: { tenantId: 1, category: 1, isActive: 1 } },

  { collection: COLLECTION_NAMES.medicineMasters, index: { code: 1 }, options: { unique: true } },
  { collection: COLLECTION_NAMES.medicineMasters, index: { medicineName: "text", genericName: "text" } },
  { collection: COLLECTION_NAMES.diagnosisMasters, index: { code: 1 }, options: { unique: true } },
  { collection: COLLECTION_NAMES.diagnosisMasters, index: { description: "text", category: 1 } }
]);

export const serializeIndexShape = (index = {}) => JSON.stringify(index);
export const serializeIndexOptions = (options = {}) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(options)
        .filter(([key]) => !["background", "name"].includes(key))
        .sort(([left], [right]) => left.localeCompare(right))
    )
  );
