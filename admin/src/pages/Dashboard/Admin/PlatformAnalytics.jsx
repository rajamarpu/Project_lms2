import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBadgeCheck, LuBookOpen, LuChartNoAxesCombined, LuGraduationCap, LuIndianRupee, LuUsers } from 'react-icons/lu';
import { EmptyState, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

export default function PlatformAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    platformAdminApi.analytics().then((payload) => setData(payload.data)).catch((err) => setError(err.message));
  }, []);

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: data?.revenueCurrency || 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

  return (
    <PageShell eyebrow="Live analytics" title="Platform analytics" description="Exact operational metrics calculated from persisted platform records.">
      {error ? <EmptyState title="Analytics unavailable" description={error} /> : !data ? <LoadingState label="Calculating analytics" /> : <>
        <StatGrid>
          <StatWidget label="Approved learners" value={formatCount(data.activeLearners)} icon={LuUsers} tone="blue" footer={`${formatCount(data.totalLearners)} total learner accounts`} source="User role user" onClick={() => navigate('/dashboard/admin/students')} ariaLabel="Open learner accounts" />
          <StatWidget label="Approved instructors" value={formatCount(data.activeInstructors)} icon={LuGraduationCap} tone="purple" footer={`${formatCount(data.totalInstructors)} total instructor accounts`} source="User role instructor" onClick={() => navigate('/dashboard/admin/teachers')} ariaLabel="Open instructor accounts" />
          <StatWidget label="Published courses" value={formatCount(data.publishedCourses)} icon={LuBookOpen} tone="green" footer={`${formatCount(data.totalCourses)} courses across all states`} source="Course approved" onClick={() => navigate('/dashboard/admin/courses')} ariaLabel="Open course records" />
          <StatWidget label="Verified revenue" value={formatCurrency(data.revenue)} icon={LuIndianRupee} tone="orange" footer={`${formatCount(data.paidTransactions)} paid INR transactions`} source="BillingRecord paid" onClick={() => navigate('/dashboard/admin/billing')} ariaLabel="Open billing records" />
        </StatGrid>
        <StatGrid>
          <StatWidget label="Enrollments" value={formatCount(data.enrollments)} icon={LuGraduationCap} tone="blue" footer={`${formatCount(data.activeEnrollments)} currently in progress`} source="Enrollment" onClick={() => navigate('/dashboard/admin/courses')} ariaLabel="Open course enrollment records" />
          <StatWidget label="Completed learning" value={formatCount(data.completedEnrollments)} icon={LuBadgeCheck} tone="green" footer="Completed status or 100% progress" source="Enrollment" onClick={() => navigate('/dashboard/admin/certificates')} ariaLabel="Open certificate eligibility records" />
          <StatWidget label="Completion rate" value={`${formatCount(data.completionRate)}%`} icon={LuChartNoAxesCombined} tone="purple" footer="Completed divided by all enrollments" source="Calculated from Enrollment" onClick={() => navigate('/dashboard/admin/reports')} ariaLabel="Open reports" />
          <StatWidget label="Certificates issued" value={formatCount(data.certificatesIssued)} icon={LuBadgeCheck} tone="orange" footer="Active, non-revoked credentials" source="Certificate issued" onClick={() => navigate('/dashboard/admin/certificates')} ariaLabel="Open certificates" />
        </StatGrid>
        <p className="metrics-timestamp">Database snapshot generated {new Date(data.generatedAt).toLocaleString()}</p>
      </>}
    </PageShell>
  );
}
