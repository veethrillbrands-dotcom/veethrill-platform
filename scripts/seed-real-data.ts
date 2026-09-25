/**
 * One-time seed: clears ALL sample data and loads real Veethrill CRM records
 * from the claude.ai CRM artifact.
 *
 * Run: npx tsx scripts/seed-real-data.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🗑  Clearing sample data...");

  // Delete in dependency order (children first)
  await db.crmContactActivity.deleteMany({});
  await db.crmContactProperty.deleteMany({});
  await db.crmTask.deleteMany({});
  await db.crmMeeting.deleteMany({});
  await db.crmDeal.deleteMany({});
  await db.crmContact.deleteMany({});
  await db.crmCommission.deleteMany({});
  await db.crmTrainingProgram.deleteMany({});
  await db.crmDossier.deleteMany({});
  await db.crmSubscription.deleteMany({});
  await db.crmTeamMember.deleteMany({});

  // PM sample data
  await db.payment.deleteMany({});
  await db.lease.deleteMany({});
  await db.shortletBooking.deleteMany({});
  await db.workOrder.deleteMany({});
  await db.inspection.deleteMany({});
  await db.unit.deleteMany({});
  await db.property.deleteMany({});
  await db.document.deleteMany({});
  await db.accountingEntry.deleteMany({});
  await db.invoice.deleteMany({});

  console.log("✅ Sample data cleared.");

  // ── CONTACTS ───────────────────────────────────────────────────────────────
  console.log("👥 Creating contacts...");

  const contactRows = [
    { name: "Musa", type: "Agent", email: "", phone: "+234 814 546 3963", company: "MEA Properties", location: "Abuja", notes: "" },
    { name: "Dreams Cottage Estate Ltd", type: "Developer", email: "", phone: "", company: "Dreams Cottage Estate Ltd (RC 7273673)", location: "Abuja", notes: "Sales Partner / Property Consultant partnership agreement in final review — Aug 2026 revision incorporated Veethrill's proposed amendments (7-day payment, non-circumvention, commission survival, title indemnity); near execution pending minor corrections. Also developer of Kaima Estate." },
    { name: "Sarphpoint Nigeria Ltd", type: "Client", email: "", phone: "", company: "SarphPoint Nigeria Limited (RC 1019712)", location: "Abuja", notes: "Client — Veethrill manages their shortlet apartments at Duboyi and Shimawa (Sarphpoint Apartments). Separately, also appointed Veethrill as exclusive Operations & Fleet Manager for a vehicle fleet/transportation business (Ref VBR/OPS/FLT/26/0606, 7 Jun 2026). Beneficial owner: Seun Ayantuga." },
    { name: "Mr. John Anele", type: "Client", email: "", phone: "", company: "", location: "Abuja", notes: "Landlord of the Sarphpoint Duboyi apartment." },
    { name: "Mrs. Elizabeth", type: "Agent", email: "", phone: "", company: "", location: "Abuja", notes: "On-site property manager for the Sarphpoint Duboyi apartment, managing on behalf of landlord Mr. John Anele." },
    { name: "Royal Josh Services", type: "Partner", email: "", phone: "", company: "Royal Josh Services", location: "", notes: "Housekeeping and soft-services partner for the Sarphpoint Duboyi apartment." },
    { name: "Abbeys' Square Limited", type: "Corporate", email: "", phone: "", company: "Abbeys' Square Limited (RC 9661360)", location: "Abuja", notes: "Incorporated 6 Jul 2026 (RC 9661360). Counterparty on the Long Lounge acquisition & renovation project (bar, lounge + 5 en-suite chalets). Operations Management Agreement, corporate KYC and client LOA all on file dated 7 Jul 2026. Veethrill covered the company's registration and land-survey fees." },
    { name: "Mummy Moyo", type: "Client", email: "", phone: "", company: "", location: "", notes: "Seller — Lugbe 1 Extension, Abuja: Plot 3438, Cadastral Zone 07-07, ~1,195.30 sqm, residential. Title search by Renaissance Attorneys came back clean — recommendation was to proceed to a preliminary contract." },
    { name: "The Glam Limited", type: "Client", email: "", phone: "", company: "The Glam Limited", location: "", notes: "Found in the Veethrill Real Estate Consultancy client files — details pending review of underlying documents." },
    { name: "Don P", type: "Client", email: "", phone: "", company: "", location: "", notes: "Found in the Veethrill Real Estate Consultancy client listing — details pending review." },
    { name: "Engr. Alaba Owoyemi", type: "Client", email: "", phone: "", company: "", location: "", notes: "Found in the Veethrill Real Estate Consultancy client listing — details pending review." },
    { name: "Isah Sani Abdulkarim", type: "Client", email: "isahabdulkareem@gmail.com", phone: "08033550937", company: "", location: "Abuja", notes: "Seller — Plot 393, F14, Cadastral Zone 07-05, Kubwa, Abuja: 450sqm, 2 detached units, 4BR+BQ+6 toilets, newly built 2025. Asking ₦200M/unit. Title: Deed of Assignment — Governor's Consent not yet obtained (critical gap per Veethrill Advisory Ref VBR/ADV/26/001, 19 May 2026)." },
    { name: "Nigerian Agip Exploration Ltd (NAE)", type: "Corporate", email: "", phone: "", company: "Nigerian Agip Exploration Ltd", location: "Abuja", notes: "Client — Veethrill is brokering a proposed lease of a 31-unit apartment building on Birao Street, Wuse 2, Abuja. Separately seeking a 5BR standalone duplex in Maitama/Asokoro for their MD's residence." },
    { name: "Tokunbo Ogunduyile", type: "Client", email: "Tokunbo.duyile@gmail.com", phone: "09029548502 / 08134964147", company: "", location: "Lagos", notes: "Seller — half-plot at Onijemo Street, off Haruna, Ogba, Lagos. Asking ₦75M. NOT READY TO LIST — title and co-ownership status both HIGH RISK. Draft exclusive LOA (Ref VBR/LOA/O/26/001) on file, not yet executed." },
    { name: "Uncle Kola Bolarin", type: "Client", email: "", phone: "", company: "", location: "", notes: "Found in the Veethrill Real Estate Consultancy client listing — details pending review." },
    { name: "Mr. Li", type: "Prospect", email: "", phone: "", company: "", location: "", notes: "Prospect for a Derick County Homes 3-Bedroom Flat, Dape, Abuja (off-plan, FCDA-approved, C of O). Priced from ₦140,000,000." },
    { name: "Mr. Oladapo", type: "Prospect", email: "", phone: "", company: "", location: "", notes: "Prospect seeking a 3-bed semi-detached/full duplex in Karsana/Jahi/Kubwa/Lugbe, ₦30M budget, for investment." },
    { name: "PAC Holdings (Oluwalanrewaju)", type: "Prospect", email: "", phone: "", company: "PAC Holdings", location: "", notes: "Found in the Veethrill Real Estate Consultancy prospects files — details pending review." },
    { name: "Scott Ugba", type: "Prospect", email: "", phone: "", company: "", location: "", notes: "Found in the Veethrill Real Estate Consultancy prospects files — details pending review." },
    { name: "Casa De Crystal Ltd (CDC Estates)", type: "Developer", email: "", phone: "", company: "Casa De Crystal Ltd (RC 8706977)", location: "", notes: "Development partner — Eden's Court land subdivision. Contact: Erioluwa Olomola, Head of Operations (erioluwa.olomola@casadecrystal.com, +234 813 763 6937). Project will be sold as serviced plots; building approvals still pending; no real estate projects completed to date." },
    { name: "Derick County Homes", type: "Developer", email: "", phone: "", company: "Derick County Homes", location: "", notes: "Development partner — Derick County Homes estate, Dape, Abuja. FCDA-approved, construction ongoing. Pricing: Fully Detached 5BR+BQ ₦288M; Semi-Detached 5BR+BQ ₦240M; Terrace 5BR+BQ ₦230M; Block of Flats 3BR+BQ ₦100M." },
    { name: "Ace Solicitors", type: "Partner", email: "", phone: "", company: "Ace Solicitors", location: "", notes: "Legal/business partner. Escrow admin fee: 1.5% of transaction value. Service levels: acknowledge 24hrs, escrow setup 2 business days, title verification 5–10 business days." },
    { name: "D.I Aiyedun and Co Ltd", type: "Partner", email: "davidaiyedunofficials@gmail.com", phone: "+234 806 211 4849", company: "D.I Aiyedun and Co Ltd", location: "Abuja", notes: "Legal/business partner — pay-per-engagement, scope: title verification & formal legal opinions. Partnership agreement drafted but still unsigned." },
    { name: "Mrs. Omonaiye Oluwatoyin Abidemi", type: "Client", email: "", phone: "", company: "", location: "Abuja", notes: "Tenant at Mr. Odion Okukpon's Waru Wazobia property (Studio + 2-Bedroom Apartment). Tenancy: 15 Jun 2026 – 14 Jun 2027, annual rent ₦2,700,000." },
    { name: "360PROPERTII Realty Ltd", type: "Agent", email: "", phone: "", company: "360PROPERTII Realty Ltd", location: "Abuja", notes: "Landlord's appointed Property Manager for the Birao Street, Wuse II estate being offered to NAE; leads the Landlord's redevelopment proposal." },
    { name: "Polo Residences", type: "Developer", email: "", phone: "", company: "Polo Residences", location: "Abuja", notes: "Developer of The Euphoria, a mini-estate at Plot 1124, Cadastral Zone B19, Katampe Extension, Abuja — 4 units of 5-bedroom duplexes. Starting price ₦1.5 billion." },
    { name: "Country Built Nig. Ltd.", type: "Corporate", email: "", phone: "", company: "Country Built Nig. Ltd.", location: "Abuja", notes: "Sales-training client — 17-year-old Abuja developer, ₦7 billion sales target, 3 active projects (incl. The Belgravia and Legado R.), 10-person sales team." },
    { name: "Seun Ayantuga", type: "Client", email: "", phone: "", company: "SarphPoint Nigeria Limited", location: "Lagos", notes: "Beneficial Owner of SarphPoint Nigeria Limited (RC 1019712). Appointed Veethrill as exclusive Operations & Fleet Manager for SarphPoint's vehicle fleet/transportation business (Ref VBR/OPS/FLT/26/0606, 7 Jun 2026)." },
    { name: "Houseshop", type: "Partner", email: "", phone: "", company: "Houseshop", location: "Abuja", notes: "Co-listing partner in the Veethrill Partners Network — joint listings include a Karsana 4BR detached duplex (₦270M), a Jabi 5BR+BQ, an 8BR Maitama mansion, and a Gwarinpa 5BR." },
    { name: "Alhaji Olalekan Agboke", type: "Guest", email: "", phone: "", company: "", location: "Abuja", notes: "Guest — Sarphpoint Apartment, Duboyi. Stayed 13–14 Jul 2026 (1 night), sourced via referral." },
    { name: "Mrs Adepeju Issac Adeola", type: "Guest", email: "", phone: "", company: "", location: "Abuja", notes: "Guest — Sarphpoint Apartment, Duboyi. Stayed 11–29 Aug 2026 (18 nights total). Left a 5-star review." },
    { name: "Mr Tobi Adeyinka", type: "Guest", email: "", phone: "", company: "", location: "Abuja", notes: "Guest — Sarphpoint Apartment, Duboyi. Booked via Booking.com; stayed 7–9 Sep 2026 (2 nights)." },
    { name: "Mr. David Phantom Alade", type: "Guest", email: "", phone: "", company: "", location: "Abuja", notes: "Guest — Sarphpoint Apartment, Duboyi. Sourced via referral; stayed 12–15 Sep 2026 (3 nights)." },
    { name: "Prince", type: "Partner", email: "", phone: "+2349160141959", company: "PrimevilleModernLiving Real Estate and Shortlet Apartments Brokerage Services", location: "Abuja", notes: "CEO of PrimevilleModernLiving. Shortlet referral partner — lists Veethrill's Sarphpoint Duboyi apartment on his platform. Membership ID VPN-2026-047, DOB 10 Mar 1996." },
    { name: "Ajayi Kehinde", type: "Agent", email: "", phone: "+2347030709222", company: "", location: "Abuja", notes: "Conducted site inspection on behalf of Veethrill Realty for the prospective 5BR standalone duplex (Maitama/Asokoro) for NAE's MD. Inspection: 12noon, 23 Sep 2026, meeting point H-medix Asokoro." },
    { name: "Saheed Olaniyi", type: "Client", email: "", phone: "", company: "Nigerian Agip Exploration Ltd (NAE)", location: "Abuja", notes: "Representative of Agip (NAE). Seeking the address of the proposed 5BR duplex for NAE's MD." },
    { name: "Big Baba Boss", type: "Agent", email: "", phone: "+2348141335740", company: "", location: "Abuja", notes: "Property contact linked to Victory through partner Fortune, re: a 5BR standalone duplex option in Maitama/Asokoro for NAE's MD. Meeting point: H-medix Asokoro." },
    { name: "Mr. Abdul", type: "Partner", email: "", phone: "+2348068869119", company: "Yeemas Real Estate and Developers", location: "Abuja", notes: "CEO of Yeemas Real Estate and Developers. Peer agency contact via PropertyPro Kaima Estate listing. Exchange 23–24 Sep 2026." },
    { name: "Stanley", type: "Agent", email: "", phone: "", company: "Unconfirmed — likely SF-Stars International Ltd or 360PROPERTII Realty Ltd", location: "Abuja", notes: "Reached out 23 Sep 2026 to share the updated floor plan for the Birao Street / Wuse II estate (NAE 32-unit lease deal). Company/role not yet confirmed." },
    { name: "Sarah Ogidi", type: "Agent", email: "", phone: "+2348103211148", company: "", location: "Abuja", notes: "Agent who brought a client requirement: entire office complex near Central Area, fully furnished & serviced, 4-month term. Commission-sharing: 50/50 split with Veethrill confirmed 23 Sep 2026." },
    { name: "Chinonso Afoaku", type: "Developer", email: "barrnonso2@gmail.com", phone: "09025600700", company: "Urbanstone Development Limited", location: "Abuja", notes: "MD and sole director of Urbanstone Development Limited (RC 1911099). First project — Cedar Court, Kuje. Developer Partnership Application submitted 24 Sep 2026." },
    { name: "Mr. Daniel", type: "Guest", email: "", phone: "+234 816 663 8926", company: "", location: "Abuja", notes: "Sarphpoint Duboyi shortlet guest — booking proposal for 23–26 Oct 2026 (3 nights). ₦290,000 total payable (₦240k booking + ₦50k caution deposit)." },
    { name: "Iwezor Fortune Daberechi (Fortune)", type: "Partner", email: "iwezorfortunedaberechi@gmail.com", phone: "+234 706 705 3139", company: "Aso Realty / Independent Property Consultant", location: "Abuja", notes: "Junior-tier Partners Network member (VPN-2026-046, 10 Sep 2026). Has his own Abuja land listings and Aso Realty flyer properties for co-marketing. DOB 5 Dec 1997." },
    { name: "Abiodun Attah", type: "Prospect", email: "", phone: "", company: "", location: "Abuja", notes: "Prospect for the 4-bedroom terrace duplex unit at Kaima Estate (developer: Dreams Cottage Estate Ltd.), Lugbe, Abuja." },
    { name: "Dimension Data", type: "Corporate", email: "", phone: "", company: "Dimension Data", location: "", notes: "Client — three engagements: Sales Kick-off training/accommodation/feeding (₦41,387,500), IT Workshop for Julius Berger Nigeria & Dentrex (₦9,303,000), and Abuja Road Show N20BN Bond Programme (₦10,748,250) — combined ~₦61.4M." },
    { name: "Toyeeb Oyedokun", type: "Prospect", email: "", phone: "", company: "", location: "", notes: "Was interested in a Diasporan-resident unit developed by Dreams Cottage; opted for another property in Die Die instead. Full name: Toyeeb Olaitan Oyedokun." },
    { name: "Mr. Odion Amos Okukpon", type: "Client", email: "", phone: "", company: "", location: "Abuja", notes: "Landlord — Veethrill manages his Waru Wazobia property (Studio Apartment & Two Bedroom Apartment). Property: Beside Musalashi Mosque, Wazobia-Waru, after Apo Mechanic Village, Abuja." },
    { name: "Mr. Stanley Mark", type: "Agent", email: "", phone: "", company: "", location: "Abuja", notes: "Represents the landlord's interest in the Birao Street 31-unit property (not the client, NAE)." },
    { name: "Angie", type: "Partner", email: "", phone: "", company: "White Wall Realty Co.", location: "", notes: "Content / referral partner in Veethrill's shared real estate network." },
    { name: "Obi Ojo", type: "Developer", email: "", phone: "+234 706 670 5241", company: "Dream Cottage", location: "Abuja", notes: "" },
    { name: "David Iyanuoluwa Aiyedun", type: "Partner", email: "davidaiyedunofficials@gmail.com", phone: "+234 806 211 4849", company: "DI Aiyedun & Co", location: "Abuja", notes: "Veethrill Company Secretary and legal representative. MD of DI Aiyedun and Co." },
  ];

  const createdContacts: Record<string, string> = {}; // name → id

  for (const c of contactRows) {
    const contact = await db.crmContact.create({
      data: {
        name: c.name,
        type: c.type,
        email: c.email || null,
        phone: c.phone || null,
        company: c.company || null,
        location: c.location || null,
        notes: c.notes || null,
      },
    });
    createdContacts[c.name] = contact.id;
  }

  console.log(`✅ Created ${contactRows.length} contacts.`);

  // ── DEALS ───────────────────────────────────────────────────────────────────
  console.log("💼 Creating deals...");

  type DealRow = {
    title: string;
    contactName: string;
    value: number | null;
    stage: string;
    notes: string;
    feeStatus?: string;
    feeValue?: number | null;
    project?: string;
  };

  const dealRows: DealRow[] = [
    { title: "Kaima Estate — 2BR/4BR Units", contactName: "Abiodun Attah", value: 120000000, stage: "Site Visit", notes: "5-unit gated release of pre-finished terrace duplexes. 2BR ₦85,000,000 / 4BR ₦120,000,000. FCDA approved, R of O titled. Marketing live — booking CTA 'DM KAIMA' for inspection.", project: "Kaima Estate, Lugbe, Abuja" },
    { title: "32-Unit Lease — Birao Street, Wuse II (NAE)", contactName: "Nigerian Agip Exploration Ltd (NAE)", value: null, stage: "Negotiation", feeStatus: "Not Invoiced", notes: "Estate: 32 three-bedroom flats across 2 blocks (~142 sqm/flat), valid C of O. Option 1 (Unfurnished) US$20,000/unit/yr; Option 2 (Turnkey Furnished, RECOMMENDED) US$35,000/unit/yr, 5-yr min term. Awaiting NAE's option selection.", project: "Birao Street (off Adetokunbo Ademola Crescent), Wuse II, Abuja" },
    { title: "Long Lounge Acquisition & Renovation", contactName: "Abbeys' Square Limited", value: 10000000, stage: "Under Contract", notes: "~450 sqm bar/lounge with 5 en-suite chalets. Total project cost ₦197,264,808 (value-engineered alternative ~₦147,805,125). Architect drawings received; awaiting Abbey Square's go-ahead for M&E drawings.", project: "Long Lounge (bar/lounge + 5 chalets)" },
    { title: "Kaima Estate — 4BR Unit (Abiodun Attah)", contactName: "Abiodun Attah", value: 120000000, stage: "Qualified", notes: "Prospect enquiry for the 4-bedroom terrace duplex unit at Kaima Estate. Developer: Dreams Cottage Estate Ltd. (RC 7273673).", project: "Kaima Estate, Lugbe, Abuja" },
    { title: "Sarphpoint Apartment — Duboyi (Shortlet)", contactName: "Sarphpoint Nigeria Ltd", value: null, stage: "Completed", notes: "Active Veethrill shortlet/booking property. Nightly rate ₦80,000. Partner referral bonus: 10% of booking revenue. Landlord: Mr. John Anele. On-site: Mrs. Elizabeth. Housekeeping: Royal Josh Services.", project: "Sarphpoint Apartment, Duboyi, Abuja" },
    { title: "DDL 2026 Sales Kick-off — Training, Accommodation & Feeding", contactName: "Dimension Data", value: 38500000, stage: "Completed", feeStatus: "Paid", feeValue: 1925000, notes: "Invoice INV-DDL-2026-001 (23 Mar 2026). Full event organization — training centre, accommodation, feeding. Net ₦38,500,000 + VAT 7.5% = ₦41,387,500 total, billed via Veethrill Brands Limited (Lagos).", project: "Frasier Suite — Sales Retreats & Hotel Bookings" },
    { title: "Ogba, Lagos — Half Plot Outright Sale (Tokunbo Ogunduyile)", contactName: "Tokunbo Ogunduyile", value: 75000000, stage: "Enquiry", notes: "Half-plot land, outright sale. Asking ₦75M (valuation ₦78M). NOT READY TO LIST per internal review — title and co-ownership status both flagged HIGH RISK; site inspection still outstanding.", project: "Onijemo Street, off Haruna, Ogba, Lagos State" },
    { title: "DDL IT Workshop — Julius Berger & Dentrex Team", contactName: "Dimension Data", value: 8400000, stage: "Completed", feeStatus: "Paid", feeValue: 420000, notes: "Invoice INV-VBL-2026-DDL-003 (30 Apr 2026). 2 nights accommodation for 6 participants, conference room + AV, full-board meals. Subtotal ₦8,400,000 + 10% service charge + VAT = ₦9,303,000 total.", project: "Intercontinental Hotel, Lagos" },
    { title: "DDL Abuja Road Show — N20BN Bond Programme", contactName: "Dimension Data", value: 10200000, stage: "Completed", feeStatus: "Paid", feeValue: 510000, notes: "Invoice INV-DDL-2026-1206 (12 Jun 2026): accommodation, car hire and entertainment. Net ₦10,200,000 + 5% service charge + VAT = ₦10,748,250 total.", project: "Abuja" },
    { title: "Dreams Cottage — Diasporan Resident Due Diligence (Toyeeb Oyedokun)", contactName: "Toyeeb Oyedokun", value: 80000, stage: "Completed", feeStatus: "Paid", feeValue: 10000, notes: "Prospect was interested but opted for another property in Die Die instead. Veethrill assisted in due diligence.", project: "Dreams Cottage — Diasporan Resident" },
    { title: "Waru Wazobia — Studio + 2BR (Managed, Tenant: Omonaiye)", contactName: "Mr. Odion Amos Okukpon", value: 2700000, stage: "Under Contract", feeStatus: "Paid", feeValue: 66000, notes: "Veethrill manages this Studio + 2BR property for Mr. Odion Okukpon. Tenant: Mrs. Omonaiye Oluwatoyin Abidemi. Tenancy 15 Jun 2026–14 Jun 2027. Annual rent ₦2,700,000; agency commission ₦270,000; legal/documentation ₦135,000.", project: "Waru Wazobia, Abuja" },
    { title: "Kubwa 4BR+BQ Semi-Detached × 2 Units — Isah Sani Abdulkarim", contactName: "Isah Sani Abdulkarim", value: 200000000, stage: "Lost", notes: "2 units (4BR+1BQ, 6 toilets each) on 450sqm, newly built 2025. Asking ₦200M/unit. Title: Deed of Assignment — Governor's Consent not yet obtained.", project: "Plot 393, F14, Cadastral Zone 07-05, Kubwa, Abuja" },
    { title: "Eden's Court Land Subdivision — Casa De Crystal (CDC Estates)", contactName: "Casa De Crystal Ltd (CDC Estates)", value: null, stage: "Qualified", notes: "Partnership under assessment. Project will be sold as land subdivision / serviced plots, not built units. Building approvals still pending.", project: "Eden's Court (serviced plots)" },
    { title: "Derick County Homes — Marketing Partnership", contactName: "Derick County Homes", value: null, stage: "Completed", notes: "Active marketing partnership — brochures, flyers and reels produced; site pictures received Jun 2026. Multiple unit types from ₦100M to ₦288M.", project: "Derick County Homes Estate, Dape, Abuja" },
    { title: "Derick County Homes 3BR Flat, Dape — Mr. Li", contactName: "Mr. Li", value: 140000000, stage: "Lost", notes: "Off-plan 3-bedroom flat, individual solar power, BQ, in-estate mall, gated/secured. From ₦140,000,000.", project: "Derick County Homes, Dape, Abuja" },
    { title: "Country Built — 10-Day Sales Training Programme", contactName: "Country Built Nig. Ltd.", value: 8707500, stage: "Lost", notes: "Ref VBL/CB/STO/2026, March 2026. 10 days × 3 hrs/day (30 hrs) live facilitation, SPIN Selling + A.C.T. Rate ₦300,000/hr, gross ₦9,000,000 less 10% loyalty discount = ₦8,100,000 + VAT 7.5% = ₦8,707,500. Training eventually cancelled.", project: "The Belgravia & Legado R. Projects" },
    { title: "Lugbe 1 Extension Plot — Mummy Moyo", contactName: "Mummy Moyo", value: null, stage: "Lost", notes: "~1,195.30 sqm residential plot. Title search came back clean. Recommendation: proceed with preliminary contract. Papers unable to be verified.", project: "Lugbe 1 Extension, Abuja (Plot 3438, Cadastral Zone 07-07)" },
    { title: "Sarphpoint Duboyi — Guest Stay (Alhaji Olalekan Agboke)", contactName: "Alhaji Olalekan Agboke", value: 60000, stage: "Completed", feeStatus: "Not Invoiced", notes: "13–14 Jul 2026, 1 night @ ₦60,000. Platform: Referral. Net to property ₦60,000.", project: "Sarphpoint Apartment, Duboyi" },
    { title: "Sarphpoint Duboyi — Guest Stay (Mrs Adepeju Issac Adeola)", contactName: "Mrs Adepeju Issac Adeola", value: 1152000, stage: "Completed", feeStatus: "Not Invoiced", notes: "11–29 Aug 2026, 18 nights @ ₦64,000/night = ₦1,152,000 gross. Platform: Propertypro. 5-star guest feedback: 'Will always recommend the facility.'", project: "Sarphpoint Apartment, Duboyi" },
    { title: "Sarphpoint Duboyi — Guest Stay (Mr Tobi Adeyinka)", contactName: "Mr Tobi Adeyinka", value: 154700, stage: "Completed", feeStatus: "Not Invoiced", notes: "7–9 Sep 2026, 2 nights @ ₦77,350 = ₦154,700 gross. Platform: Booking.com, platform fee ₦23,205, net to property ₦131,495.", project: "Sarphpoint Apartment, Duboyi" },
    { title: "Sarphpoint Duboyi — Guest Stay (Mr. David Phantom Alade)", contactName: "Mr. David Phantom Alade", value: 240000, stage: "Completed", feeStatus: "Not Invoiced", notes: "12–15 Sep 2026, 3 nights = ₦240,000 gross. Platform: Referral.", project: "Sarphpoint Apartment, Duboyi" },
    { title: "Sarphpoint Duboyi — Management Fee (Jul–Sep 2026)", contactName: "Sarphpoint Nigeria Ltd", value: 1606700, stage: "Under Contract", feeStatus: "Paid", feeValue: 188319, notes: "Statement PRS-SAR-26-0801, 14 Aug 2026. Gross booking revenue ₦1,606,700; Veethrill management fee 20% of net operating income = ₦188,319 (deducted at source). Net payout remitted to owner ₦189,996.", project: "Sarphpoint Apartment, Duboyi" },
    { title: "NAE MD Residence — 5BR Standalone Duplex (Maitama/Asokoro)", contactName: "Nigerian Agip Exploration Ltd (NAE)", value: null, stage: "Site Visit", feeStatus: "Not Invoiced", notes: "New inquiry (separate from Birao Street deal): NAE needs a minimum 5-bedroom standalone duplex in Maitama or Asokoro for their MD's residence. Option sourced via partner Fortune. Ajayi Kehinde conducted inspection 23 Sep 2026.", project: "Maitama or Asokoro, Abuja" },
    { title: "Office Complex Letting — Central Area (Sarah Ogidi Referral)", contactName: "Sarah Ogidi", value: null, stage: "Enquiry", feeStatus: "Not Invoiced", notes: "Client requirement: entire office complex near Central Area, fully furnished & serviced, ample parking for campaign vehicles, 4-month term, move-in 1st week October 2026. Commission: 50/50 split with Sarah Ogidi confirmed.", project: "Central Area / Maitama / Wuse 2 / Garki / Jabi" },
    { title: "Cedar Court, Kuje — Developer Marketing Mandate (Urbanstone)", contactName: "Chinonso Afoaku", value: 100000000, stage: "Qualified", feeStatus: "Not Invoiced", notes: "Land subdivision, 20 plots, behind International Market Junction, AA-3 Layout, Kuje. Plots: 200sqm terrace duplex ₦4.5M / 250sqm semi-detached ₦5M / 300sqm detached ₦5.5M. NON-exclusive mandate, 15% commission. Documents outstanding: AGIS title verification, litigation search, building plan approval.", project: "Cedar Court, Kuje" },
    { title: "Sarphpoint Duboyi — Guest Stay (Mr. Daniel)", contactName: "Mr. Daniel", value: 240000, stage: "Offer Sent", feeStatus: "Not Invoiced", notes: "Check-in 23 Oct 2026, check-out 26 Oct 2026 (3 nights). Booking total ₦240,000 + refundable caution deposit ₦50,000 = ₦290,000 payable. Payment to Veethrill Brands, FCMB 7554518017.", project: "Sarphpoint Duboyi" },
  ];

  for (const d of dealRows) {
    const contactId = createdContacts[d.contactName];
    await db.crmDeal.create({
      data: {
        title: d.title,
        contactId: contactId || null,
        contactName: d.contactName,
        value: d.value ?? 0,
        stage: d.stage,
        notes: d.notes || null,
      },
    });
  }

  console.log(`✅ Created ${dealRows.length} deals.`);

  // ── TASKS ───────────────────────────────────────────────────────────────────
  console.log("✅ Creating tasks...");

  type TaskRow = {
    title: string;
    contactName?: string;
    done: boolean;
    dueDate?: string;
    priority: string;
    notes?: string;
    content?: string;
  };

  const taskRows: TaskRow[] = [
    { title: "Get Dreams Cottage partnership agreement signed", contactName: "Dreams Cottage Estate Ltd", done: true, dueDate: "2026-09-29", priority: "High", notes: "Minor corrections pending before execution." },
    { title: "Follow up with Mr. Stanley on NAE document request", contactName: "Mr. Stanley Mark", done: true, dueDate: "2026-09-27", priority: "High", notes: "Resolved — C of O and amenities list received; Offer Letter and Revised Proposal issued to NAE 9 Sep 2026." },
    { title: "Follow up with 30-unit estate landlord", done: true, dueDate: "2026-09-27", priority: "Medium", notes: "Awaiting title docs and revised price/timeline for snag fixes." },
    { title: "Finalize Long Lounge renovation contractor scope", done: true, dueDate: "2026-10-02", priority: "Medium", notes: "Confirm engineer scope incl. solar, commercial kitchen, AC, DJ area, landscaping." },
    { title: "Set up Cowork agent for Partners Network management", done: true, dueDate: "2026-10-06", priority: "Medium", notes: "Handle application pipeline, register updates, and WhatsApp group content." },
    { title: "Onboard Fortune's land listings + Aso Realty flyer properties for co-marketing", contactName: "Iwezor Fortune Daberechi (Fortune)", done: true, dueDate: "2026-09-30", priority: "Medium", notes: "Fortune has his own Abuja land listings plus Aso Realty flyer properties he wants marketed through Veethrill." },
    { title: "Kick off VeethrillAI EOS Phase 0 build", done: false, dueDate: "2026-10-10", priority: "Low", notes: "n8n on Docker Desktop + PostgreSQL/Redis/Qdrant/Ollama/Nginx/Evolution API stack; business-first architecture; still at planning stage." },
    { title: "Confirm landlord name for 30-Unit Estate deal", done: true, dueDate: "2026-09-30", priority: "Low", notes: "Long Lounge landlord resolved as Abbey Square. 30-Unit Estate landlord still unconfirmed." },
    { title: "Confirm Abbey Square (Wazobia) deal stage / onboarding status", contactName: "Abbeys' Square Limited", done: false, dueDate: "2026-09-26", priority: "Medium", notes: "Confirm current onboarding status for Abbey Square Apartment (Wazobia)." },
    { title: "Follow up with Abiodun Attah on Kaima Estate 4BR interest", contactName: "Abiodun Attah", done: true, dueDate: "2026-09-25", priority: "High", notes: "Confirm interest level, share unit details, and schedule inspection (DM KAIMA flow)." },
    { title: "Get Abbey Square's go-ahead on Long Lounge M&E drawings", contactName: "Abbeys' Square Limited", done: false, dueDate: "2026-09-29", priority: "Medium", notes: "Architect drawings received; need sign-off to proceed to mechanical & electrical drawings." },
    { title: "Get NAE's decision: Option 1 ($20k/unit/yr) vs Option 2 ($35k/unit/yr, recommended)", contactName: "Nigerian Agip Exploration Ltd (NAE)", done: true, dueDate: "2026-09-26", priority: "High", notes: "Offer Letter + Revised Proposal sent 9 Sep 2026 (Ref VBR/OFL/26/1308 / VBR/ADD/26/0909). Awaiting NAE's option selection." },
    { title: "Chase Tokunbo Ogunduyile: site inspection, solicitor Femi's full details, title perfection", contactName: "Tokunbo Ogunduyile", done: true, dueDate: "2026-09-29", priority: "High", notes: "Listing is NOT READY per internal review — title and co-ownership status both high risk." },
    { title: "Daily Social Media Content — Post & Broadcast (22 Sep)", done: true, dueDate: "2026-09-22", priority: "High", content: "3-topic VERA package: (1) Sarphpoint short-let showcase; (2) 'Verify With Me' — FCTA land dispute ADR; (3) 'Abuja, Explained' — Real Estate Fest 2026 preview.", notes: "Today's platform mix is IG Carousel + WhatsApp Broadcast only per VERA's weekly grid." },
    { title: "Push Up / Renew PropertyPro Listings (22 Sep)", done: true, dueDate: "2026-09-22", priority: "Medium", notes: "Bump all active Veethrill listings to the top of PropertyPro search daily." },
    { title: "Send Prince (PrimevilleModernLiving) property media for shortlet partnership", contactName: "Prince", done: true, dueDate: "2026-09-24", priority: "High", notes: "He requested photos/media to list Veethrill's shortlet apartment on his platform, and asked to be added to the availability/booking group. Confirmed unit: Sarphpoint Duboyi (Golden Spring Estate)." },
    { title: "Get exact meeting location from Big Baba Boss before 12noon inspection", contactName: "Big Baba Boss", done: true, dueDate: "2026-09-23", priority: "High", notes: "Confirmed: H-medix Asokoro is the meeting point for the 12noon inspection." },
    { title: "Get Ajayi Kehinde's inspection feedback — NAE MD residence (Maitama/Asokoro)", contactName: "Ajayi Kehinde", done: true, dueDate: "2026-09-23", priority: "High", notes: "Follow up after the 12noon inspection for his report on the 5BR standalone duplex before updating NAE." },
    { title: "Share confirmed rental address with Saheed Olaniyi (NAE)", contactName: "Saheed Olaniyi", done: true, dueDate: "2026-09-24", priority: "Medium", notes: "He called 22 Sep asking for the proposed rental space's address on behalf of Agip — send once inspection confirms." },
    { title: "Follow up for name/interest on Kaima Estate PropertyPro lead", done: true, dueDate: "2026-09-24", priority: "Medium", notes: "Resolved — he's Mr. Abdul, CEO of Yeemas Real Estate and Developers. Updated to Partner." },
    { title: "Review Stanley's updated Birao Street floor plan vs NAE's Option 1/2 specs", contactName: "Stanley", done: true, dueDate: "2026-09-24", priority: "Medium", notes: "Compare the newly shared floor plan against the 32-unit lease deal terms — Option 1 vs Option 2." },
    { title: "Reply to Sarah Ogidi on Veethrill's commission-sharing arrangement", contactName: "Sarah Ogidi", done: true, dueDate: "2026-09-24", priority: "High", notes: "Resolved — Sarah confirmed an equal (50/50) commission split if her client closes." },
    { title: "Source verified office complexes for Sarah Ogidi's client (Central Area/Maitama/Wuse 2/Garki/Jabi)", contactName: "Sarah Ogidi", done: false, dueDate: "2026-09-26", priority: "High", notes: "Entire complex, fully furnished & serviced, ample parking for campaign vehicles, conference room, security, power, cleaners, internet. 4-month term, move-in 1st week of October." },
    { title: "Send Central Area office complex brief + graphics to the Partners Network", contactName: "Sarah Ogidi", done: true, dueDate: "2026-09-24", priority: "High", notes: "Done — brief + graphics shared with the Veethrill Partners Network group on 23 Sep 2026." },
    { title: "Follow up on Partners Network responses for Sarah Ogidi's office complex brief", contactName: "Sarah Ogidi", done: true, dueDate: "2026-09-25", priority: "High", notes: "Check the Partners Network group for verified options and compile to send Sarah with videos/pictures." },
    { title: "Send Urbanstone document request & clarifications (Cedar Court)", contactName: "Chinonso Afoaku", done: true, dueDate: "2026-09-24", priority: "High", notes: "WhatsApp Chinonso: acknowledge application; request committed docs (CAC, MEMAT, CO2/CO7, TIN, ID, utility bill, board resolution, survey plan, R of O, registered POA, payment plan, drawings/3D, draft sales agreement, allocation template)." },
    { title: "Run AGIS title + litigation search — Cedar Court, Kuje", contactName: "Chinonso Afoaku", done: false, dueDate: "2026-10-01", priority: "High", notes: "Once R of O, survey plan and Power of Attorney arrive: verify at AGIS, run litigation/encumbrance search. Only then prepare non-exclusive Marketing Mandate." },
    { title: "Review Buyers Kit v1.1 (e-book + Publisher's Pack) and approve", done: true, dueDate: "2026-09-26", priority: "High", notes: "Read Veethrill_Property_Buyers_Kit_2026.pdf (82pp) and Veethrill_Buyers_Kit_Publishers_Pack.pdf. Note any changes wanted before legal review." },
    { title: "Send Buyers Kit manuscript for lawyer review", done: true, dueDate: "2026-09-28", priority: "High", notes: "Ask a Nigerian property lawyer to review the manuscript, especially Ch. 3 (Document Decoder), Ch. 4 (Title), Ch. 7 (Costs & tax) and the FAQ. Required before selling." },
    { title: "Confirm current AGIS fees & procedures for the Buyers Kit", done: false, dueDate: "2026-10-01", priority: "High", notes: "Call/visit AGIS (4 Peace Drive, Central Area). Confirm: legal search ₦10k/₦20k + 24hr–3 days; PoA registration ₦102,000. Update dates in Ch. 4, 7 and FAQ." },
    { title: "Confirm Lagos Lands Bureau fees + LASRERA registration rules", done: false, dueDate: "2026-10-01", priority: "Medium", notes: "Confirm Lagos search fee and Governor's Consent charges. Update Ch. 4 and Ch. 7 tables." },
    { title: "Get tax adviser summary: stamp duty & CGT under Nigeria Tax Act 2025", done: false, dueDate: "2026-10-02", priority: "Medium", notes: "Need current stamp duty rates/thresholds on property transfers and leases, collecting authority (NRS vs state), CGT for individuals/companies, principal residence exemption." },
    { title: "Check competitor e-book prices; finalise Buyers Kit pricing", done: false, dueDate: "2026-09-30", priority: "Medium", notes: "Look at comparable Nigerian property guides on Selar, Paystack storefronts and Amazon. Proposed: ₦9,999 launch / ₦14,999 standard; $15/£12 diaspora." },
    { title: "Set up Buyers Kit storefronts, delivery email & refund policy", done: false, dueDate: "2026-10-02", priority: "High", notes: "Selar or Paystack (NGN) + Gumroad/Stripe (£/$). Upload PDF + Calculators.xlsx + Red-Flag Checklist. Publish 7-day refund policy. Do a test purchase." },
    { title: "Build Red-Flag Checklist landing page with NDPA consent", done: false, dueDate: "2026-10-02", priority: "High", notes: "Form: first name, email, WhatsApp + UNTICKED consent box + privacy notice link + easy unsubscribe (Nigeria Data Protection Act 2023)." },
    { title: "Launch affiliate programme to the WhatsApp partner network", done: false, dueDate: "2026-10-02", priority: "High", notes: "Send partner announcement: 30% commission per Kit sale, ₦5k per Advisory Call, ₦20k per corporate licence. Rules: approved copy only, disclose commission, no income claims." },
    { title: "Invite 10–15 early readers for feedback & testimonials (Buyers Kit)", done: false, dueDate: "2026-10-09", priority: "Medium", notes: "Past clients and trusted partners get the Kit free for honest feedback. Ask written permission to quote. Real quotes only, no invented reviews." },
    { title: "Record the 3 Buyers Kit launch reels", done: false, dueDate: "2026-10-09", priority: "Medium", notes: "Scripts: (1) 'A C of O is not the end of the conversation' (2) 'Paper vs ground' (3) 'Separate the doer from the checker'. Voiceover with HeyGen clone 'Victory Thompson'. Keywords: DECODER, SITE, ABROAD." },
    { title: "Book co-hosted Buyers Kit webinar with Ace Solicitors", done: false, dueDate: "2026-10-16", priority: "Medium", notes: "'Verify Before You Pay: a buyer's session with a lawyer' — target launch day 8 (evening WAT, UK-friendly). Offer attendees the Kit + Advisory Call bundle." },
    { title: "Line up 2 diaspora association talks for Buyers Kit launch", done: false, dueDate: "2026-10-16", priority: "Medium", notes: "UK/US/Canada/UAE Nigerian professional associations. Free 30-minute talk ('Buying back home without regret') + group rate on the Kit. Target launch days 12–21." },
    { title: "LAUNCH: Veethrill Property Buyers Kit", done: false, dueDate: "2026-10-19", priority: "High", notes: "Assumed launch date Mon 19 Oct 2026. Founder video on IG/TikTok/LinkedIn/WhatsApp channel, email 1 to the list, partners post affiliate links. Then follow the 14-day launch plan." },
    { title: "Check ARCON ad-vetting rules before any paid Buyers Kit ads", done: false, dueDate: "2026-10-26", priority: "Medium", notes: "Before the week-6 paid test on the lead magnet, confirm with ARCON whether social media ads need pre-exposure vetting and approval." },
    { title: "Buyers Kit week-2 numbers review: set real targets", done: false, dueDate: "2026-10-30", priority: "Medium", notes: "Fill the weekly scorecard: leads, lead→Kit %, Kit sales (direct/affiliate), Advisory Calls booked, refunds, best reel. Replace scenario-model assumptions with real numbers." },
    { title: "Send Veethrill's shortlet application link to Mr. Abdul (Yeemas)", contactName: "Mr. Abdul", done: true, dueDate: "2026-09-25", priority: "Medium", notes: "Victory offered to share the application link for Veethrill's managed shortlet during WhatsApp exchange on 24 Sep." },
    { title: "Birthday reminder: Fortune's birthday is tomorrow (5 Dec)", contactName: "Iwezor Fortune Daberechi (Fortune)", done: false, dueDate: "2026-12-04", priority: "Medium", notes: "Fortune opted in for birthday messages (DOB 5 Dec 1997, Membership ID VPN-2026-046)." },
    { title: "Send Fortune his birthday message", contactName: "Iwezor Fortune Daberechi (Fortune)", done: false, dueDate: "2026-12-05", priority: "Medium", notes: "Fortune opted in for birthday messages (Partners Network application, DOB 5 Dec 1997, Membership ID VPN-2026-046)." },
    { title: "Birthday reminder: Prince's birthday is tomorrow (10 Mar)", contactName: "Prince", done: false, dueDate: "2027-03-09", priority: "Medium", notes: "Prince Iliya (PrimevilleModernLiving) opted in for birthday messages (DOB 10 Mar 1996, Membership ID VPN-2026-047)." },
    { title: "Send Prince his birthday message", contactName: "Prince", done: false, dueDate: "2027-03-10", priority: "Medium", notes: "Prince Iliya (PrimevilleModernLiving) opted in for birthday messages (Partners Network application, DOB 10 Mar 1996, Membership ID VPN-2026-047)." },
    { title: "Confirm payment received from Mr. Daniel (Sarphpoint booking)", contactName: "Mr. Daniel", done: false, dueDate: "2026-10-22", priority: "High", notes: "₦290,000 total payable (₦240,000 booking + ₦50,000 refundable caution deposit) to Veethrill Brands, FCMB 7554518017. Once confirmed, share access code, WiFi password and full booking confirmation." },
    { title: "Send Guest Registration Form to Mr. Daniel", contactName: "Mr. Daniel", done: false, dueDate: "2026-10-23", priority: "Medium", notes: "https://forms.gle/YKeqpbV2xUJUeKH69 — send once payment is confirmed." },
    { title: "Send Guest Feedback Form to Mr. Daniel", contactName: "Mr. Daniel", done: false, dueDate: "2026-10-26", priority: "Medium", notes: "https://forms.gle/S38oowsJ2c7ahRvR9 — send after checkout to facilitate prompt refund of the caution deposit." },
    { title: "Chase Urbanstone for Cedar Court documents if not received by 29 Sep", contactName: "Chinonso Afoaku", done: false, dueDate: "2026-09-29", priority: "Medium", notes: "Detailed document-request WhatsApp sent 24 Sep. If nothing has arrived by 29 Sep, send a gentle nudge." },
    { title: "Daily Social Media Content — Post & Broadcast (25 Sep, Friday)", done: false, dueDate: "2026-09-25", priority: "High", content: "Friday's scheduled platforms per VERA: IG Reel + TikTok + YouTube Short.", notes: "Run the veethrill-daily-content skill for today, then replace this with the day's actual topics/captions/graphics reference." },
    { title: "Push Up / Renew PropertyPro Listings (25 Sep)", done: false, dueDate: "2026-09-25", priority: "Medium", notes: "Bump all active Veethrill listings to the top of PropertyPro search daily." },
  ];

  for (const t of taskRows) {
    const contactId = t.contactName ? createdContacts[t.contactName] : null;
    await db.crmTask.create({
      data: {
        title: t.title,
        description: t.content || t.notes || null,
        status: t.done ? "COMPLETED" : "PENDING",
        priority: t.priority === "High" ? "HIGH" : t.priority === "Low" ? "LOW" : "MEDIUM",
        dueAt: t.dueDate ? new Date(t.dueDate + "T00:00:00") : null,
        notes: t.notes || null,
        contactId: contactId || null,
        ...(t.done ? { completedAt: new Date() } : {}),
      },
    });
  }

  console.log(`✅ Created ${taskRows.length} tasks.`);

  // ── INTERACTIONS / ACTIVITIES ───────────────────────────────────────────────
  console.log("💬 Creating contact activities (interactions)...");

  type ActivityRow = {
    contactName: string;
    date: string;
    type: string;
    summary: string;
    outcome?: string;
  };

  // Map artifact interaction types to platform CrmContactActivity types
  const typeMap: Record<string, string> = {
    "Call": "CALL_OUT",
    "WhatsApp": "WHATSAPP",
    "Email": "EMAIL_OUT",
    "Meeting": "MEETING",
    "Site Visit": "SITE_VISIT",
    "Follow-up": "FOLLOW_UP",
    "Note": "NOTE",
    "Other": "NOTE",
  };

  const activityRows: ActivityRow[] = [
    { contactName: "Dreams Cottage Estate Ltd", date: "2026-08-04", type: "Note", summary: "Received revised Partnership Agreement incorporating Veethrill's proposed amendments (7-day payment, buyer proof-of-payment, non-circumvention, commission survival, title indemnity, dispute resolution, non-exclusivity).", outcome: "Near execution, pending minor corrections." },
    { contactName: "Mr. Stanley Mark", date: "2026-08-12", type: "Follow-up", summary: "Sent letter requesting title/ownership docs, estate approved floor plan, unit floor plans/sizes/features, amenities, current status of building/units, and price/timeline for landlord-standard upgrade for the 31-unit Birao Street property.", outcome: "Awaiting landlord response before scheduling senior management inspection." },
    { contactName: "Mr. Odion Amos Okukpon", date: "2026-08-12", type: "Follow-up", summary: "Sent letter requesting title documents, unit/property details, and revised price/timeline if outstanding snags are fixed before sale.", outcome: "Awaiting response." },
    { contactName: "Abbeys' Square Limited", date: "2026-07-24", type: "Site Visit", summary: "Inspected the Long Lounge property and defined the full renovation scope with the engineer.", outcome: "Proceeding with acquisition and renovation." },
    { contactName: "Dreams Cottage Estate Ltd", date: "2026-09-16", type: "Note", summary: "Drafted Kaima Estate PropertyPro listing copy for the 2BR/4BR units.", outcome: "Listing live; marketing in progress." },
    { contactName: "Nigerian Agip Exploration Ltd (NAE)", date: "2026-09-22", type: "Meeting", summary: "Inspection held on the Birao Street property; landlord provided C of O and amenities list; meetings held with the NAE team.", outcome: "Terms negotiation ongoing — $20,000/unit across 32 units under discussion." },
    { contactName: "Abbeys' Square Limited", date: "2026-09-22", type: "Note", summary: "Architect drawings received for the Long Lounge acquisition & renovation.", outcome: "Awaiting Abbey Square's go-ahead to proceed to mechanical & electrical (M&E) drawings." },
    { contactName: "Nigerian Agip Exploration Ltd (NAE)", date: "2026-09-09", type: "Note", summary: "Sent Offer Letter (Ref VBR/OFL/26/1308) and Revised Proposal & Addendum (Ref VBR/ADD/26/0909) presenting Option 1 (US$20k/unit/yr, unfurnished) and Option 2 (US$35k/unit/yr, turnkey furnished, recommended).", outcome: "Awaiting NAE's option selection; terms negotiation ongoing." },
    { contactName: "Isah Sani Abdulkarim", date: "2026-05-19", type: "Note", summary: "Issued Client Advisory (Ref VBR/ADV/26/001) identifying Governor's Consent as the critical title-perfection gap before listing the Kubwa property to premium buyers.", outcome: "Awaiting owner action on Governor's Consent." },
    { contactName: "Tokunbo Ogunduyile", date: "2026-05-18", type: "Note", summary: "Completed internal intake review (Ref VBR/INT/26/001) of the Ogba, Lagos half-plot — verdict: NOT READY TO LIST (title and co-ownership both flagged high risk).", outcome: "Awaiting site inspection, full solicitor details, and title perfection before marketing begins." },
    { contactName: "Mrs Adepeju Issac Adeola", date: "2026-08-31", type: "WhatsApp", summary: "5-star guest feedback on the Sarphpoint Duboyi stay: 'Will always recommend the facility.'", outcome: "Positive" },
    { contactName: "Prince", date: "2026-09-23", type: "WhatsApp", summary: "Prince (CEO, PrimevilleModernLiving) proposed a shortlet referral partnership — wants to list Veethrill's apartment on his platform, requested property media/photos, and asked to join Veethrill's availability group to avoid booking-date clashes.", outcome: "Positive — Victory replied agreeing to partner. Media still needs to be sent." },
    { contactName: "Big Baba Boss", date: "2026-09-23", type: "WhatsApp", summary: "Victory introduced herself (via Fortune's referral), confirmed the 12noon inspection for the Maitama/Asokoro duplex option (NAE MD residence), and asked for the exact meeting location. Followed up with a voice message.", outcome: "Resolved — Big Baba Boss confirmed H-medix Asokoro as the meeting point." },
    { contactName: "Mr. Abdul", date: "2026-09-23", type: "WhatsApp", summary: "Victory forwarded the Lugbe pre-finish site video and the Kaima Estate brochure (PDF) to an inbound PropertyPro lead. Contact confirmed 'Seen forwarded.' Victory asked for their name to save the contact.", outcome: "Resolved — identified as Mr. Abdul, CEO of Yeemas Real Estate and Developers." },
    { contactName: "Stanley", date: "2026-09-23", type: "WhatsApp", summary: "Stanley shared the updated floor plan for the Birao Street / Wuse II estate (NAE 32-unit lease deal).", outcome: "Floor plan received — pending Victory's review and comparison against NAE's Option 1/2 specs." },
    { contactName: "Sarah Ogidi", date: "2026-09-23", type: "WhatsApp", summary: "Sarah sent her client's office complex requirement (Central Area/Maitama/Wuse/Garki, entire complex, furnished & serviced, parking for campaign vehicles, conference room, security, power, cleaners, internet, 4-month term, move-in 1st week Oct, open budget). Victory acknowledged and said she'll source verified complexes.", outcome: "Pending — Victory owes Sarah a reply on the commission-sharing arrangement; property sourcing in progress." },
    { contactName: "Sarah Ogidi", date: "2026-09-23", type: "WhatsApp", summary: "Sarah confirmed an equal (50/50) commission-sharing split with Veethrill if her client closes on the Central Area office complex requirement.", outcome: "Agreed — 50/50 split confirmed." },
    { contactName: "Sarah Ogidi", date: "2026-09-23", type: "WhatsApp", summary: "Shared the Central Area office complex brief + graphics with the Veethrill Partners Network group to crowdsource verified options.", outcome: "Posted — awaiting partner responses." },
    { contactName: "Chinonso Afoaku", date: "2026-09-23", type: "Meeting", summary: "Meeting with Urbanstone Development — they want to collaborate as a developer partner. Sent Developer Partnership Application form link and the corrected Veethrill company profile via WhatsApp.", outcome: "Form + brochure sent." },
    { contactName: "Chinonso Afoaku", date: "2026-09-24", type: "NOTE", summary: "Developer Partnership Application received for Cedar Court, Kuje (20 plots, ₦4.5–5.5M, R of O, 15% commission, non-exclusive mandate). Reviewed — several title, escrow and document gaps flagged.", outcome: "Pending documents & clarifications." },
    { contactName: "Chinonso Afoaku", date: "2026-09-24", type: "Email", summary: "Sent due-diligence document request + clarifications for Cedar Court, Kuje by email and WhatsApp.", outcome: "Awaiting documents." },
    { contactName: "Mr. Abdul", date: "2026-09-24", type: "WhatsApp", summary: "Follow-up exchange with Mr. Abdul (CEO, Yeemas Real Estate and Developers): he mentioned Yeemas also manages a shortlet property; Victory offered to share Veethrill's shortlet application link; mutual introduction.", outcome: "Positive — peer agency relationship opened; link-share still to be sent." },
    { contactName: "Chinonso Afoaku", date: "2026-09-24", type: "WhatsApp", summary: "Sent WhatsApp acknowledging receipt of the Developer Partnership Application for Cedar Court, Kuje, itemizing all required outstanding documents. Also asked him to confirm escrow participation and clarify the 'Not Applicable' litigation answer.", outcome: "Sent — awaiting his response and documents." },
    { contactName: "Mr. Daniel", date: "2026-09-24", type: "WhatsApp", summary: "Sent Sarphpoint Duboyi booking proposal: 23–26 Oct 2026 (3 nights), ₦240,000 booking total + ₦50,000 refundable caution deposit = ₦290,000 total payable, with FCMB payment details (Veethrill Brands, 7554518017).", outcome: "Awaiting payment confirmation" },
    { contactName: "D.I Aiyedun and Co Ltd", date: "2026-09-25", type: "Call", summary: "Called to follow up on review of Odion and Everview properties case, registration of Veethrill trade mark, signing of Veethrill retainer agreement and review of the proposed buyers kit.", outcome: "Meeting Scheduled for 4pm to address Odion case and feedback on other pending issues." },
    { contactName: "Musa", date: "2026-09-25", type: "WhatsApp", summary: "Follow up on search for commercial space for 4-month term.", outcome: "He sent 10 units of 5-bedroom duplex in Asokoro." },
    { contactName: "Dreams Cottage Estate Ltd", date: "2026-09-25", type: "WhatsApp", summary: "Gave an update on Abiodun Attah inquiry about Kaima Estate.", outcome: "He also asked about Toheeb." },
  ];

  for (const a of activityRows) {
    const contactId = createdContacts[a.contactName];
    if (!contactId) {
      console.warn(`  ⚠ No contact found for "${a.contactName}" — skipping activity`);
      continue;
    }
    await db.crmContactActivity.create({
      data: {
        contactId,
        type: typeMap[a.type] || "NOTE",
        body: a.summary,
        outcome: a.outcome || null,
        activityAt: new Date(a.date + "T00:00:00"),
      },
    });
  }

  console.log(`✅ Created ${activityRows.length} contact activities.`);

  console.log("\n🎉 Done! All real Veethrill CRM data is loaded.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
