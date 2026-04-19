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
