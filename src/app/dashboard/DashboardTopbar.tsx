"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { AddPropertyModal } from "@/components/modals/AddPropertyModal";

export function DashboardTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Topbar title="Executive Dashboard" action={{ label: "Add Property", onClick: () => setOpen(true) }} />
      {open && <AddPropertyModal onClose={() => setOpen(false)} />}
    </>
  );
}
