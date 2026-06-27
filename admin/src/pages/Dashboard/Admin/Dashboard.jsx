import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuActivity,
  LuBadgeCheck,
  LuBookOpen,
  LuChartNoAxesCombined,
  LuCircleAlert,
  LuGraduationCap,
  LuIndianRupee,
  LuLifeBuoy,
  LuShieldCheck,
  LuUsers,
} from 'react-icons/lu';
import { Button, ChartPanel, EmptyState, LoadingState, PageShell, ProgressBar, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { BreakdownBarChart, DualBarChart, TrendAreaChart, brandPalette } from '../../../components/ui/AdminAnalyticsCharts';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const percent = (part, total) => {
  const base = Number(total || 0);
  if (!base) return 0;
  return Math.round((Number(part || 0) / base) * 100);
};

function InsightCard({ icon: Icon, label, title, description, tone = 'blue', action }) {
  return (
    <article className={`admin-insight-card tone-${tone}`}>
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="admin-eyebrow">{label}</p>
          <h2 className="mt-2 text-lg font-semibold admin-text-primary">{title}</h2>
          <p className="mt-2 text-sm leading-6 admin-text-secondary">{description}</p>
        </div>
        <div className="stat-icon">
          <Icon size={18} aria-hidden />
        </div>
      </div>
      {action && <div className="relative z-10 mt-5">{action}</div>}
    </article>
  );
}

function LifecycleRow({ label, value, total, tone }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface)] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold admin-text-primary">{label}</span>
        <span className="text-sm admin-text-secondary">{formatCount(value)}</span>
      </div>
      <ProgressBar value={percent(value, total)} tone={tone} />
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await platformAdminApi.analytics();
      setAnalytics(payload.data);
    } catch (err) {
      setAnalytics(null);
      setError(err.message || 'Dashboard data unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    platformAdminApi.analytics()
      .then((payload) => {
        if (active) setAnalytics(payload.data);
      })
      .catch((err) => {
        if (!active) return;
        setAnalytics(null);
        setError(err.message || 'Dashboard data unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const dashboardCards = analytics ? [
    {
      label: 'Learners',
      value: formatCount(analytics.totalLearners),
      icon: LuUsers,
      tone: 'blue',
      delta: `${formatCount(analytics.activeLearners)} approved`,
      footer: 'Server-backed learner accounts',
      source: 'Users directory',
      path: '/dashboard/admin/students',
      ariaLabel: 'Open learner management',
    },
    {
      label: 'Courses',
      value: formatCount(analytics.totalCourses),
      icon: LuBookOpen,
      tone: 'green',
      delta: `${formatCount(analytics.publishedCourses)} published`,
      footer: 'Catalog across all lifecycle states',
      source: 'Course records',
      path: '/dashboard/admin/courses',
      ariaLabel: 'Open course management',
    },
    {
      label: 'Instructors',
      value: formatCount(analytics.totalInstructors),
      icon: LuGraduationCap,
      tone: 'purple',
      delta: `${formatCount(analytics.activeInstructors)} approved`,
      footer: 'Teaching and delivery network',
      source: 'Instructor records',
      path: '/dashboard/admin/teachers',
      ariaLabel: 'Open instructor management',
    },
    {
      label: 'Revenue',
      value: formatCurrency(analytics.revenue),
      icon: LuIndianRupee,
      tone: 'orange',
      delta: `${formatCount(analytics.paidTransactions)} verified payments`,
      footer: 'Paid INR billing records only',
      source: 'Billing records',
      path: '/dashboard/admin/billing',
      ariaLabel: 'Open billing records',
    },
  ] : [];

  const hardError = !analytics && error;
  const generatedAt = analytics?.generatedAt ? new Date(analytics.generatedAt) : new Date();
  const completionRate = Number(analytics?.completionRate || 0);
  const enrollmentTrend = analytics?.enrollmentsTrend?.map((item, index) => ({
    ...item,
    completed: analytics.completionTrend?.[index]?.completed || 0,
  })) || [];

  return (
    <PageShell
      eyebrow="Executive admin console"
      title="UptoSkills command center"
      description="A premium operational dashboard powered by real learner, course, billing, review, and support records."
      actions={<div className="flex flex-wrap gap-2"><Button onClick={() => navigate('/dashboard/admin/courses')}>Create / publish course</Button><Button variant="ghost" onClick={() => navigate('/dashboard/admin/analytics')}>Open full analytics</Button></div>}
    >
      {hardError ? (
        <EmptyState title="Dashboard data unavailable" description={error} action={<Button onClick={load}>Retry</Button>} />
      ) : loading ? (
        <LoadingState label="Loading exact platform metrics" />
      ) : (
        <>
          <StatGrid className="dashboard-primary-metrics xl:grid-cols-4">
            {dashboardCards.map((card) => (
              <StatWidget key={card.label} {...card} onClick={() => navigate(card.path)} />
            ))}
          </StatGrid>

          <section className="admin-insight-grid">
            <InsightCard
              icon={LuActivity}
              label="Platform pulse"
              title={`${formatCount(analytics.enrollments)} total enrollments`}
              description={`${formatCount(analytics.completedEnrollments)} completed journeys and ${completionRate}% completion across persisted enrollment records.`}
              tone="blue"
              action={<ProgressBar value={completionRate} tone="blue" />}
            />
            <InsightCard
              icon={LuShieldCheck}
              label="Trust signal"
              title={`${formatCount(analytics.certificatesIssued)} certificates issued`}
              description={`${formatCount(analytics.publishedReviews)} published reviews with ${Number(analytics.averageReviewRating || 0).toFixed(1)} average learner rating.`}
              tone="green"
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/certificates')}>Review credentials</Button>}
            />
            <InsightCard
              icon={LuCircleAlert}
              label="Needs attention"
              title={`${formatCount(analytics.openTickets)} open support tickets`}
              description={`${formatCount(analytics.pendingCourses)} pending courses, ${formatCount(analytics.draftCourses)} drafts, and ${formatCount(analytics.openCommunityReports)} community reports to review.`}
              tone="red"
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/support-tickets')}>Open support queue</Button>}
            />
          </section>

          <section className="admin-balanced-grid">
            <ChartPanel
              className="h-full"
              title="Enrollments and completions"
              description="Monthly learning demand versus completed outcomes."
              action={<div className="chart-legend"><span className="chart-legend-item"><span style={{ backgroundColor: brandPalette.blue }} />Enrollments</span><span className="chart-legend-item"><span style={{ backgroundColor: brandPalette.teal }} />Completed</span></div>}
            >
              <div className="admin-chart-shell">
                <DualBarChart
                  data={enrollmentTrend}
                  firstKey="enrollments"
                  secondKey="completed"
                  firstColor={brandPalette.blue}
                  secondColor={brandPalette.teal}
                  firstLabel="Enrollments"
                  secondLabel="Completed"
                  valueFormatter={(value) => formatCount(value)}
                />
              </div>
            </ChartPanel>

            <ChartPanel
              className="h-full"
              title="Verified revenue trend"
              description="Paid INR billing records grouped by month."
              action={<span className="admin-chip">Real billing data</span>}
            >
              <div className="admin-chart-shell">
                <TrendAreaChart
                  data={analytics.revenueTrend}
                  dataKey="revenue"
                  stroke={brandPalette.cyan}
                  fill={brandPalette.cyan}
                  valueFormatter={(value) => formatCurrency(value)}
                />
              </div>
            </ChartPanel>
          </section>

          <section className="admin-balanced-grid">
            <ChartPanel
              className="h-full"
              title="Course lifecycle"
              description="Current publishing health across the canonical catalog."
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/courses')}>Manage catalog</Button>}
            >
              <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="grid gap-3">
                  <LifecycleRow label="Published and visible" value={analytics.publishedCourses} total={analytics.totalCourses} tone="green" />
                  <LifecycleRow label="Draft courses" value={analytics.draftCourses} total={analytics.totalCourses} tone="orange" />
                  <LifecycleRow label="Pending review" value={analytics.pendingCourses} total={analytics.totalCourses} tone="red" />
                </div>
                <div className="admin-chart-shell">
                  <BreakdownBarChart
                    data={analytics.courseStatusBreakdown}
                    dataKey="count"
                    labelKey="status"
                    palette={[brandPalette.blue, brandPalette.teal, brandPalette.cyan, brandPalette.indigo, brandPalette.rose, brandPalette.sky]}
                    valueFormatter={(value) => formatCount(value)}
                  />
                </div>
              </div>
            </ChartPanel>

            <ChartPanel
              className="h-full"
              title="Instructor activity"
              description="Top instructors by course enrollments from real course ownership records."
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/teachers')}>Open instructor network</Button>}
            >
              <div className="admin-chart-shell">
                <BreakdownBarChart
                  data={analytics.instructorActivity.map((item) => ({ ...item, status: item.name }))}
                  dataKey="enrollments"
                  labelKey="status"
                  palette={[brandPalette.indigo, brandPalette.blue, brandPalette.teal, brandPalette.cyan, brandPalette.rose]}
                  valueFormatter={(value) => formatCount(value)}
                />
              </div>
            </ChartPanel>
          </section>

          <section className="admin-feature-grid">
            <button type="button" onClick={() => navigate('/dashboard/admin/assessments')} className="enterprise-card h-full text-left">
              <span className="admin-chip">Learning quality</span>
              <h2 className="mt-4 section-title">Practice and assessment bank</h2>
              <p className="section-description">{formatCount(analytics.activePracticeQuestions)} live practice questions and {formatCount(analytics.assessmentAttempts)} assessment attempts captured so far.</p>
            </button>
            <button type="button" onClick={() => navigate('/dashboard/admin/feature-hub')} className="enterprise-card h-full text-left">
              <span className="admin-chip">Engagement</span>
              <h2 className="mt-4 section-title">Live teaching pipeline</h2>
              <p className="section-description">{formatCount(analytics.upcomingLiveSessions)} upcoming live sessions, {formatCount(analytics.totalLiveSessions)} total sessions, and {formatCount(analytics.activeAiTutors)} active AI tutors.</p>
            </button>
            <button type="button" onClick={() => navigate('/dashboard/admin/reviews')} className="enterprise-card h-full text-left">
              <LuLifeBuoy className="text-[var(--accent)]" size={22} />
              <h2 className="mt-4 section-title">Support and trust</h2>
              <p className="section-description">{formatCount(analytics.openTickets)} support tickets open with {formatCount(analytics.publishedReviews)} published reviews and {formatCount(analytics.certificatesIssued)} active credentials.</p>
            </button>
          </section>

          <div className="flex justify-end">
            <p className="metrics-timestamp">Database snapshot generated {generatedAt.toLocaleString()}</p>
          </div>
        </>
      )}
    </PageShell>
  );
}
