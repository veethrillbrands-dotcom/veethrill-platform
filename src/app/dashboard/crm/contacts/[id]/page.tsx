import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Topbar } from "@/components/layout/Topbar";
import { ContactDetailClient } from "./ContactDetailClient";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [contact, properties, invoices] = await Promise.all([
    db.crmContact.findUnique({
      where: { id },
      include: {
        deals: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { activityAt: "desc" } },
        properties: { include: { property: { include: { units: true } } } },
      },
    }),
    db.property.findMany({ select: { id: true, name: true, city: true, type: true, units: { select: { id: true } } }, orderBy: { name: "asc" } }),
    db.invoice.findMany({ select: { id: true, invoiceNumber: true, type: true, status: true, total: true, issuedAt: true, dueDate: true, description: true, recipientName: true } }),
  ]);

  if (!contact) notFound();

  // Match invoices by email or name
  const contactInvoices = invoices.filter((inv) =>
    contact.email ? inv.recipientName?.toLowerCase() === contact.name.toLowerCase() : false
  );

  // Fetch documents linked to this contact
  const documents = await db.document.findMany({
    where: { entityType: "contact", entityId: id },
    orderBy: { createdAt: "desc" },
  });

  const serialized = {
    ...contact,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
    deals: contact.deals.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      dueDate: d.dueDate?.toISOString() ?? null,
    })),
    activities: contact.activities.map((a) => ({
      ...a,
      activityAt: a.activityAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    properties: contact.properties.map((cp) => ({
      ...cp,
      createdAt: cp.createdAt.toISOString(),
      property: {
        ...cp.property,
        createdAt: cp.property.createdAt.toISOString(),
        updatedAt: cp.property.updatedAt.toISOString(),
        units: cp.property.units.map((u) => ({ ...u, createdAt: u.createdAt.toISOString(), updatedAt: u.updatedAt.toISOString() })),
      },
    })),
  };

  const serializedInvoices = contactInvoices.map((i) => ({
    ...i,
    issuedAt: i.issuedAt.toISOString(),
    dueDate: i.dueDate.toISOString(),
  }));

  const serializedDocs = documents.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
  }));

  const allProperties = properties.map((p) => ({
    id: p.id, name: p.name, city: p.city, type: p.type, unitCount: p.units.length,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title={contact.name} backHref="/dashboard/crm/contacts" />
      <ContactDetailClient
        contact={serialized}
        allProperties={allProperties}
        invoices={serializedInvoices}
        documents={serializedDocs}
      />
    </div>
  );
}
