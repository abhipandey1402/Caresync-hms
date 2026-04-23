// --- Admin Dashboard Mock Data ---
export const adminRevenueData = [
  { name: '1 Jan', OPD: 40000, Pharmacy: 24000, IPD: 24000 },
  { name: '5 Jan', OPD: 30000, Pharmacy: 13980, IPD: 22100 },
  { name: '10 Jan', OPD: 20000, Pharmacy: 9800, IPD: 22900 },
  { name: '15 Jan', OPD: 27800, Pharmacy: 3908, IPD: 20000 },
  { name: '20 Jan', OPD: 18900, Pharmacy: 4800, IPD: 21810 },
  { name: '25 Jan', OPD: 23900, Pharmacy: 3800, IPD: 25000 },
  { name: '30 Jan', OPD: 34900, Pharmacy: 4300, IPD: 21000 },
];

export const adminOpdHourlyData = [
  { time: '9AM', patients: 2 },
  { time: '11AM', patients: 14 },
  { time: '1PM', patients: 8 },
  { time: '3PM', patients: 5 },
  { time: '5PM', patients: 11 },
  { time: '7PM', patients: 4 },
];

export const adminTodayOpd = [
  { token: 39, name: 'Ramesh Kumar', dr: 'Dr. Raj', status: 'Wait' },
  { token: 40, name: 'Sunita Devi', dr: 'Dr. Raj', status: 'Wait' },
  { token: 41, name: 'Amit Verma', dr: 'Dr. Raj', status: 'Wait' },
];

export const adminActiveIpd = [
  { name: 'Ramesh Kumar', bed: 'G-03', day: 3, dr: 'Dr. Sharma' },
  { name: 'Sunita Devi', bed: 'P-01', day: 1, dr: 'Dr. Gupta', tag: 'A' },
];

export const adminPharmacyExpiring = [
  { name: 'Azithromycin 500mg', exp: '15 Feb 2024', qty: 45 },
  { name: 'Paracetamol 500mg', exp: '28 Mar 2024', qty: 200 },
];

export const adminPharmacyLowStock = [
  { name: 'Amoxicillin 250mg', qty: 8, min: 20 },
];

export const adminDoctorCollection = [
  { name: 'Dr. Rajesh Sharma', opd: 22, collected: '₹44,000', progress: '52%', opacity: '100%' },
  { name: 'Dr. Priya Gupta', opd: 20, collected: '₹40,500', progress: '48%', opacity: '60%' },
];

export const adminRecentTransactions = [
  { status: '✅', name: 'Ramesh Kumar', amount: '1,200', time: '10:42 AM', details: 'OPD + Medicines · Cash' },
  { status: '✅', name: 'Sunita Devi', amount: '800', time: '10:38 AM', details: 'OPD Consultation · UPI' },
  { status: '⏳', name: 'Amit Verma', amount: '3,400', time: '10:15 AM', details: 'IPD Day 2 · ₹1,200 due', amountColor: 'text-brand-gold' },
  { status: '✅', name: 'Priya Singh', amount: '500', time: '09:55 AM', details: 'Pharmacy · Cash' },
];

// --- Doctor Dashboard Mock Data ---
export const doctorWeeklyData = [
  { day: 'Mon', count: 24 },
  { day: 'Tue', count: 28 },
  { day: 'Wed', count: 32 },
  { day: 'Thu', count: 42 },
  { day: 'Fri', count: 0 },
  { day: 'Sat', count: 0 },
  { day: 'Sun', count: 0 },
];

export const doctorQueue = [
  { token: 39, name: 'Sunita Devi', status: 'Next' },
  { token: 40, name: 'Amit Verma', status: 'Wait' },
  { token: 41, name: 'Priya Singh', status: 'Wait' },
  { token: 42, name: 'Mohan Lal', status: 'Wait' },
];

export const doctorFollowUps = [
  { time: '10:00 AM', name: 'Sunita Devi', id: 'P-00034', reason: 'Diabetes follow-up', status: 'overdue' },
  { time: '12:00 PM', name: 'Amit Verma', id: 'P-00091', reason: 'Post-surgery check', status: 'upcoming' },
  { time: '03:00 PM', name: 'Priya Singh', id: 'P-00156', reason: 'Routine check', status: 'later' },
  { time: '05:00 PM', name: 'Mohan Lal', id: 'P-00203', reason: 'BP monitoring', status: 'later' },
];

export const doctorIpdPatients = [
  { name: 'Ramesh Kumar', bed: 'G-03', day: 3, dx: 'Dengue Fever' },
  { name: 'Amit Singh', bed: 'G-07', day: 5, dx: 'Appendicitis' },
  { name: 'Vikram Das', bed: 'P-02', day: 1, dx: 'Malaria' },
];

// --- Receptionist Dashboard Mock Data ---
export const receptionistOpdQueue = [
  { token: 39, name: 'Ramesh Kumar', dr: 'Dr. Sharma', status: 'Wait', dept: 'General' },
  { token: 40, name: 'Sunita Devi', dr: 'Dr. Gupta', status: 'Next', dept: 'Ortho' },
  { token: 41, name: 'Amit Verma', dr: 'Dr. Sharma', status: 'Wait', dept: 'General' },
  { token: 42, name: 'Priya Singh', dr: 'Dr. Gupta', status: 'Wait', dept: 'Ortho' },
];

export const receptionistPendingCollection = [
  { name: 'Ramesh Kumar', amount: '3,400', reason: 'IPD Day 3' },
  { name: 'Sunita Devi', amount: '1,200', reason: 'OPD + Pharma' },
  { name: 'Amit Singh', amount: '800', reason: 'OPD Consultation' },
  { name: 'Priya Devi', amount: '450', reason: 'Pharmacy Balance' },
];

export const receptionistRegistrations = [
  { name: 'Ramesh Kumar', id: 'P-00204', time: '10:42 AM' },
  { name: 'Sunita Devi', id: 'P-00203', time: '09:15 AM' },
  { name: 'Amit Verma', id: 'P-00202', time: '08:30 AM' },
];

// --- Pharmacist Dashboard Mock Data ---
export const pharmacyExpiryAlerts = [
  { name: 'Azithromycin 500mg', batch: 'B2401', exp: '15 Feb 2024', qty: 45, status: 'red', days: 28 },
  { name: 'Paracetamol 500mg', batch: 'P892', exp: '28 Mar 2024', qty: 200, status: 'gold', days: 70 },
  { name: 'Metformin 500mg', batch: 'M441', exp: '05 Apr 2024', qty: 80, status: 'gold', days: 78 },
];

export const pharmacyLowStock = [
  { name: 'Amoxicillin 250mg', qty: 8, min: 20, supplier: 'Pharma Dist. Co' },
  { name: 'ORS Sachets', qty: 15, min: 50, supplier: 'MediCorp' },
  { name: 'Pantoprazole 40mg', qty: 22, min: 30, supplier: 'HealthCare Inc' },
  { name: 'Cetirizine 10mg', qty: 12, min: 40, supplier: 'Pharma Dist. Co' },
];

export const pharmacySalesLog = [
  { id: 'INV-1042', time: '10:42 AM', items: 3, amt: '450' },
  { id: 'INV-1041', time: '10:15 AM', items: 1, amt: '120' },
  { id: 'INV-1040', time: '09:55 AM', items: 5, amt: '1,200' },
  { id: 'INV-1039', time: '09:30 AM', items: 2, amt: '280' },
];

export const pharmacyTopSelling = [
  { name: 'Paracetamol 500mg', qty: 340, rev: '₹3,400', pct: 85 },
  { name: 'Azithromycin 500mg', qty: 120, rev: '₹4,800', pct: 65 },
  { name: 'Pantoprazole 40mg', qty: 85, rev: '₹2,550', pct: 45 },
];

// --- Nurse Dashboard Mock Data ---
export const nurseIpdBeds = [
  { bed: 'G-01', status: 'vacant' },
  { bed: 'G-02', status: 'vacant' },
  { bed: 'G-03', status: 'occupied', patient: 'Ramesh Kumar', dr: 'Dr. Sharma', dx: 'Dengue' },
  { bed: 'G-04', status: 'cleaning' },
  { bed: 'G-05', status: 'vacant' },
  { bed: 'G-06', status: 'vacant' },
  { bed: 'G-07', status: 'occupied', patient: 'Amit Singh', dr: 'Dr. Gupta', dx: 'Appendicitis' },
  { bed: 'G-08', status: 'occupied', patient: 'Raju Verma', dr: 'Dr. Sharma', dx: 'Malaria' },
];

export const nursePendingVitals = [
  { time: '10:00 AM', bed: 'G-03', patient: 'Ramesh Kumar', type: 'Routine Vitals' },
  { time: '10:30 AM', bed: 'G-07', patient: 'Amit Singh', type: 'BP & Sugar' },
  { time: '11:00 AM', bed: 'P-01', patient: 'Sunita Devi', type: 'Routine Vitals', overdue: true },
];

export const nurseMedicationSchedule = [
  { time: '09:00 AM', bed: 'G-03', patient: 'Ramesh Kumar', med: 'Paracetamol 500mg', route: 'Oral', status: 'done' },
  { time: '12:00 PM', bed: 'G-07', patient: 'Amit Singh', med: 'Ceftriaxone 1g', route: 'IV', status: 'pending' },
  { time: '02:00 PM', bed: 'P-01', patient: 'Sunita Devi', med: 'Pantoprazole 40mg', route: 'IV', status: 'pending' },
];

export const nurseDailyCharges = [
  { bed: 'G-03', patient: 'Ramesh Kumar', amt: '₹1,500', status: 'posted' },
  { bed: 'G-07', patient: 'Amit Singh', amt: '₹2,200', status: 'pending' },
  { bed: 'P-01', patient: 'Sunita Devi', amt: '₹3,500', status: 'posted' },
];

// --- Notification Center Mock Data ---
export const allNotifications = [
  {
    id: 1,
    type: 'alert',
    title: 'Azithromycin expiring in 28 days',
    message: 'Batch BAT2024001 · Qty: 45',
    source: 'Pharmacy',
    time: '2 hours ago',
    dateGroup: 'TODAY',
    unread: true,
    action: { label: 'View Stock', href: '/dashboard/pharmacy' }
  },
  {
    id: 2,
    type: 'billing',
    title: 'Pending bill: Ramesh Kumar ₹2,400',
    message: 'Bill #202401-0042',
    source: 'Billing',
    time: '3 hours ago',
    dateGroup: 'TODAY',
    unread: true,
    action: { label: 'Collect', href: '/dashboard/billing' }
  },
  {
    id: 3,
    type: 'system',
    title: 'Dr. Gupta added successfully',
    message: 'Role: Doctor · Assigned to Ortho',
    source: 'Settings',
    time: 'Yesterday 4:30 PM',
    dateGroup: 'YESTERDAY',
    unread: false
  },
  {
    id: 4,
    type: 'ipd',
    title: 'Discharge due for Amit Singh',
    message: 'Bed: G07 · Pending clearance',
    source: 'IPD',
    time: 'Yesterday 10:00 AM',
    dateGroup: 'YESTERDAY',
    unread: false,
    action: { label: 'View Patient', href: '/dashboard/ipd' }
  }
];

export const nurseVitalsDue = [
  { name: 'Ramesh Kumar', bed: 'G03', dr: 'Dr. Sharma', time: 'Last: Yesterday 8 PM' },
  { name: 'Sunita Devi', bed: 'P01', dr: 'Dr. Gupta', time: 'Last: None (New Admit)' },
  { name: 'Amit Singh', bed: 'G07', dr: 'Dr. Sharma', time: 'Last: Yesterday 10 PM' },
  { name: 'Vikram Das', bed: 'P02', dr: 'Dr. Gupta', time: 'Last: Today 6 AM' },
];

export const nursePendingCharges = [
  { name: 'Ramesh Kumar', bed: 'G03', day: 3 },
  { name: 'Amit Singh', bed: 'G07', day: 5 },
];
