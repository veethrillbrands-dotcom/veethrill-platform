import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PortalSidebar } from "@/components/portal/PortalSidebar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <PortalSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
