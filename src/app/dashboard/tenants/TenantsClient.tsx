"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { AddTenantModal } from "@/components/modals/AddTenantModal";

export function TenantsTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Tenants" action={{ label: "Add Tenant", onClick: () => setOpen(true) }} />
      {open && <AddTenantModal onClose={() => setOpen(false)} />}
    </>
  );
}
