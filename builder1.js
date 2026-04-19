import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseSrc = path.join(__dirname, 'apps/web/src');

const mkdir = (dir) => fs.mkdirSync(path.join(baseSrc, dir), { recursive: true });
mkdir('config');
mkdir('hooks');
mkdir('components/ui');
mkdir('components/sections');
mkdir('components/layout');

const files = {};

// ---------------- CONFIGS ---------------- //

files['config/nav.config.js'] = `
export const navConfig = {
  brand: "CareSync",
  badge: "HMS",
  links: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Resources", href: "#resources" }
  ],
  abdmBadge: "ABDM Compliant",
  ctas: [
    { label: "Watch Demo", variant: "ghost", href: "#demo" },
    { label: "Start Free Trial", variant: "primary", href: "#pricing" }
  ]
};
`;

files['config/features.config.js'] = `
export const featuresConfig = [
  {
    id: "billing",
    badge: "OPD & Billing",
    heading: "From patient walks in to WhatsApp bill — under 2 minutes",
    body: "Register patient, assign OPD token, record vitals, write prescription, generate GST invoice — all in one flow. The receptionist, nurse, and doctor each see only their relevant screen.",
    bullets: [
      "Auto token queue with live board display",
      "GST invoice with CGST + SGST breakdown",
      "WhatsApp delivery — patient gets PDF instantly",
      "Offline: works even without internet, syncs later"
    ],
    imageAlign: "right",
    iconName: "Hospital"
  },
  {
    id: "pharmacy",
    badge: "Pharmacy & Stock",
    heading: "Never lose money to expired medicine again",
    body: "Track every batch, every expiry date. CareSync alerts you 30, 60, and 90 days before expiry. Stock deducts automatically on every sale — FIFO from oldest batch first.",
    bullets: [
      "10,000+ medicines pre-loaded in the system",
      "Batch + expiry tracking with WhatsApp alerts",
      "Auto FIFO deduction on sale",
      "Schedule H compliance built in"
    ],
    imageAlign: "left",
    iconName: "Pill"
  },
  {
    id: "rx",
    badge: "Digital Prescriptions",
    heading: "Write a complete Rx in 60 seconds",
    body: "Medicine autocomplete from 10,000+ drugs, ICD-10 diagnosis codes, your personal templates for common cases. Prescription PDF with Hindi instructions sent to patient WhatsApp automatically.",
    bullets: [
      "Medicine autocomplete — type 3 letters, pick from 10,000+ drugs",
      "Save and recall your personal Rx templates",
      "Hindi medicine instructions on the prescription",
      "Doctor's MCI registration printed — legally compliant"
    ],
    imageAlign: "right",
    iconName: "Clipboard"
  },
  {
    id: "ipd",
    badge: "IPD & Bed Management",
    heading: "Know exactly which bed is occupied — in real time",
    body: "Visual bed map for every ward. Admit, track daily charges, discharge, and generate final bill in one flow. Deposit tracked, balance auto-calculated on discharge.",
    bullets: [
      "Visual bed map: available / occupied / maintenance",
      "Daily charge sheet for services and medicines",
      "Final IPD bill generated automatically on discharge",
      "WhatsApp discharge summary to patient"
    ],
    imageAlign: "left",
    iconName: "Bed"
  },
  {
    id: "dashboard",
    badge: "Reports & Dashboard",
    heading: "Check today's earnings on your phone at 10 PM",
    body: "The owner dashboard shows today's OPD count, revenue, pending dues, and bed occupancy — instantly, every time you open the app. Export revenue reports to CSV or get them on WhatsApp.",
    bullets: [
      "Today's revenue, OPD count, pending dues — at a glance",
      "Doctor-wise collection report",
      "Export to CSV — delivered on WhatsApp",
      "5-minute cache so it loads in under 1 second"
    ],
    imageAlign: "right",
    iconName: "BarChart"
  },
  {
    id: "offline",
    badge: "Works Offline",
    heading: "Internet down? CareSync still works",
    body: "Built specifically for Tier-2/3 cities where internet is unreliable. Register patients, create bills, write prescriptions — all offline. Everything syncs automatically when connection returns.",
    bullets: [
      "Full PWA — installs on Android like an app",
      "Offline patient registration and billing",
      "Auto-sync when internet returns (no manual action)",
      "\\"3 records pending sync\\" badge shows clearly"
    ],
    imageAlign: "left",
    iconName: "WifiOff"
  }
];
`;

files['config/pricing.config.js'] = `
export const pricingConfig = {
  plans: [
    {
      id: "starter",
      name: "STARTER",
      priceMonthly: 999,
      priceAnnual: 9999,
      target: "Solo clinic or single doctor",
      featured: false,
      features: [
        { name: "Patient registration + OPD", active: true },
        { name: "GST billing + WhatsApp receipts", active: true },
        { name: "Digital prescriptions (EMR)", active: true },
        { name: "Basic pharmacy stock", active: true },
        { name: "1 doctor, 2 staff logins", active: true },
        { name: "Owner mobile dashboard", active: true },
        { name: "ABHA ID creation", active: true },
        { name: "Hindi + English UI", active: true },
        { name: "IPD / bed management", active: false },
        { name: "Lab module", active: false }
      ],
      cta: "Start Free Trial",
      ctaVariant: "outline"
    },
    {
      id: "pro",
      name: "PRO",
      badge: "MOST POPULAR",
      priceMonthly: 2499,
      priceAnnual: 24999,
      target: "Nursing home or multi-doctor clinic",
      featured: true,
      features: [
        { name: "Everything in Starter", active: true, strong: true },
        { name: "IPD + bed management (30 beds)", active: true },
        { name: "Up to 5 doctor logins", active: true },
        { name: "Staff attendance & shifts", active: true },
        { name: "TPA & insurance billing", active: true },
        { name: "Lab / diagnostic module", active: true },
        { name: "Referral doctor tracking", active: true },
        { name: "Advanced reports + export", active: true }
      ],
      cta: "Start Free Trial",
      ctaVariant: "primary"
    },
    {
      id: "enterprise",
      name: "ENTERPRISE",
      priceMonthly: 5999,
      priceAnnual: 59999,
      target: "Small hospital or chain",
      featured: false,
      features: [
        { name: "Everything in Pro", active: true, strong: true },
        { name: "Unlimited beds & doctors", active: true },
        { name: "Multi-branch management", active: true },
        { name: "NABH compliance modules", active: true },
        { name: "Advanced BI & analytics", active: true },
        { name: "Dedicated account manager", active: true },
        { name: "Priority 24/7 support", active: true },
        { name: "Custom onboarding & training", active: true }
      ],
      cta: "Contact Us",
      ctaVariant: "outline"
    }
  ],
  addons: [
    "WhatsApp API +₹299/mo",
    "SMS Pack (1000) +₹199/mo",
    "Data Migration ₹2,000 one-time",
    "On-site Training ₹3,000"
  ],
  faq: [
    {
      q: "Do I need internet to use CareSync?",
      a: "No. CareSync works offline for all core features — patient registration, billing, prescriptions. Everything syncs automatically when internet returns."
    },
    {
      q: "Is the 3-month trial really free?",
      a: "Yes, completely free. No credit card. Full access to all features of your chosen plan. Our team will set it up for you in person."
    },
    {
      q: "Can I use CareSync in Hindi?",
      a: "Yes. CareSync has a full Hindi interface — toggle between Hindi and English anytime. Prescription instructions are also printed in Hindi for patients."
    },
    {
      q: "Does CareSync work on mobile?",
      a: "Yes. CareSync is a Progressive Web App — install it on any Android phone from the browser. The owner dashboard is designed specifically for mobile."
    },
    {
      q: "Is our patient data safe?",
      a: "All data is stored on AWS Mumbai servers (within India). Encrypted at rest and in transit. Compliant with India's Digital Personal Data Protection Act 2023."
    }
  ]
};
`;

files['config/testimonials.config.js'] = `
export const testimonialsConfig = [
  {
    id: 1,
    quote: "पहले हर दिन billing में 2 घंटे जाते थे। अब 30 seconds में WhatsApp पर bill चला जाता है। CareSync ने हमारा काम बदल दिया।",
    author: "Dr. Rajesh Sharma",
    clinic: "Sharma Nursing Home, Patna",
    stars: 5,
    meta: "8 months on CareSync · Pro Plan"
  },
  {
    id: 2,
    quote: "Internet नहीं था तो भी system चलता रहा। Patient register हो गए, bill बन गए — सब sync हो गया बाद में। यही चाहिए था हमें।",
    author: "Dr. Priya Singh",
    clinic: "Singh Polyclinic, Gorakhpur",
    stars: 5,
    meta: "5 months on CareSync · Starter Plan"
  },
  {
    id: 3,
    quote: "Medicine expiry alerts की वजह से पिछले 6 महीने में ₹60,000 का नुकसान बचा। Pharmacy module अकेला ही पैसा वसूल है।",
    author: "Dr. Amit Verma",
    clinic: "Verma Hospital, Muzaffarpur",
    stars: 5,
    meta: "11 months on CareSync · Pro Plan"
  }
];
`;

files['config/stats.config.js'] = `
export const statsConfig = [
  { value: 200, label: "Clinics", suffix: "+" },
  { value: 50000, label: "Patients Registered", suffix: "+" },
  { value: 250000, label: "Bills Generated", suffix: "+" },
  { value: 8, label: "Cities Covered", suffix: "" },
  { value: 99.4, label: "Uptime", suffix: "%", decimals: 1 },
  { value: 4.9, label: "Rating", suffix: "★", decimals: 1 }
];
`;

files['config/steps.config.js'] = `
export const stepsConfig = [
  {
    icon: "ClipboardSignature",
    title: "Register (Day 1)",
    desc: "Sign up online. Our team calls you within 2 hours to understand your clinic's setup."
  },
  {
    icon: "Settings",
    title: "Setup (Day 2–3)",
    desc: "We come to your clinic (Patna, Lucknow, or your city), set up the system, and train your staff in Hindi."
  },
  {
    icon: "Rocket",
    title: "Go Live (Day 4)",
    desc: "Your receptionist registers patients. Doctor writes digital Rx. Bills go to WhatsApp. You're live."
  },
  {
    icon: "PhoneCall",
    title: "Support (Always)",
    desc: "WhatsApp and phone support in Hindi. We're always 1 call away. Not a chatbot."
  }
];
`;

files['config/comparison.config.js'] = `
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
`;

files['config/theme.config.js'] = `
export const themeConfig = {
  colors: {
    bg: '#FAFDF9',
    green: '#1A6B3C',
    greenMid: '#2E9B59',
    gold: '#E8A020',
    text: '#0F1F17',
    textSec: '#4A6258',
    muted: '#EDF4EF',
    border: '#C8DDD0',
  }
};
`;

// ---------------- HOOKS ---------------- //
files['hooks/useScrollHeader.js'] = `
import { useState, useEffect } from 'react';

export function useScrollHeader(threshold = 80) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
`;

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseSrc, file), content.trim() + '\\n');
});

console.log('Configs and Hooks generated successfully!');
