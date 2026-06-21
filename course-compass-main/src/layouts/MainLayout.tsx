import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export const MainLayout = () => (
  <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
    <Navbar />
    <main id="main-content" className="min-w-0 flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);
