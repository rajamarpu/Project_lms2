import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import Navbar from '../components/ui/Navbar';
import { DateRangeProvider } from '../context/DateRangeContext';
import { AdminSidebarProvider, useAdminSidebar } from '../context/AdminSidebarContext';

function AdminLayoutContent() {
  const { sidebarWidth } = useAdminSidebar();

  return (
    <div
      className="flex min-h-screen bg-[var(--admin-shell-bg)]"
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      <AdminSidebar />

      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin-left] duration-[250ms] ease-in-out ml-0"
        style={{ '--desktop-margin': `${sidebarWidth}px` }}
      >
        <style>{`
          @media (min-width: 768px) {
            .admin-content-area { margin-left: var(--desktop-margin); }
          }
        `}</style>
        <div className="admin-content-area flex-1 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-[var(--admin-shell-bg)] p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

const AdminLayout = () => {
  return (
    <DateRangeProvider>
      <AdminSidebarProvider>
        <AdminLayoutContent />
      </AdminSidebarProvider>
    </DateRangeProvider>
  );
};

export default AdminLayout;
