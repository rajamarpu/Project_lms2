import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoadingState } from '../components/ui/EnterpriseUI';

// Route Guards
import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/AdminLayout';

const AdminLogin = lazy(() => import('../pages/Auth/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/Dashboard/Admin/Dashboard'));
const corePage = (name) => lazy(() => import('../pages/Dashboard/Admin/CoreManagement').then((module) => ({ default: module[name] })));
const persistedPage = (name) => lazy(() => import('../pages/Dashboard/Admin/PersistedOperations').then((module) => ({ default: module[name] })));
const AdminStudents = corePage('LearnersPage');
const AdminCourses = corePage('CoursesPage');
const AdminTeachers = corePage('InstructorsPage');
const AdminAnalytics = lazy(() => import('../pages/Dashboard/Admin/PlatformAnalytics'));
const AdminReviews = persistedPage('ReviewsPage');
const AdminSettings = lazy(() => import('../pages/Dashboard/Admin/Settings'));
const CourseWorkspace = lazy(() => import('../pages/Dashboard/Admin/CourseWorkspace'));
const Communications = lazy(() => import('../pages/Dashboard/Admin/Communications'));
const FeatureHub = lazy(() => import('../pages/Dashboard/Admin/FeatureHub'));

const ActivityLogs = persistedPage('AuditLogPage');
const Assessments = persistedPage('AssessmentsPage');
const Assignments = persistedPage('AssignmentsPage');
const AuditLogs = persistedPage('AuditLogPage');
const Billing = persistedPage('BillingPage');
const Certificates = persistedPage('CertificatesPage');
const Reports = lazy(() => import('../pages/Dashboard/Admin/PlatformAnalytics'));
const SupportTickets = persistedPage('SupportTicketsPage');

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen p-6 bg-[var(--admin-shell-bg)]"><LoadingState /></div>}>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Admin Dashboard Routes */}
          <Route element={<AdminLayout />}>
            <Route element={<AdminRoute />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/students" element={<AdminStudents />} />
              <Route path="/dashboard/admin/courses" element={<AdminCourses />} />
              <Route path="/dashboard/admin/teachers" element={<AdminTeachers />} />
              <Route path="/dashboard/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/dashboard/admin/feature-hub" element={<FeatureHub />} />
              <Route path="/dashboard/admin/reviews" element={<AdminReviews />} />
              <Route path="/dashboard/admin/notifications" element={<Communications />} />
              <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
              <Route path="/dashboard/admin/system" element={<Navigate to="/dashboard/admin/analytics" replace />} />
              <Route path="/dashboard/admin/students/:studentId" element={<AdminStudents />} />
              <Route path="/dashboard/admin/teachers/:teacherId" element={<AdminTeachers />} />
              <Route path="/dashboard/admin/courses/:courseId" element={<AdminCourses />} />
              <Route path="/dashboard/admin/courses/:courseId/edit" element={<CourseWorkspace />} />
              <Route path="/dashboard/admin/course-builder" element={<AdminCourses />} />
              <Route path="/dashboard/admin/certificates" element={<Certificates />} />
              <Route path="/dashboard/admin/assignments" element={<Assignments />} />
              <Route path="/dashboard/admin/assessments" element={<Assessments />} />
              <Route path="/dashboard/admin/billing" element={<Billing />} />
              <Route path="/dashboard/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/dashboard/admin/activity-logs" element={<ActivityLogs />} />
              <Route path="/dashboard/admin/support-tickets" element={<SupportTickets />} />
              <Route path="/dashboard/admin/reports" element={<Reports />} />
              <Route path="/dashboard/admin/profile" element={<AdminSettings />} />

              <Route path="/dashboard" element={<Navigate to="/dashboard/admin" replace />} />
              <Route path="/students" element={<AdminStudents />} />
              <Route path="/students/:studentId" element={<AdminStudents />} />
              <Route path="/teachers" element={<AdminTeachers />} />
              <Route path="/teachers/:teacherId" element={<AdminTeachers />} />
              <Route path="/courses" element={<AdminCourses />} />
              <Route path="/courses/:courseId" element={<AdminCourses />} />
              <Route path="/courses/:courseId/edit" element={<CourseWorkspace />} />
              <Route path="/course-builder" element={<AdminCourses />} />
              <Route path="/analytics" element={<AdminAnalytics />} />
              <Route path="/feature-hub" element={<FeatureHub />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/notifications" element={<Communications />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="/system-settings" element={<Navigate to="/dashboard/admin/analytics" replace />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/activity-logs" element={<ActivityLogs />} />
              <Route path="/support-tickets" element={<SupportTickets />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Redirect any other path to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
