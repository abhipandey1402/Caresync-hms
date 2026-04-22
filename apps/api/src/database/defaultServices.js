export const DEFAULT_SERVICE_CATALOG = Object.freeze([
  {
    code: "OPD_CONSULTATION",
    name: "OPD Consultation",
    sacCode: "999312",
    gstRate: 0,
    defaultRate: 200,
    unit: "visit",
    category: "consultation"
  },
  {
    code: "FOLLOW_UP_CONSULTATION",
    name: "Follow-up Consultation",
    sacCode: "999312",
    gstRate: 0,
    defaultRate: 100,
    unit: "visit",
    category: "consultation"
  },
  {
    code: "ECG",
    name: "ECG",
    sacCode: "999312",
    gstRate: 12,
    defaultRate: 300,
    unit: "procedure",
    category: "diagnostics"
  },
  {
    code: "XRAY_CHEST",
    name: "X-Ray (Chest)",
    sacCode: "999312",
    gstRate: 12,
    defaultRate: 400,
    unit: "procedure",
    category: "diagnostics"
  },
  {
    code: "CBC",
    name: "Blood Test (CBC)",
    sacCode: "999312",
    gstRate: 0,
    defaultRate: 250,
    unit: "test",
    category: "diagnostics"
  },
  {
    code: "DRESSING_MINOR",
    name: "Dressing (Minor)",
    sacCode: "999312",
    gstRate: 5,
    defaultRate: 150,
    unit: "procedure",
    category: "procedure"
  },
  {
    code: "IV_INJECTION",
    name: "IV Injection",
    sacCode: "999312",
    gstRate: 5,
    defaultRate: 100,
    unit: "procedure",
    category: "procedure"
  },
  {
    code: "NEBULIZATION",
    name: "Nebulization",
    sacCode: "999312",
    gstRate: 5,
    defaultRate: 200,
    unit: "procedure",
    category: "procedure"
  },
  {
    code: "ROOM_GENERAL",
    name: "Room Charge (General)",
    sacCode: "999211",
    gstRate: 12,
    defaultRate: 1000,
    unit: "day",
    category: "room"
  },
  {
    code: "ROOM_PRIVATE",
    name: "Room Charge (Private)",
    sacCode: "999211",
    gstRate: 12,
    defaultRate: 3000,
    unit: "day",
    category: "room"
  },
  {
    code: "ICU_CHARGE",
    name: "ICU Charge",
    sacCode: "999211",
    gstRate: 12,
    defaultRate: 5000,
    unit: "day",
    category: "room"
  },
  {
    code: "OT_CHARGE",
    name: "OT Charge",
    sacCode: "999312",
    gstRate: 18,
    defaultRate: 5000,
    unit: "procedure",
    category: "procedure"
  }
]);

const buildNow = () => new Date();

export const buildDefaultServicesForTenant = (tenantId, now = buildNow()) =>
  DEFAULT_SERVICE_CATALOG.map((service) => ({
    tenantId,
    ...service,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }));
