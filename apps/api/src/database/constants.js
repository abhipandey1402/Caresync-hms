export const COLLECTION_NAMES = Object.freeze({
  tenants: "tenants",
  users: "users",
  patients: "patients",
  visits: "visits",
  prescriptions: "prescriptions",
  bills: "bills",
  inventories: "inventories",
  ipdAdmissions: "ipd_admissions",
  auditLogs: "audit_logs",
  sequences: "sequences",
  notifications: "notifications",
  otps: "otps",
  services: "services",
  medicineMasters: "medicine_masters",
  diagnosisMasters: "diagnosis_masters"
});

export const USER_ROLES = Object.freeze([
  "owner",
  "admin",
  "doctor",
  "nurse",
  "receptionist",
  "pharmacist",
  "lab_technician",
  "billing",
  "staff"
]);

export const VISIT_STATUSES = Object.freeze([
  "queued",
  "checked_in",
  "in_consultation",
  "completed",
  "no_show",
  "cancelled"
]);

export const BILL_STATUSES = Object.freeze([
  "draft",
  "unpaid",
  "partially_paid",
  "paid",
  "cancelled",
  "refunded"
]);

export const IPD_STATUSES = Object.freeze([
  "admitted",
  "transferred",
  "discharged",
  "cancelled"
]);

export const NOTIFICATION_STATUSES = Object.freeze([
  "queued",
  "sent",
  "failed",
  "read"
]);
