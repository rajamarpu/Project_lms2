import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuBadgeCheck, LuBookOpen, LuChartNoAxesCombined, LuClipboardCheck, LuGraduationCap, LuIndianRupee, LuLifeBuoy, LuMessageSquare, LuRefreshCw, LuUsers } from 'react-icons/lu';
import { Button, EmptyState, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

export default function PlatformAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async ({ refresh = false } = {}) => {
    setError('');
    if (refresh) setRefreshing(true);
    try {
      const payload = await platformAdminApi.analytics();
      setData(payload.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    platformAdminApi.analytics()
      .then((payload) => { if (active) setData(payload.data); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, []);

  const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: data?.revenueCurrency || 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

  return (
    <PageShell eyebrow="Live analytics" title="Platform analytics" description="Exact operational metrics calculated from persisted platform records." actions={<Button variant="ghost" icon={LuRefreshCw} disabled={refreshing} onClick={() => load({ refresh: true })}>{refreshing ? 'Refreshing' : 'Refresh metrics'}</Button>}>
      {error && !data ? <EmptyState title="Analytics unavailable" description={error} action={<Button onClick={() => load()}>Retry</Button>} /> : !data ? <LoadingState label="Calculating analytics" /> : <>
        {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">Could not refresh: {error}. Showing the last successful snapshot.</p>}
        <StatGrid>
          <StatWidget label="Approved learners" value={formatCount(data.activeLearners)} icon={LuUsers} footer={`${formatCount(data.totalLearners)} total learner accounts`} source="User · role user" destination="learner analytics" onClick={() => navigate('/dashboard/admin/analytics/learners')} />
          <StatWidget label="Approved instructors" value={formatCount(data.activeInstructors)} icon={LuGraduationCap} tone="purple" footer={`${formatCount(data.totalInstructors)} total instructor accounts`} source="User · role instructor" destination="instructor analytics" onClick={() => navigate('/dashboard/admin/analytics/instructors')} />
          <StatWidget label="Published courses" value={formatCount(data.publishedCourses)} icon={LuBookOpen} tone="green" footer={`${formatCount(data.totalCourses)} courses across all states`} source="Course · approved" destination="course analytics" onClick={() => navigate('/dashboard/admin/analytics/courses')} />
          <StatWidget label="Verified revenue" value={formatCurrency(data.revenue)} icon={LuIndianRupee} tone="orange" footer={`${formatCount(data.paidTransactions)} paid INR transactions`} source="BillingRecord · paid" destination="revenue analytics" onClick={() => navigate('/dashboard/admin/analytics/revenue')} />
        </StatGrid>
        <StatGrid>
          <StatWidget label="Enrollments" value={formatCount(data.enrollments)} icon={LuGraduationCap} footer={`${formatCount(data.activeEnrollments)} currently in progress`} source="Enrollment" destination="enrollment analytics" onClick={() => navigate('/dashboard/admin/analytics/enrollments')} />
          <StatWidget label="Completed learning" value={formatCount(data.completedEnrollments)} icon={LuBadgeCheck} tone="green" footer="Completed status or 100% progress" source="Enrollment" destination="completion analytics" onClick={() => navigate('/dashboard/admin/analytics/completions')} />
          <StatWidget label="Completion rate" value={`${formatCount(data.completionRate)}%`} icon={LuChartNoAxesCombined} tone="purple" footer="Completed divided by all enrollments" source="Calculated from Enrollment" destination="completion-rate analytics" onClick={() => navigate('/dashboard/admin/analytics/completion-rate')} />
          <StatWidget label="Certificates issued" value={formatCount(data.certificatesIssued)} icon={LuBadgeCheck} tone="orange" footer="Active, non-revoked credentials" source="Certificate · issued" destination="certificate analytics" onClick={() => navigate('/dashboard/admin/analytics/certificates')} />
        </StatGrid>
        <StatGrid>
          <StatWidget label="Assessment attempts" value={formatCount(data.assessmentAttempts)} icon={LuChartNoAxesCombined} footer="Submitted attempts only" source="AssessmentAttempt" destination="assessment analytics" onClick={() => navigate('/dashboard/admin/analytics/assessments')} />
          <StatWidget label="Assignment submissions" value={formatCount(data.assignmentSubmissions)} icon={LuClipboardCheck} tone="green" footer="Submitted learner work" source="AssignmentSubmission" destination="assignment analytics" onClick={() => navigate('/dashboard/admin/analytics/assignments')} />
          <StatWidget label="Open support tickets" value={formatCount(data.openTickets)} icon={LuLifeBuoy} tone="orange" footer="Open, assigned, or waiting" source="SupportTicket" destination="support analytics" onClick={() => navigate('/dashboard/admin/analytics/tickets')} />
          <StatWidget label="Published reviews" value={formatCount(data.publishedReviews)} icon={LuMessageSquare} tone="purple" footer={`${Number(data.averageReviewRating || 0).toFixed(2)} average rating`} source="CourseReview · published" destination="review analytics" onClick={() => navigate('/dashboard/admin/analytics/reviews')} />
        </StatGrid>
        <p className="metrics-timestamp">Database snapshot generated {new Date(data.generatedAt).toLocaleString()}</p>
      </>}
    </PageShell>
  );
}
