import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Veethrill database...");

  // Create properties
  const veethrillTowers = await db.property.upsert({
    where: { id: "prop-001" },
    update: {},
    create: {
      id: "prop-001",
      name: "Veethrill Towers",
      type: "MIXED_USE",
      address: "15 Adeola Odeku Street",
      city: "Victoria Island",
      state: "Lagos",
      country: "Nigeria",
      healthScore: 96,
      status: "ACTIVE",
    },
  });

  const lekkiGardens = await db.property.upsert({
    where: { id: "prop-002" },
    update: {},
    create: {
      id: "prop-002",
      name: "Lekki Gardens Phase 3",
      type: "RESIDENTIAL",
      address: "Admiralty Way",
      city: "Lekki",
      state: "Lagos",
      country: "Nigeria",
      healthScore: 84,
      status: "ACTIVE",
    },
  });

  const lekkiShortlets = await db.property.upsert({
    where: { id: "prop-003" },
    update: {},
    create: {
      id: "prop-003",
      name: "Lekki Shortlet Suites",
      type: "SHORTLET",
      address: "5 Freedom Way",
      city: "Lekki Phase 1",
      state: "Lagos",
      country: "Nigeria",
      healthScore: 93,
      status: "ACTIVE",
    },
  });

  // Create units for Veethrill Towers
  const unit7C = await db.unit.upsert({
    where: { propertyId_unitNumber: { propertyId: "prop-001", unitNumber: "7C" } },
    update: {},
    create: {
      propertyId: "prop-001",
      unitNumber: "7C",
      floor: 7,
      bedrooms: 3,
      bathrooms: 2,
      sqMeters: 120,
      monthlyRent: 350000,
      depositAmount: 700000,
      status: "OCCUPIED",
      amenities: ["AC", "Generator", "Security", "Gym"],
    },
  });

  // Create shortlet unit
  const suite1A = await db.unit.upsert({
    where: { propertyId_unitNumber: { propertyId: "prop-003", unitNumber: "Suite 1A" } },
    update: {},
    create: {
      propertyId: "prop-003",
      unitNumber: "Suite 1A",
      floor: 1,
      bedrooms: 2,
      bathrooms: 2,
      sqMeters: 80,
      monthlyRent: 0,
      nightlyRate: 45000,
      depositAmount: 0,
      status: "SHORTLET",
      amenities: ["WiFi", "AC", "Smart TV", "Kitchen"],
    },
  });

  // Create work orders
  await db.workOrder.createMany({
    skipDuplicates: true,
    data: [
      {
        propertyId: "prop-001",
        unitId: unit7C.id,
        title: "AC unit complete failure",
        description: "Air conditioning unit in Unit 7C has stopped working completely.",
        category: "HVAC",
        priority: "URGENT",
        status: "IN_PROGRESS",
        slaHours: 4,
      },
      {
        propertyId: "prop-002",
        title: "Generator service — 6 month",
        description: "6-month scheduled maintenance for Block B generator.",
        category: "ELECTRICAL",
        priority: "ROUTINE",
        status: "ASSIGNED",
        slaHours: 336,
        estimatedCost: 65000,
      },
    ],
  });

  // Create a shortlet booking
  await db.shortletBooking.createMany({
    skipDuplicates: true,
    data: [
      {
        unitId: suite1A.id,
        guestName: "Sarah Johnson",
        guestEmail: "sarah.j@outlook.com",
        guestPhone: "+1 555 234 5678",
        checkIn: new Date("2026-07-15"),
        checkOut: new Date("2026-07-17"),
        nights: 2,
        nightlyRate: 55000,
        totalAmount: 110000,
        source: "AIRBNB",
        status: "CHECKED_IN",
        guestCount: 1,
        checkInCode: "VT8X2K",
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log(`   Properties: 3`);
  console.log(`   Units: 2`);
  console.log(`   Work Orders: 2`);
  console.log(`   Shortlet Bookings: 1`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
