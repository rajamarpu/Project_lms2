import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBadgeCheck, LuBookOpen, LuChartNoAxesCombined, LuCircleAlert, LuGraduationCap, LuIndianRupee, LuLifeBuoy, LuUsers } from 'react-icons/lu';
import { BreakdownBarChart, DualBarChart, TrendAreaChart, brandPalette } from '../../../components/ui/AdminAnalyticsCharts';
import { Button, ChartPanel, EmptyState, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
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

  const reviewTrend = data?.reviewTrend || [];
  const enrollmentsTrend = data?.enrollmentsTrend?.map((item, index) => ({
    ...item,
    completed: data.completionTrend?.[index]?.completed || 0,
  })) || [];

  return (
    <PageShell eyebrow="Live analytics suite" title="Platform analytics" description="Premium operational analytics sourced only from persisted UptoSkills platform records.">
      {error ? (
        <EmptyState title="Analytics unavailable" description={error} />
      ) : !data ? (
        <LoadingState label="Calculating analytics" />
      ) : (
        <>
          <StatGrid className="xl:grid-cols-4">
            <StatWidget label="Approved learners" value={formatCount(data.activeLearners)} icon={LuUsers} tone="blue" footer={`${formatCount(data.totalLearners)} total learner accounts`} source="User role user" onClick={() => navigate('/dashboard/admin/students')} ariaLabel="Open learner accounts" />
            <StatWidget label="Approved instructors" value={formatCount(data.activeInstructors)} icon={LuGraduationCap} tone="purple" footer={`${formatCount(data.totalInstructors)} total instructor accounts`} source="User role instructor" onClick={() => navigate('/dashboard/admin/teachers')} ariaLabel="Open instructor accounts" />
            <StatWidget label="Published courses" value={formatCount(data.publishedCourses)} icon={LuBookOpen} tone="green" footer={`${formatCount(data.totalCourses)} courses across all states`} source="Course records" onClick={() => navigate('/dashboard/admin/courses')} ariaLabel="Open course records" />
            <StatWidget label="Verified revenue" value={formatCurrency(data.revenue)} icon={LuIndianRupee} tone="orange" footer={`${formatCount(data.paidTransactions)} paid INR transactions`} source="BillingRecord paid" onClick={() => navigate('/dashboard/admin/billing')} ariaLabel="Open billing records" />
            <StatWidget label="Enrollments" value={formatCount(data.enrollments)} icon={LuGraduationCap} tone="navy" footer={`${formatCount(data.activeEnrollments)} currently in progress`} source="Enrollment records" onClick={() => navigate('/dashboard/admin/courses')} ariaLabel="Open course enrollment records" />
            <StatWidget label="Completed learning" value={formatCount(data.completedEnrollments)} icon={LuBadgeCheck} tone="green" footer="Completed status or 100% progress" source="Enrollment outcomes" onClick={() => navigate('/dashboard/admin/certificates')} ariaLabel="Open certificate eligibility records" />
            <StatWidget label="Completion rate" value={`${formatCount(data.completionRate)}%`} icon={LuChartNoAxesCombined} tone="gray" footer="Completed divided by all enrollments" source="Calculated from Enrollment" onClick={() => navigate('/dashboard/admin/reports')} ariaLabel="Open reports" />
            <StatWidget label="Open tickets" value={formatCount(data.openTickets)} icon={LuCircleAlert} tone="red" footer="Open, assigned, or waiting support cases" source="Support tickets" onClick={() => navigate('/dashboard/admin/support-tickets')} ariaLabel="Open support ticket queue" />
          </StatGrid>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartPanel
              title="Monthly enrollments vs completions"
              description="A month-by-month view of demand and successful learning outcomes."
              action={<div className="chart-legend"><span className="chart-legend-item"><span style={{ backgroundColor: brandPalette.blue }} />Enrollments</span><span className="chart-legend-item"><span style={{ backgroundColor: brandPalette.teal }} />Completed</span></div>}
            >
              <div className="admin-chart-shell">
                <DualBarChart
                  data={enrollmentsTrend}
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
              title="Monthly verified revenue"
              description="Paid INR transactions grouped by month from persisted billing records."
              action={<span className="admin-chip">Paid billing only</span>}
            >
              <div className="admin-chart-shell">
                <TrendAreaChart
                  data={data.revenueTrend}
                  dataKey="revenue"
                  stroke={brandPalette.cyan}
                  fill={brandPalette.cyan}
                  valueFormatter={(value) => formatCurrency(value)}
                />
              </div>
            </ChartPanel>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartPanel
              title="Learner growth"
              description="Approved learner account creation trend over the last six months."
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/students')}>Open learners</Button>}
            >
              <div className="admin-chart-shell">
                <TrendAreaChart
                  data={data.learnerGrowthTrend}
                  dataKey="learners"
                  stroke={brandPalette.indigo}
                  fill={brandPalette.indigo}
                  valueFormatter={(value) => formatCount(value)}
                />
              </div>
            </ChartPanel>

            <ChartPanel
              title="Review quality trend"
              description="Published review volume and average rating by month."
              action={<div className="chart-legend"><span className="chart-legend-item"><span style={{ backgroundColor: brandPalette.rose }} />Reviews</span><span className="chart-legend-item"><span style={{ backgroundColor: brandPalette.sky }} />Avg rating</span></div>}
            >
              <div className="admin-chart-shell">
                <DualBarChart
                  data={reviewTrend}
                  firstKey="reviews"
                  secondKey="averageRating"
                  firstColor={brandPalette.rose}
                  secondColor={brandPalette.sky}
                  firstLabel="Published reviews"
                  secondLabel="Average rating"
                  valueFormatter={(value, key) => (key === 'averageRating' ? Number(value || 0).toFixed(2) : formatCount(value))}
                />
              </div>
            </ChartPanel>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <ChartPanel
              title="Course status distribution"
              description="Current distribution of courses across publishing lifecycle states."
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/courses')}>Manage courses</Button>}
            >
              <div className="admin-chart-shell">
                <BreakdownBarChart
                  data={data.courseStatusBreakdown}
                  dataKey="count"
                  labelKey="status"
                  palette={[brandPalette.blue, brandPalette.teal, brandPalette.cyan, brandPalette.indigo, brandPalette.rose, brandPalette.sky]}
                  valueFormatter={(value) => formatCount(value)}
                />
              </div>
            </ChartPanel>

            <ChartPanel
              title="Support ticket status"
              description="Operational support load across open and resolved ticket states."
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/support-tickets')}>Open support queue</Button>}
            >
              <div className="admin-chart-shell">
                <BreakdownBarChart
                  data={data.supportStatusBreakdown}
                  dataKey="count"
                  labelKey="status"
                  palette={[brandPalette.rose, brandPalette.cyan, brandPalette.sky, brandPalette.teal, brandPalette.indigo]}
                  valueFormatter={(value) => formatCount(value)}
                />
              </div>
            </ChartPanel>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <ChartPanel
              title="Top instructor activity"
              description="Instructor activity ranked by learner enrollments across owned courses."
              action={<Button variant="ghost" onClick={() => navigate('/dashboard/admin/teachers')}>Open instructors</Button>}
            >
              <div className="admin-chart-shell">
                <BreakdownBarChart
                  data={data.instructorActivity.map((item) => ({ ...item, status: item.name }))}
                  dataKey="enrollments"
                  labelKey="status"
                  palette={[brandPalette.indigo, brandPalette.blue, brandPalette.teal, brandPalette.cyan, brandPalette.rose]}
                  valueFormatter={(value) => formatCount(value)}
                />
              </div>
            </ChartPanel>

            <ChartPanel
              title="Operational signals"
              description="High-value live operational metrics linked to real admin workflows."
              action={<span className="admin-chip">Real-time snapshot</span>}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => navigate('/dashboard/admin/feature-hub')} className="admin-chart-shell text-left">
                  <p className="admin-eyebrow">Community and live delivery</p>
                  <p className="mt-3 text-2xl font-bold admin-text-primary">{formatCount(data.upcomingLiveSessions)}</p>
                  <p className="mt-2 text-sm admin-text-secondary">Upcoming live sessions with {formatCount(data.activeAiTutors)} active AI tutors.</p>
                </button>
                <button type="button" onClick={() => navigate('/dashboard/admin/assessments')} className="admin-chart-shell text-left">
                  <p className="admin-eyebrow">Practice and assessment</p>
                  <p className="mt-3 text-2xl font-bold admin-text-primary">{formatCount(data.activePracticeQuestions)}</p>
                  <p className="mt-2 text-sm admin-text-secondary">{formatCount(data.assessmentAttempts)} assessment attempts and an active practice bank.</p>
                </button>
                <button type="button" onClick={() => navigate('/dashboard/admin/reviews')} className="admin-chart-shell text-left">
                  <p className="admin-eyebrow">Trust and quality</p>
                  <p className="mt-3 text-2xl font-bold admin-text-primary">{formatCount(data.publishedReviews)}</p>
                  <p className="mt-2 text-sm admin-text-secondary">{Number(data.averageReviewRating || 0).toFixed(1)} average rating from published learner reviews.</p>
                </button>
                <button type="button" onClick={() => navigate('/dashboard/admin/certificates')} className="admin-chart-shell text-left">
                  <p className="admin-eyebrow">Credentialing</p>
                  <p className="mt-3 text-2xl font-bold admin-text-primary">{formatCount(data.certificatesIssued)}</p>
                  <p className="mt-2 text-sm admin-text-secondary">Active, non-revoked credentials available for learner verification.</p>
                </button>
              </div>
            </ChartPanel>
          </section>

          <p className="metrics-timestamp">Database snapshot generated {new Date(data.generatedAt).toLocaleString()}</p>
        </>
      )}
    </PageShell>
  );
}
