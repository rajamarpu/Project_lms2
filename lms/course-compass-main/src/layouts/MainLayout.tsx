import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export const MainLayout = () => (
  <div className="relative flex min-h-screen min-w-0 flex-col overflow-x-clip">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_15%,rgba(16,185,168,0.18),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(47,111,236,0.14),transparent_22%),radial-gradient(circle_at_50%_105%,rgba(255,107,26,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_12%_15%,rgba(16,185,168,0.22),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(47,111,236,0.16),transparent_22%),radial-gradient(circle_at_50%_105%,rgba(255,107,26,0.16),transparent_30%)]"
    />
    <Navbar />
    <main id="main-content" className="relative min-w-0 flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);
