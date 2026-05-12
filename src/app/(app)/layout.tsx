import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Protected user app layout — requires valid session
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/auth");

  return (
    <>
      <Navbar isLoggedIn userRole={session.role} />
      <main id="main-content" className="flex-1 bg-gray-50">
        {children}
      </main>
      <Footer />
    </>
  );
}
