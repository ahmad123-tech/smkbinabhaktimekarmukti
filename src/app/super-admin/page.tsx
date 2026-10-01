import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import SuperAdminDashboardClient from "./SuperAdminDashboardClient";

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SUPER_ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="super-admin" />
      <main className="flex-1 p-8">
        <Topbar title="Dashboard Super Admin" />
        <SuperAdminDashboardClient />
      </main>
    </div>
  );
}
