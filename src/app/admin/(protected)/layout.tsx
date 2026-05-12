import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Protected admin layout — requires admin role.
// login/ lives outside this group and is NOT wrapped here.
export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main id="main-content" className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
