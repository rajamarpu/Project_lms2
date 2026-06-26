import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuBadgeCheck,
  LuBookOpen,
  LuClipboardCheck,
  LuGraduationCap,
  LuIndianRupee,
  LuLifeBuoy,
  LuUsers,
} from 'react-icons/lu';
import {
  Button,
  EmptyState,
  EnterpriseTable,
  LoadingState,
  MetricCard,
  PageShell,
  StatGrid,
  StatWidget,
} from '../../../components/ui/EnterpriseUI';
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
      .then(([metrics, logs]) => {
        setAnalytics(metrics.data);
        setActivity(logs.data.slice(0, 8));
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    let active = true;
    Promise.all([platformAdminApi.analytics(), platformAdminApi.auditLogs()])
      .then(([metrics, logs]) => {
        if (!active) return;
        setAnalytics(metrics.data);
        setActivity(logs.data.slice(0, 8));
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: analytics?.revenueCurrency || 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const columns = [
    { key: 'action', header: 'Action' },
    { key: 'actor', header: 'Actor', render: (row) => row.actor?.name || 'System' },
    { key: 'targetType', header: 'Target' },
    { key: 'createdAt', header: 'Time', render: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <PageShell
      eyebrow="Live platform operations"
      title="Admin dashboard"
      description="A cleaner enterprise overview built only from persisted platform metrics and audit activity."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/dashboard/admin/courses')}>Manage courses</Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard/admin/analytics')}>
            View analytics
          </Button>
        </div>
      }
    >
      {error && !analytics ? (
        <EmptyState
          title="Dashboard data unavailable"
          description={error}
          action={<Button onClick={load}>Retry</Button>}
        />
      ) : !analytics ? (
        <LoadingState label="Loading exact platform metrics" />
      ) : (
        <>
          <section className="enterprise-card overflow-hidden">
            <div
              className="rounded-[1.4rem] border p-6 md:p-7"
              style={{
                borderColor: 'var(--admin-border)',
                background:
                  'radial-gradient(circle at 15% 18%, color-mix(in srgb, var(--brand-cyan) 18%, transparent), transparent 26%), radial-gradient(circle at 88% 18%, color-mix(in srgb, var(--brand-orange) 14%, transparent), transparent 28%), linear-gradient(145deg, color-mix(in srgb, var(--admin-surface-raised) 96%, var(--brand-blue) 4%), var(--admin-surface-raised))',
              }}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="admin-eyebrow">Enterprise portal</div>
                  <h2 className="admin-page-title !mt-3">Operational clarity for the full LMS</h2>
                  <p className="admin-page-description">
                    We keep the dashboard focused on the few metrics that matter most:
                    enrollment health, published learning inventory, verified revenue,
                    and support load.
                  </p>
                </div>
                <MetricCard
                  title="Verified revenue"
                  value={formatCurrency(analytics.revenue)}
                  badge="Snapshot"
                  tone="orange"
                  className="min-w-[240px]"
                />
              </div>
            </div>
          </section>

          <StatGrid>
            <StatWidget
              label="Approved learners"
              value={formatCount(analytics.activeLearners)}
              icon={LuUsers}
              footer={`${formatCount(analytics.totalLearners)} learner accounts`}
              source="User · approved"
              destination="learner analytics"
              tone="blue"
              onClick={() => navigate('/dashboard/admin/analytics/learners')}
            />
            <StatWidget
              label="Published courses"
              value={formatCount(analytics.publishedCourses)}
              icon={LuBookOpen}
              footer={`${formatCount(analytics.totalCourses)} courses in all states`}
              source="Course · approved"
              destination="course analytics"
              tone="green"
              onClick={() => navigate('/dashboard/admin/analytics/courses')}
            />
            <StatWidget
              label="Verified revenue"
              value={formatCurrency(analytics.revenue)}
              icon={LuIndianRupee}
              footer={`${formatCount(analytics.paidTransactions)} paid transactions`}
              source="BillingRecord · paid INR"
              destination="revenue analytics"
              tone="orange"
              onClick={() => navigate('/dashboard/admin/analytics/revenue')}
            />
            <StatWidget
              label="Open support tickets"
              value={formatCount(analytics.openTickets)}
              icon={LuLifeBuoy}
              footer="Open, assigned, and waiting tickets"
              source="SupportTicket"
              destination="support workspace"
              tone="purple"
              onClick={() => navigate('/dashboard/admin/support-tickets')}
            />
          </StatGrid>

          <StatGrid>
            <StatWidget
              label="Completion rate"
              value={`${formatCount(analytics.completionRate)}%`}
              icon={LuGraduationCap}
              footer="Completed divided by enrollments"
              source="Calculated from Enrollment"
              destination="completion-rate analytics"
              tone="green"
              onClick={() => navigate('/dashboard/admin/analytics/completion-rate')}
            />
            <StatWidget
              label="Assessment attempts"
              value={formatCount(analytics.assessmentAttempts)}
              icon={LuBadgeCheck}
              footer="Submitted attempts"
              source="AssessmentAttempt"
              destination="assessment analytics"
              tone="blue"
              onClick={() => navigate('/dashboard/admin/analytics/assessments')}
            />
            <StatWidget
              label="Assignment submissions"
              value={formatCount(analytics.assignmentSubmissions)}
              icon={LuClipboardCheck}
              footer="Submitted learner work"
              source="AssignmentSubmission"
              destination="assignment analytics"
              tone="orange"
              onClick={() => navigate('/dashboard/admin/analytics/assignments')}
            />
            <StatWidget
              label="Certificates issued"
              value={formatCount(analytics.certificatesIssued)}
              icon={LuBadgeCheck}
              footer={`${formatCount(analytics.openTickets)} support items still open`}
              source="Certificate · issued"
              destination="certificate analytics"
              tone="purple"
              onClick={() => navigate('/dashboard/admin/analytics/certificates')}
            />
          </StatGrid>

          <p className="metrics-timestamp">
            Database snapshot generated {new Date(analytics.generatedAt).toLocaleString()}
          </p>

          <section className="space-y-3">
            <div>
              <h2 className="section-title">Recent administrative activity</h2>
              <p className="section-description">
                Persisted audit events, newest first, so the portal keeps a trustworthy operational trail.
              </p>
            </div>
            <EnterpriseTable
              columns={columns}
              rows={activity}
              emptyTitle="No administrative activity recorded"
            />
          </section>
        </>
      )}
    </PageShell>
  );
}
