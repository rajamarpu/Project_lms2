import { useEffect, useState } from 'react';
import { LuBadgeCheck, LuBookOpen, LuChartNoAxesCombined, LuClipboardCheck, LuGraduationCap, LuIndianRupee, LuLifeBuoy, LuMessageSquare, LuUsers } from 'react-icons/lu';
import { EmptyState, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');

export default function PlatformAnalytics() {
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
          <StatWidget label="Approved learners" value={formatCount(data.activeLearners)} icon={LuUsers} footer={`${formatCount(data.totalLearners)} total learner accounts`} source="User · role user" />
          <StatWidget label="Approved instructors" value={formatCount(data.activeInstructors)} icon={LuGraduationCap} tone="purple" footer={`${formatCount(data.totalInstructors)} total instructor accounts`} source="User · role instructor" />
          <StatWidget label="Published courses" value={formatCount(data.publishedCourses)} icon={LuBookOpen} tone="green" footer={`${formatCount(data.totalCourses)} courses across all states`} source="Course · approved" />
          <StatWidget label="Verified revenue" value={formatCurrency(data.revenue)} icon={LuIndianRupee} tone="orange" footer={`${formatCount(data.paidTransactions)} paid INR transactions`} source="BillingRecord · paid" />
        </StatGrid>
        <StatGrid>
          <StatWidget label="Enrollments" value={formatCount(data.enrollments)} icon={LuGraduationCap} footer={`${formatCount(data.activeEnrollments)} currently in progress`} source="Enrollment" />
          <StatWidget label="Completed learning" value={formatCount(data.completedEnrollments)} icon={LuBadgeCheck} tone="green" footer="Completed status or 100% progress" source="Enrollment" />
          <StatWidget label="Completion rate" value={`${formatCount(data.completionRate)}%`} icon={LuChartNoAxesCombined} tone="purple" footer="Completed divided by all enrollments" source="Calculated from Enrollment" />
          <StatWidget label="Certificates issued" value={formatCount(data.certificatesIssued)} icon={LuBadgeCheck} tone="orange" footer="Active, non-revoked credentials" source="Certificate · issued" />
        </StatGrid>
        <StatGrid>
          <StatWidget label="Assessment attempts" value={formatCount(data.assessmentAttempts)} icon={LuChartNoAxesCombined} footer="Submitted attempts only" source="AssessmentAttempt" />
          <StatWidget label="Assignment submissions" value={formatCount(data.assignmentSubmissions)} icon={LuClipboardCheck} tone="green" footer="Submitted learner work" source="AssignmentSubmission" />
          <StatWidget label="Open support tickets" value={formatCount(data.openTickets)} icon={LuLifeBuoy} tone="orange" footer="Open, assigned, or waiting" source="SupportTicket" />
          <StatWidget label="Published reviews" value={formatCount(data.publishedReviews)} icon={LuMessageSquare} tone="purple" footer={`${Number(data.averageReviewRating || 0).toFixed(2)} average rating`} source="CourseReview · published" />
        </StatGrid>
        <p className="metrics-timestamp">Database snapshot generated {new Date(data.generatedAt).toLocaleString()}</p>
      </>}
    </PageShell>
  );
}
