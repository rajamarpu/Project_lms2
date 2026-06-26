import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/ui/AdminSidebar';
import Navbar from '../components/ui/Navbar';
import { DateRangeProvider } from '../context/DateRangeContext';
import { AdminSidebarProvider, useAdminSidebar } from '../context/AdminSidebarContext';

function AdminLayoutContent() {
  const { sidebarWidth } = useAdminSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const mobileDestinations = [
    ['/dashboard/admin', 'Dashboard'], ['/dashboard/admin/students', 'Learners'], ['/dashboard/admin/teachers', 'Instructors'], ['/dashboard/admin/courses', 'Courses'], ['/dashboard/admin/analytics', 'Analytics'], ['/dashboard/admin/assignments', 'Assignments'], ['/dashboard/admin/assessments', 'Assessments'], ['/dashboard/admin/certificates', 'Certificates'], ['/dashboard/admin/notifications', 'Communications'], ['/dashboard/admin/support-tickets', 'Support'], ['/dashboard/admin/settings', 'Settings'],
  ];
  const mobileValue = mobileDestinations.find(([path]) => path !== '/dashboard/admin' && location.pathname.startsWith(path))?.[0] || '/dashboard/admin';

  return (
    <div
      className="flex min-h-screen bg-[var(--admin-shell-bg)]"
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      <AdminSidebar />

      <div
        className="admin-content flex-1 flex flex-col min-h-screen transition-[margin-left] duration-[250ms] ease-in-out"
        style={{ marginLeft: 'var(--sidebar-width)' }}
      >
        <Navbar />
        <nav className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 md:hidden" aria-label="Mobile admin navigation">
          <label className="flex items-center gap-3 text-xs font-semibold admin-text-muted"><span className="shrink-0">Go to</span><select className="admin-select min-w-0 flex-1" value={mobileValue} onChange={(event) => navigate(event.target.value)}>{mobileDestinations.map(([path, label]) => <option key={path} value={path}>{label}</option>)}</select></label>
        </nav>
        <main className="flex-1 overflow-y-auto bg-[var(--admin-shell-bg)] p-6">
          <Outlet />
        </main>
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
