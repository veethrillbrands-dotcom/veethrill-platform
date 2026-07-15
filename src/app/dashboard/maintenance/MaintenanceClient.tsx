"use client";
import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { AddWorkOrderModal } from "@/components/modals/AddWorkOrderModal";
export function MaintenanceTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Maintenance" action={{ label: "New Work Order", onClick: () => setOpen(true) }} />
      {open && <AddWorkOrderModal onClose={() => setOpen(false)} />}
    </>
  );
}
