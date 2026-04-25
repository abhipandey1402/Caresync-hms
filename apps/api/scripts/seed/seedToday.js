import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import { 
  Visit, Bill, Patient, User, Inventory, Sequence 
} from '../../src/models/index.js';
import { initializeEnv } from "../../src/config/env.js";

const TENANT_ID = '69ea1192134323948b328ae9';

async function seedToday() {
  initializeEnv();
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const patients = await Patient.find({ tenantId: TENANT_ID }).limit(100);
  const doctors = await User.find({ tenantId: TENANT_ID, role: 'doctor' });
  const inventories = await Inventory.find({ tenantId: TENANT_ID });

  if (patients.length === 0 || doctors.length === 0) {
    console.error('No patients or doctors found for seeding today. Run masterSeeder first.');
    process.exit(1);
  }

  const today = new Date();
  const startOfToday = dayjs().startOf('day').toDate();
  const endOfToday = dayjs().endOf('day').toDate();

  console.log(`Seeding data for TODAY: ${dayjs().format('YYYY-MM-DD')}`);

  // 1. Seed Visits for Today
  const visits = [];
  for (let i = 0; i < 50; i++) {
    const doctor = faker.helpers.arrayElement(doctors);
    const patient = faker.helpers.arrayElement(patients);
    
    // Assign token number sequentially per doctor
    const tokenCount = visits.filter(v => v.doctorId === doctor._id).length + 1;

    visits.push({
      tenantId: TENANT_ID,
      patientId: patient._id,
      doctorId: doctor._id,
      visitDate: faker.date.between({ from: startOfToday, to: endOfToday }),
      type: faker.helpers.arrayElement(['opd', 'follow_up', 'emergency']),
      status: faker.helpers.arrayElement(['queued', 'checked_in', 'in_consultation', 'completed']),
      tokenNumber: tokenCount,
      chiefComplaint: faker.lorem.sentence(),
      vitals: {
        pulse: faker.number.int({ min: 60, max: 100 }),
        systolicBp: faker.number.int({ min: 110, max: 140 }),
        diastolicBp: faker.number.int({ min: 70, max: 90 }),
        temperatureF: faker.number.float({ min: 97, max: 99, fractionDigits: 1 }),
        weight: faker.number.int({ min: 50, max: 90 }),
        height: faker.number.int({ min: 150, max: 185 }),
        recordedAt: new Date()
      }
    });
  }
  await Visit.insertMany(visits);
  console.log(`Seeded ${visits.length} visits for today.`);

  // 2. Seed Bills for Today
  const bills = [];
  const ym = dayjs().format('YYYYMM');
  for (let i = 0; i < 50; i++) {
    const patient = faker.helpers.arrayElement(patients);
    const total = faker.number.int({ min: 50000, max: 500000 }); // in paise
    const amountPaid = faker.helpers.arrayElement([0, total, Math.floor(total / 2)]);
    
    bills.push({
      tenantId: TENANT_ID,
      patientId: patient._id,
      billNumber: `BILL-${ym}-${2000 + i}`,
      status: amountPaid === total ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid',
      type: 'opd',
      total,
      amountPaid,
      balance: total - amountPaid,
      lineItems: [
        { 
          description: 'OPD Consultation', 
          quantity: 1, 
          rate: total, 
          gstRate: 0, 
          baseAmount: total, 
          gstAmount: 0, 
          totalAmount: total,
          cgst: 0, sgst: 0, igst: 0
        }
      ],
      subtotal: total,
      totalTax: 0,
      taxBreakup: { cgst: 0, sgst: 0, igst: 0 },
      discount: 0,
      finalizedAt: new Date(),
      createdAt: new Date(),
      invoiceDeliveryStatus: 'sent'
    });
  }
  await Bill.insertMany(bills);
  console.log(`Seeded ${bills.length} bills for today.`);

  // 3. Seed Pharmacy Sales for Today
  if (inventories.length > 0) {
    const pharmacySales = [];
    for (let i = 0; i < 50; i++) {
      const patient = faker.helpers.arrayElement(patients);
      const total = faker.number.int({ min: 20000, max: 100000 });
      const amountPaid = total;

      pharmacySales.push({
        tenantId: TENANT_ID,
        patientId: patient._id,
        billNumber: `PHM-${ym}-${3000 + i}`,
        status: 'paid',
        type: 'pharmacy',
        total,
        amountPaid,
        balance: 0,
        lineItems: [
          { 
            description: faker.helpers.arrayElement(inventories).medicineName, 
            quantity: 2, 
            rate: total / 2, 
            gstRate: 12, 
            baseAmount: Math.round((total / 2) * 2 / 1.12), 
            gstAmount: Math.round(((total / 2) * 2 / 1.12) * 0.12),
            totalAmount: total,
            cgst: 0, sgst: 0, igst: 0
          }
        ],
        subtotal: total,
        totalTax: 0,
        taxBreakup: { cgst: 0, sgst: 0, igst: 0 },
        finalizedAt: new Date(),
        createdAt: new Date(),
        invoiceDeliveryStatus: 'sent'
      });
    }
    await Bill.insertMany(pharmacySales);
    console.log(`Seeded ${pharmacySales.length} pharmacy sales for today.`);
  }

  process.exit(0);
}

seedToday();
