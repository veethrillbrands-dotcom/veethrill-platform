"use client";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { AddLeaseModal } from "@/components/modals/AddLeaseModal";
export function LeasesTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Leases" action={{ label: "New Lease", onClick: () => setOpen(true) }} />
      {open && <AddLeaseModal onClose={() => setOpen(false)} />}
    </>
  );
}
