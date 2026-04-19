export const comparisonConfig = {
  headers: ["Feature", "CareSync", "Practo/Marg/eHospital", "Paper/Excel"],
  rows: [
    { feature: "Hindi interface", caresync: { val: "Full Hindi UI", pass: true }, comp: { val: "English only", pass: false }, paper: { val: "N/A", pass: false } },
    { feature: "Offline mode", caresync: { val: "Full offline", pass: true }, comp: { val: "Internet required", pass: false }, paper: { val: "Yes", pass: true } },
    { feature: "WhatsApp billing", caresync: { val: "Auto, 30 seconds", pass: true }, comp: { val: "Manual export", pass: false }, paper: { val: "None", pass: false } },
    { feature: "Price", caresync: { val: "₹999–₹2,499/mo", pass: true }, comp: { val: "₹5k–₹20k/mo", pass: false }, paper: { val: "Free but inefficient", pass: true } },
    { feature: "ABDM/ABHA", caresync: { val: "Built-in", pass: true }, comp: { val: "Add-on", pass: "warn" }, paper: { val: "None", pass: false } },
    { feature: "In-person onboarding", caresync: { val: "Free, in Hindi", pass: true }, comp: { val: "Remote only", pass: false }, paper: { val: "N/A", pass: null } },
    { feature: "Local support", caresync: { val: "Hindi phone", pass: true }, comp: { val: "English chat", pass: false }, paper: { val: "N/A", pass: null } },
    { feature: "Works on mobile", caresync: { val: "PWA", pass: true }, comp: { val: "Partial", pass: "warn" }, paper: { val: "None", pass: false } },
    { feature: "Expiry alerts", caresync: { val: "WhatsApp 30/60/90 days", pass: true }, comp: { val: "Basic", pass: "warn" }, paper: { val: "None", pass: false } },
    { feature: "IPD management", caresync: { val: "Included", pass: true }, comp: { val: "Included", pass: true }, paper: { val: "Manual registers", pass: null } },
    { feature: "Setup time", caresync: { val: "2 days", pass: true }, comp: { val: "2–3 weeks", pass: false }, paper: { val: "Instant", pass: true } }
  ]
};
