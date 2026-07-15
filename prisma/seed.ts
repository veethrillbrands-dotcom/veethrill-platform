import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Veethrill database...");

  // ── PROPERTIES ──────────────────────────────────────────────────
  const props = await Promise.all([
    db.property.upsert({
      where: { id: "prop-001" },
      update: {},
      create: { id: "prop-001", name: "Veethrill Towers", type: "MIXED_USE", address: "15 Adeola Odeku Street", city: "Victoria Island", state: "Lagos", healthScore: 96, status: "ACTIVE" },
    }),
    db.property.upsert({
      where: { id: "prop-002" },
      update: {},
      create: { id: "prop-002", name: "Lekki Gardens Phase 3", type: "RESIDENTIAL", address: "Admiralty Way", city: "Lekki", state: "Lagos", healthScore: 84, status: "ACTIVE" },
    }),
    db.property.upsert({
      where: { id: "prop-003" },
      update: {},
      create: { id: "prop-003", name: "Lekki Shortlet Suites", type: "SHORTLET", address: "5 Freedom Way", city: "Lekki Phase 1", state: "Lagos", healthScore: 93, status: "ACTIVE" },
    }),
    db.property.upsert({
      where: { id: "prop-004" },
      update: {},
      create: { id: "prop-004", name: "Abuja Heights", type: "LUXURY_RESIDENTIAL", address: "Plot 2251 Herbert Macaulay Way", city: "Central Business District", state: "Abuja", healthScore: 91, status: "ACTIVE" },
    }),
    db.property.upsert({
      where: { id: "prop-005" },
      update: {},
      create: { id: "prop-005", name: "Port Harcourt Business Park", type: "COMMERCIAL", address: "35 Trans-Amadi Road", city: "Port Harcourt", state: "Rivers", healthScore: 78, status: "ACTIVE" },
    }),
    db.property.upsert({
      where: { id: "prop-006" },
      update: {},
      create: { id: "prop-006", name: "Ikoyi Residences", type: "LUXURY_RESIDENTIAL", address: "12 Bourdillon Road", city: "Ikoyi", state: "Lagos", healthScore: 98, status: "ACTIVE" },
    }),
    db.property.upsert({
      where: { id: "prop-007" },
      update: {},
      create: { id: "prop-007", name: "Wuse II Plaza", type: "COMMERCIAL", address: "Plot 831 Aminu Kano Crescent", city: "Wuse II", state: "Abuja", healthScore: 85, status: "ACTIVE" },
    }),
  ]);
  const [vt, lg, ls, ah, ph, ik, wu] = props;

  // ── UNITS ──────────────────────────────────────────────────────
  const units = await Promise.all([
    // Veethrill Towers
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-001", unitNumber: "7C" } }, update: {}, create: { propertyId: "prop-001", unitNumber: "7C", floor: 7, bedrooms: 3, bathrooms: 2, sqMeters: 120, monthlyRent: 350000, depositAmount: 700000, status: "OCCUPIED", amenities: ["AC", "Generator", "Security", "Gym"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-001", unitNumber: "3A" } }, update: {}, create: { propertyId: "prop-001", unitNumber: "3A", floor: 3, bedrooms: 2, bathrooms: 2, sqMeters: 90, monthlyRent: 280000, depositAmount: 560000, status: "OCCUPIED", amenities: ["AC", "Generator", "Security"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-001", unitNumber: "5B" } }, update: {}, create: { propertyId: "prop-001", unitNumber: "5B", floor: 5, bedrooms: 2, bathrooms: 1, sqMeters: 85, monthlyRent: 260000, depositAmount: 520000, status: "OCCUPIED", amenities: ["AC", "Generator"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-001", unitNumber: "4B" } }, update: {}, create: { propertyId: "prop-001", unitNumber: "4B", floor: 4, bedrooms: 3, bathrooms: 2, sqMeters: 110, monthlyRent: 320000, depositAmount: 640000, status: "MAINTENANCE", amenities: ["AC", "Generator", "Gym"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-001", unitNumber: "2D" } }, update: {}, create: { propertyId: "prop-001", unitNumber: "2D", floor: 2, bedrooms: 1, bathrooms: 1, sqMeters: 55, monthlyRent: 180000, depositAmount: 360000, status: "VACANT", amenities: ["AC", "Generator"] } }),
    // Lekki Gardens
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-002", unitNumber: "Block A-1" } }, update: {}, create: { propertyId: "prop-002", unitNumber: "Block A-1", floor: 1, bedrooms: 4, bathrooms: 3, sqMeters: 180, monthlyRent: 450000, depositAmount: 900000, status: "OCCUPIED", amenities: ["AC", "Generator", "Garden", "BQ"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-002", unitNumber: "Block B-2" } }, update: {}, create: { propertyId: "prop-002", unitNumber: "Block B-2", floor: 1, bedrooms: 3, bathrooms: 2, sqMeters: 140, monthlyRent: 380000, depositAmount: 760000, status: "OCCUPIED", amenities: ["AC", "Generator", "Garden"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-002", unitNumber: "Block C-3" } }, update: {}, create: { propertyId: "prop-002", unitNumber: "Block C-3", floor: 1, bedrooms: 3, bathrooms: 2, sqMeters: 140, monthlyRent: 380000, depositAmount: 760000, status: "VACANT", amenities: ["AC", "Generator"] } }),
    // Lekki Shortlet Suites
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-003", unitNumber: "Suite 1A" } }, update: {}, create: { propertyId: "prop-003", unitNumber: "Suite 1A", floor: 1, bedrooms: 2, bathrooms: 2, sqMeters: 80, monthlyRent: 0, nightlyRate: 55000, depositAmount: 0, status: "SHORTLET", amenities: ["WiFi", "AC", "Smart TV", "Kitchen"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-003", unitNumber: "Suite 2B" } }, update: {}, create: { propertyId: "prop-003", unitNumber: "Suite 2B", floor: 2, bedrooms: 1, bathrooms: 1, sqMeters: 45, monthlyRent: 0, nightlyRate: 35000, depositAmount: 0, status: "SHORTLET", amenities: ["WiFi", "AC", "Smart TV"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-003", unitNumber: "Penthouse" } }, update: {}, create: { propertyId: "prop-003", unitNumber: "Penthouse", floor: 4, bedrooms: 3, bathrooms: 3, sqMeters: 160, monthlyRent: 0, nightlyRate: 95000, depositAmount: 0, status: "SHORTLET", amenities: ["WiFi", "AC", "Smart TV", "Kitchen", "Pool Access", "Rooftop"] } }),
    // Abuja Heights
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-004", unitNumber: "PH 1" } }, update: {}, create: { propertyId: "prop-004", unitNumber: "PH 1", floor: 12, bedrooms: 4, bathrooms: 4, sqMeters: 280, monthlyRent: 800000, depositAmount: 1600000, status: "OCCUPIED", amenities: ["AC", "Generator", "Security", "Pool", "Gym", "Concierge"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-004", unitNumber: "Apt 6A" } }, update: {}, create: { propertyId: "prop-004", unitNumber: "Apt 6A", floor: 6, bedrooms: 3, bathrooms: 3, sqMeters: 160, monthlyRent: 600000, depositAmount: 1200000, status: "RESERVED", amenities: ["AC", "Generator", "Security", "Pool", "Gym"] } }),
    // Ikoyi
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-006", unitNumber: "Villa A" } }, update: {}, create: { propertyId: "prop-006", unitNumber: "Villa A", floor: 1, bedrooms: 5, bathrooms: 5, sqMeters: 400, monthlyRent: 1200000, depositAmount: 2400000, status: "OCCUPIED", amenities: ["AC", "Generator", "Pool", "Garden", "Security", "Smart Home"] } }),
    db.unit.upsert({ where: { propertyId_unitNumber: { propertyId: "prop-006", unitNumber: "Villa B" } }, update: {}, create: { propertyId: "prop-006", unitNumber: "Villa B", floor: 1, bedrooms: 5, bathrooms: 5, sqMeters: 420, monthlyRent: 1250000, depositAmount: 2500000, status: "VACANT", amenities: ["AC", "Generator", "Pool", "Garden", "Security"] } }),
  ]);

  const [u7c, u3a, u5b, u4b, , uA1, , , uS1A, uS2B, , uPH1, , uVA] = units;

  // ── USERS & TENANTS ──────────────────────────────────────────────
  const tenantUsers = await Promise.all([
    db.user.upsert({ where: { clerkId: "mock_chidi_001" }, update: {}, create: { clerkId: "mock_chidi_001", email: "chidi.okafor@gmail.com", firstName: "Chidi", lastName: "Okafor", phone: "+234 803 456 7890", role: "TENANT" } }),
    db.user.upsert({ where: { clerkId: "mock_ngozi_001" }, update: {}, create: { clerkId: "mock_ngozi_001", email: "ngozi.adeyemi@yahoo.com", firstName: "Ngozi", lastName: "Adeyemi", phone: "+234 807 234 5678", role: "TENANT" } }),
    db.user.upsert({ where: { clerkId: "mock_emeka_001" }, update: {}, create: { clerkId: "mock_emeka_001", email: "emeka.bello@company.ng", firstName: "Emeka", lastName: "Bello", phone: "+234 812 345 6789", role: "TENANT" } }),
    db.user.upsert({ where: { clerkId: "mock_fatima_001" }, update: {}, create: { clerkId: "mock_fatima_001", email: "fatima.abubakar@gmail.com", firstName: "Fatima", lastName: "Abubakar", phone: "+234 816 789 0123", role: "TENANT" } }),
    db.user.upsert({ where: { clerkId: "mock_tunde_001" }, update: {}, create: { clerkId: "mock_tunde_001", email: "tunde.fashola@yahoo.com", firstName: "Tunde", lastName: "Fashola", phone: "+234 802 111 2222", role: "TENANT" } }),
    db.user.upsert({ where: { clerkId: "mock_amara_001" }, update: {}, create: { clerkId: "mock_amara_001", email: "amara.okonkwo@veethrillrealty.com", firstName: "Amara", lastName: "Okonkwo", phone: "+234 803 000 0001", role: "SUPER_ADMIN" } }),
  ]);

  const [uChidi, uNgozi, uEmeka, uFatima, uTunde] = tenantUsers;

  // Tenants
  const tenants = await Promise.all([
    db.tenant.upsert({ where: { userId: uChidi.id }, update: {}, create: { userId: uChidi.id, kycStatus: "VERIFIED", employerName: "Dangote Group", emergencyContact: "Mrs. Adaeze Okafor", emergencyPhone: "+234 803 999 8888" } }),
    db.tenant.upsert({ where: { userId: uNgozi.id }, update: {}, create: { userId: uNgozi.id, kycStatus: "VERIFIED", employerName: "GTBank Plc", emergencyContact: "Mr. Kunle Adeyemi", emergencyPhone: "+234 807 777 6666" } }),
    db.tenant.upsert({ where: { userId: uEmeka.id }, update: {}, create: { userId: uEmeka.id, kycStatus: "VERIFIED", employerName: "Shell Nigeria", emergencyContact: "Mrs. Chioma Bello", emergencyPhone: "+234 812 555 4444" } }),
    db.tenant.upsert({ where: { userId: uFatima.id }, update: {}, create: { userId: uFatima.id, kycStatus: "PENDING", employerName: "FBN Holdings", emergencyContact: "Alhaji Musa Abubakar", emergencyPhone: "+234 816 333 2222" } }),
    db.tenant.upsert({ where: { userId: uTunde.id }, update: {}, create: { userId: uTunde.id, kycStatus: "VERIFIED", employerName: "Zenith Bank", emergencyContact: "Mrs. Bisi Fashola", emergencyPhone: "+234 802 111 0000" } }),
  ]);

  const [tChidi, tNgozi, tEmeka, tFatima, tTunde] = tenants;

  // ── LEASES ───────────────────────────────────────────────────────
  const leases = await Promise.all([
    db.lease.upsert({ where: { id: "lease-001" }, update: {}, create: { id: "lease-001", unitId: u7c.id, tenantId: tChidi.id, startDate: new Date("2025-08-01"), endDate: new Date("2026-07-31"), rentAmount: 350000, depositAmount: 700000, depositPaid: true, status: "ACTIVE", autoRenew: true, escalationRate: 10 } }),
    db.lease.upsert({ where: { id: "lease-002" }, update: {}, create: { id: "lease-002", unitId: u3a.id, tenantId: tNgozi.id, startDate: new Date("2024-09-01"), endDate: new Date("2026-08-31"), rentAmount: 280000, depositAmount: 560000, depositPaid: true, status: "ACTIVE", autoRenew: true, escalationRate: 10 } }),
    db.lease.upsert({ where: { id: "lease-003" }, update: {}, create: { id: "lease-003", unitId: u5b.id, tenantId: tEmeka.id, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), rentAmount: 260000, depositAmount: 520000, depositPaid: true, status: "ACTIVE", autoRenew: false } }),
    db.lease.upsert({ where: { id: "lease-004" }, update: {}, create: { id: "lease-004", unitId: uA1.id, tenantId: tFatima.id, startDate: new Date("2025-06-01"), endDate: new Date("2026-05-31"), rentAmount: 450000, depositAmount: 900000, depositPaid: true, status: "ACTIVE", autoRenew: true, escalationRate: 8 } }),
    db.lease.upsert({ where: { id: "lease-005" }, update: {}, create: { id: "lease-005", unitId: uPH1.id, tenantId: tTunde.id, startDate: new Date("2025-12-01"), endDate: new Date("2026-11-30"), rentAmount: 800000, depositAmount: 1600000, depositPaid: true, status: "ACTIVE", autoRenew: true, escalationRate: 12 } }),
  ]);

  const [l1, l2, l3, l4, l5] = leases;

  // ── PAYMENTS ─────────────────────────────────────────────────────
  await db.payment.createMany({
    skipDuplicates: true,
    data: [
      { id: "pay-001", tenantId: tChidi.id, leaseId: l1.id, amount: 350000, type: "RENT", method: "PAYSTACK", status: "PAID", reference: "VT-1720000001-AABB1", dueDate: new Date("2026-07-01"), paidAt: new Date("2026-07-01") },
      { id: "pay-002", tenantId: tNgozi.id, leaseId: l2.id, amount: 280000, type: "RENT", method: "BANK_TRANSFER", status: "PAID", reference: "VT-1720000002-BBCC2", dueDate: new Date("2026-07-01"), paidAt: new Date("2026-07-02") },
      { id: "pay-003", tenantId: tEmeka.id, leaseId: l3.id, amount: 260000, type: "RENT", method: "FLUTTERWAVE", status: "OVERDUE", reference: "VT-1720000003-CCDD3", dueDate: new Date("2026-06-01") },
      { id: "pay-004", tenantId: tFatima.id, leaseId: l4.id, amount: 450000, type: "RENT", method: "PAYSTACK", status: "PAID", reference: "VT-1720000004-DDEE4", dueDate: new Date("2026-07-01"), paidAt: new Date("2026-07-01") },
      { id: "pay-005", tenantId: tTunde.id, leaseId: l5.id, amount: 800000, type: "RENT", method: "BANK_TRANSFER", status: "OVERDUE", reference: "VT-1720000005-EEFF5", dueDate: new Date("2026-07-01") },
      { id: "pay-006", tenantId: tChidi.id, leaseId: l1.id, amount: 350000, type: "RENT", method: "PAYSTACK", status: "PAID", reference: "VT-1720000006-FFGG6", dueDate: new Date("2026-06-01"), paidAt: new Date("2026-06-01") },
      { id: "pay-007", tenantId: tNgozi.id, leaseId: l2.id, amount: 280000, type: "RENT", method: "BANK_TRANSFER", status: "PAID", reference: "VT-1720000007-GGHH7", dueDate: new Date("2026-06-01"), paidAt: new Date("2026-06-03") },
    ],
  });

  // ── WORK ORDERS ──────────────────────────────────────────────────
  await db.workOrder.createMany({
    skipDuplicates: true,
    data: [
      { id: "wo-001", propertyId: "prop-001", unitId: u4b.id, title: "AC unit complete failure", description: "Air conditioning unit in Unit 4B has stopped working completely. Tenant unable to sleep due to heat.", category: "HVAC", priority: "URGENT", status: "IN_PROGRESS", slaHours: 4, estimatedCost: 120000 },
      { id: "wo-002", propertyId: "prop-002", title: "Generator service — 6 month", description: "6-month scheduled maintenance for Block B generator.", category: "ELECTRICAL", priority: "ROUTINE", status: "ASSIGNED", slaHours: 336, estimatedCost: 65000 },
      { id: "wo-003", propertyId: "prop-001", unitId: u3a.id, title: "Kitchen tap leaking", description: "Kitchen sink tap dripping constantly, water bill increasing.", category: "PLUMBING", priority: "MEDIUM", status: "OPEN", slaHours: 48, estimatedCost: 15000 },
      { id: "wo-004", propertyId: "prop-006", unitId: uVA.id, title: "Pool pump replacement", description: "Villa A swimming pool pump has failed and needs replacement.", category: "FACILITY", priority: "HIGH", status: "ASSIGNED", slaHours: 24, estimatedCost: 280000 },
      { id: "wo-005", propertyId: "prop-003", unitId: uS2B.id, title: "Smart TV not working", description: "Guest unable to access Netflix. TV hardware fault.", category: "ELECTRONICS", priority: "HIGH", status: "OPEN", slaHours: 4, estimatedCost: 85000 },
      { id: "wo-006", propertyId: "prop-005", title: "Lift servicing — quarterly", description: "Quarterly lift maintenance and certification renewal.", category: "MECHANICAL", priority: "ROUTINE", status: "OPEN", slaHours: 720, estimatedCost: 180000 },
    ],
  });

  // ── SHORTLET BOOKINGS ────────────────────────────────────────────
  await db.shortletBooking.createMany({
    skipDuplicates: true,
    data: [
      { id: "bk-001", unitId: uS1A.id, guestName: "Sarah Johnson", guestEmail: "sarah.j@outlook.com", guestPhone: "+1 555 234 5678", checkIn: new Date("2026-07-15"), checkOut: new Date("2026-07-18"), nights: 3, nightlyRate: 55000, totalAmount: 165000, source: "AIRBNB", status: "CHECKED_IN", guestCount: 2, checkInCode: "VT8X2K" },
      { id: "bk-002", unitId: uS2B.id, guestName: "Ahmed Al-Rashid", guestEmail: "ahmed.r@hotmail.com", guestPhone: "+971 50 123 4567", checkIn: new Date("2026-07-16"), checkOut: new Date("2026-07-19"), nights: 3, nightlyRate: 35000, totalAmount: 105000, source: "BOOKING_COM", status: "CONFIRMED", guestCount: 1, checkInCode: "VT5Y9P" },
      { id: "bk-003", unitId: uS1A.id, guestName: "Chisom Eze", guestEmail: "chisom@gmail.com", guestPhone: "+234 806 111 2233", checkIn: new Date("2026-07-20"), checkOut: new Date("2026-07-22"), nights: 2, nightlyRate: 55000, totalAmount: 110000, source: "DIRECT", status: "CONFIRMED", guestCount: 3, checkInCode: "VT2R7M" },
      { id: "bk-004", unitId: uS2B.id, guestName: "David Osei", guestEmail: "david.osei@ghana.com", guestPhone: "+233 20 444 5566", checkIn: new Date("2026-07-25"), checkOut: new Date("2026-07-28"), nights: 3, nightlyRate: 35000, totalAmount: 105000, source: "EXPEDIA", status: "PENDING", guestCount: 2 },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("   Properties: 7 | Units: 15 | Tenants: 5 | Leases: 5 | Payments: 7 | Work Orders: 6 | Bookings: 4");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
