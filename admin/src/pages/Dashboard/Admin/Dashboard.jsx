import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBadgeCheck, LuBookOpen, LuChartNoAxesCombined, LuClipboardCheck, LuGraduationCap, LuIndianRupee, LuUsers } from 'react-icons/lu';
import { Button, EmptyState, EnterpriseTable, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    Promise.all([platformAdminApi.analytics(), platformAdminApi.auditLogs()])
      .then(([metrics, logs]) => { setAnalytics(metrics.data); setActivity(logs.data.slice(0, 8)); })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    let active = true;
    Promise.all([platformAdminApi.analytics(), platformAdminApi.auditLogs()])
      .then(([metrics, logs]) => { if (active) { setAnalytics(metrics.data); setActivity(logs.data.slice(0, 8)); } })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);

  const columns = [
    { key: 'action', header: 'Action' },
    { key: 'actor', header: 'Actor', render: (row) => row.actor?.name || 'System' },
    { key: 'targetType', header: 'Target' },
    { key: 'createdAt', header: 'Time', render: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: analytics?.revenueCurrency || 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

  return (
    <PageShell eyebrow="Live platform data" title="Admin dashboard" description="Exact database metrics and recent persisted administrative activity." actions={<div className="flex flex-wrap gap-2"><Button onClick={() => navigate('/dashboard/admin/courses')}>Manage courses</Button><Button variant="ghost" onClick={() => navigate('/dashboard/admin/analytics')}>View analytics</Button></div>}>
      {error ? <EmptyState title="Dashboard data unavailable" description={error} action={<Button onClick={load}>Retry</Button>} /> : !analytics ? <LoadingState label="Loading exact platform metrics" /> : <>
        <StatGrid>
          <StatWidget label="Approved learners" value={formatCount(analytics.activeLearners)} icon={LuUsers} footer={`${formatCount(analytics.totalLearners)} learner accounts`} source="User · approved" />
          <StatWidget label="Published courses" value={formatCount(analytics.publishedCourses)} icon={LuBookOpen} tone="purple" footer={`${formatCount(analytics.totalCourses)} courses in all states`} source="Course · approved" />
          <StatWidget label="Enrollments" value={formatCount(analytics.enrollments)} icon={LuGraduationCap} tone="green" footer={`${formatCount(analytics.completedEnrollments)} completed`} source="Enrollment" />
          <StatWidget label="Verified revenue" value={formatCurrency(analytics.revenue)} icon={LuIndianRupee} tone="orange" footer={`${formatCount(analytics.paidTransactions)} paid transactions`} source="BillingRecord · paid INR" />
        </StatGrid>
        <StatGrid>
          <StatWidget label="Completion rate" value={`${formatCount(analytics.completionRate)}%`} icon={LuChartNoAxesCombined} footer="Completed divided by enrollments" source="Calculated from Enrollment" />
          <StatWidget label="Assessment attempts" value={formatCount(analytics.assessmentAttempts)} icon={LuChartNoAxesCombined} tone="purple" footer="Submitted attempts" source="AssessmentAttempt" />
          <StatWidget label="Assignment submissions" value={formatCount(analytics.assignmentSubmissions)} icon={LuClipboardCheck} tone="green" footer="Submitted learner work" source="AssignmentSubmission" />
          <StatWidget label="Certificates issued" value={formatCount(analytics.certificatesIssued)} icon={LuBadgeCheck} tone="orange" footer="Active credentials" source="Certificate · issued" />
        </StatGrid>
        <p className="metrics-timestamp">Database snapshot generated {new Date(analytics.generatedAt).toLocaleString()}</p>
        <section className="space-y-3"><div><h2 className="section-title">Recent administrative activity</h2><p className="section-description">Persisted audit events, newest first.</p></div><EnterpriseTable columns={columns} rows={activity} emptyTitle="No administrative activity recorded" /></section>
      </>}
    </PageShell>
  );
}
