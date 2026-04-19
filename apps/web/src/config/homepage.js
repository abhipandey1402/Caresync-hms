const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export const homepageConfig = {
  theme: {
    accent: "#2f8f71",
    accentStrong: "#1e6c55",
    accentSoft: "#dff4eb",
    ink: "#16322a",
    muted: "#587269",
    line: "rgba(62, 108, 92, 0.16)",
    canvas: "#f4fbf7",
    surface: "rgba(255, 255, 255, 0.82)",
    surfaceStrong: "#ffffff",
    glow: "rgba(74, 168, 132, 0.24)",
  },
  nav: {
    brand: "CareSync HMS",
    subtext: "Clinical operations platform",
    links: [
      { label: "Modules", href: "#modules" },
      { label: "Workflow", href: "#workflow" },
      { label: "Why CareSync", href: "#why-caresync" },
    ],
    cta: { label: "Book Demo", href: "#demo" },
  },
  hero: {
    eyebrow: "Connected hospital management",
    title: "A calmer operating layer for modern hospitals, clinics, and multispeciality centers.",
    description:
      "CareSync HMS connects front desk, doctors, pharmacy, billing, diagnostics, and administration in one lightweight system so teams move faster with fewer handoff errors.",
    actions: [
      { label: "Request a walkthrough", href: "#demo", variant: "primary" },
      { label: "Explore modules", href: "#modules", variant: "ghost" },
    ],
    highlights: [
      "OPD, IPD, OT, lab, pharmacy, and billing in one workflow",
      "Role-based views for reception, clinicians, nurses, and admin",
      `API-ready foundation with base URL: ${apiBaseUrl}`,
    ],
    panel: {
      label: "Live care operations",
      title: "Every patient touchpoint, synced.",
      items: [
        { title: "Admissions", value: "06 active", meta: "Beds and wards updated in real time" },
        { title: "Consult queue", value: "18 today", meta: "Doctor rooms balanced by load" },
        { title: "Discharge TAT", value: "32 min", meta: "Billing, pharmacy, and summary aligned" },
      ],
    },
  },
  trustBar: [
    "Outpatient registration",
    "Inpatient administration",
    "Nursing coordination",
    "Diagnostic turnaround",
    "Revenue visibility",
  ],
  metrics: {
    id: "why-caresync",
    eyebrow: "Operational clarity",
    title: "Built for the rhythm of clinical teams.",
    description:
      "The interface stays light and readable, while the data model stays structured enough for scale, reporting, and future integrations.",
    items: [
      { value: "360°", label: "patient journey coverage" },
      { value: "24/7", label: "visibility across departments" },
      { value: "Role-based", label: "access for every care unit" },
      { value: "Config-driven", label: "sections and themes ready to extend" },
    ],
  },
  modules: {
    id: "modules",
    eyebrow: "Core modules",
    title: "Everything the hospital floor expects, without a cluttered interface.",
    description:
      "Each module is designed as a reusable product block so the experience can expand without breaking visual consistency.",
    items: [
      {
        title: "Patient administration",
        description: "Registration, appointments, UHID creation, demographics, insurance, and visit history.",
      },
      {
        title: "Clinical desk",
        description: "Doctor notes, care plans, prescriptions, vitals, and visit summaries in one surface.",
      },
      {
        title: "Ward and bed management",
        description: "Admissions, transfers, occupancy, nursing coordination, and discharge readiness tracking.",
      },
      {
        title: "Diagnostics and pharmacy",
        description: "Lab requests, report status, medicine issue, stock awareness, and turnaround tracking.",
      },
      {
        title: "Billing and TPA workflows",
        description: "Package billing, invoices, approvals, payment tracking, and settlement visibility.",
      },
      {
        title: "Admin analytics",
        description: "Department-level snapshots for operations, collections, throughput, and service quality.",
      },
    ],
  },
  workflow: {
    id: "workflow",
    eyebrow: "Connected flow",
    title: "One patient journey, four clean stages.",
    steps: [
      {
        index: "01",
        title: "Register and schedule",
        description: "Capture the patient once, then route them into consultation, admission, or diagnostic flows.",
      },
      {
        index: "02",
        title: "Coordinate care delivery",
        description: "Doctors, nurses, and support teams work from the same status-aware record instead of fragmented updates.",
      },
      {
        index: "03",
        title: "Trigger services and billing",
        description: "Pharmacy, lab, procedures, and finance stay tied to the active encounter without duplicate entry.",
      },
      {
        index: "04",
        title: "Close with confidence",
        description: "Discharge paperwork, final billing, and reporting complete from a single operational thread.",
      },
    ],
  },
  story: {
    id: "story",
    eyebrow: "Why teams adopt it",
    title: "Clinical, administrative, and finance teams all read the same system differently and still stay aligned.",
    points: [
      "Reception teams get faster registration and queue management.",
      "Doctors and nurses get cleaner encounter context and bedside continuity.",
      "Operations leaders get occupancy, service movement, and discharge visibility.",
      "Finance teams get fewer missed charge entries and a clearer billing trail.",
    ],
  },
  testimonial: {
    quote:
      "CareSync feels like software built around how a hospital actually moves. The screens are clean, but the workflow depth is there.",
    author: "Operations Lead",
    role: "Mid-size multispeciality hospital",
  },
  cta: {
    id: "demo",
    eyebrow: "Launch foundation",
    title: "Use this homepage as the front door for a broader HMS platform.",
    description:
      "The layout is modular, the content is centralized, and the visual system is ready for dashboard pages, module routes, and future branding updates.",
    primaryAction: { label: "Start building modules", href: "#modules" },
    secondaryAction: { label: "Contact implementation team", href: "mailto:hello@caresync-hms.local" },
  },
};
