import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LuArrowLeft, LuArrowRight, LuBadgeCheck, LuBookOpen, LuChartNoAxesCombined,
  LuClipboardCheck, LuGraduationCap, LuIndianRupee, LuLifeBuoy, LuMessageSquare,
  LuRefreshCw, LuUsers,
} from 'react-icons/lu';
import { Button, EmptyState, EnterpriseTable, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const count = (value) => Number(value || 0).toLocaleString('en-IN');
const date = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—';

const metricConfig = {
  learners: { title: 'Learner analytics', eyebrow: 'People intelligence', description: 'Approved learner accounts, access state, and recent growth records.', icon: LuUsers, value: (m) => count(m.activeLearners), context: (m) => [`${count(m.totalLearners)} total accounts`, `${count(m.enrollments)} enrollments`, `${count(m.completedEnrollments)} completions`], load: () => platformAdminApi.users('user'), manage: '/dashboard/admin/students', manageLabel: 'Manage learners', columns: [{ key: 'name', header: 'Learner' }, { key: 'email', header: 'Email' }, { key: 'status', header: 'Status' }, { key: 'createdAt', header: 'Joined', render: (r) => date(r.createdAt) }] },
  instructors: { title: 'Instructor analytics', eyebrow: 'Teaching network', description: 'Approved instructors and the accounts responsible for course delivery.', icon: LuGraduationCap, value: (m) => count(m.activeInstructors), context: (m) => [`${count(m.totalInstructors)} total accounts`, `${count(m.publishedCourses)} published courses`, `${count(m.totalCourses)} courses overall`], load: () => platformAdminApi.users('instructor'), manage: '/dashboard/admin/teachers', manageLabel: 'Manage instructors', columns: [{ key: 'name', header: 'Instructor' }, { key: 'email', header: 'Email' }, { key: 'status', header: 'Status' }, { key: 'createdAt', header: 'Joined', render: (r) => date(r.createdAt) }] },
  courses: { title: 'Course analytics', eyebrow: 'Catalog performance', description: 'Published catalog coverage and the current course lifecycle mix.', icon: LuBookOpen, value: (m) => count(m.publishedCourses), context: (m) => [`${count(m.totalCourses)} total courses`, `${count(m.draftCourses)} drafts`, `${count(m.pendingCourses)} awaiting review`], load: () => platformAdminApi.courses(), manage: '/dashboard/admin/courses', manageLabel: 'Manage courses', columns: [{ key: 'title', header: 'Course' }, { key: 'category', header: 'Category' }, { key: 'status', header: 'Status' }, { key: 'enrollments', header: 'Enrollments', render: (r) => count(r._count?.enrollments) }] },
  revenue: { title: 'Revenue analytics', eyebrow: 'Verified commerce', description: 'Revenue includes persisted paid INR billing records only.', icon: LuIndianRupee, value: (m) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: m.revenueCurrency || 'INR', maximumFractionDigits: 0 }).format(Number(m.revenue || 0)), context: (m) => [`${count(m.paidTransactions)} paid transactions`, 'INR settlement currency', 'Verified billing records'], load: () => platformAdminApi.operations('billing'), manage: '/dashboard/admin/billing', manageLabel: 'Open billing', columns: [{ key: 'providerRef', header: 'Reference' }, { key: 'amount', header: 'Amount', render: (r) => `${r.currency} ${Number(r.amount || 0).toLocaleString('en-IN')}` }, { key: 'status', header: 'Status' }, { key: 'createdAt', header: 'Date', render: (r) => date(r.createdAt) }] },
  enrollments: { title: 'Enrollment analytics', eyebrow: 'Learning participation', description: 'Enrollment volume and active learning participation across the platform.', icon: LuGraduationCap, value: (m) => count(m.enrollments), context: (m) => [`${count(m.activeEnrollments)} in progress`, `${count(m.completedEnrollments)} completed`, `${count(m.completionRate)}% completion rate`], load: () => platformAdminApi.users('user'), manage: '/dashboard/admin/students', manageLabel: 'View learners', columns: [{ key: 'name', header: 'Learner' }, { key: 'email', header: 'Email' }, { key: 'status', header: 'Access' }, { key: 'createdAt', header: 'Joined', render: (r) => date(r.createdAt) }] },
  completions: { title: 'Completion analytics', eyebrow: 'Learning outcomes', description: 'Completed enrollments and their certificate eligibility or issuance state.', icon: LuBadgeCheck, value: (m) => count(m.completedEnrollments), context: (m) => [`${count(m.completionRate)}% completion rate`, `${count(m.certificatesIssued)} certificates issued`, `${count(m.enrollments)} total enrollments`], load: () => platformAdminApi.operations('certificates'), manage: '/dashboard/admin/certificates', manageLabel: 'Manage certificates', columns: [{ key: 'learner', header: 'Learner', render: (r) => r.user?.name || '—' }, { key: 'course', header: 'Course', render: (r) => r.course?.title || '—' }, { key: 'status', header: 'Credential status' }, { key: 'createdAt', header: 'Updated', render: (r) => date(r.createdAt) }] },
  'completion-rate': { title: 'Completion-rate analytics', eyebrow: 'Outcome efficiency', description: 'The share of all persisted enrollments that reached completed status or 100% progress.', icon: LuChartNoAxesCombined, value: (m) => `${count(m.completionRate)}%`, context: (m) => [`${count(m.completedEnrollments)} completed`, `${count(m.activeEnrollments)} still active`, `${count(m.enrollments)} enrollment base`], load: () => platformAdminApi.courses(), manage: '/dashboard/admin/reports', manageLabel: 'Open reports', columns: [{ key: 'title', header: 'Course' }, { key: 'category', header: 'Category' }, { key: 'status', header: 'Status' }, { key: 'enrollments', header: 'Enrollments', render: (r) => count(r._count?.enrollments) }] },
  certificates: { title: 'Certificate analytics', eyebrow: 'Verified achievement', description: 'Issued, eligible, and revoked credentials from persisted completion records.', icon: LuBadgeCheck, value: (m) => count(m.certificatesIssued), context: (m) => [`${count(m.completedEnrollments)} completed enrollments`, 'Active credentials only', 'Revoked records excluded'], load: () => platformAdminApi.operations('certificates'), manage: '/dashboard/admin/certificates', manageLabel: 'Manage certificates', columns: [{ key: 'learner', header: 'Learner', render: (r) => r.user?.name || '—' }, { key: 'course', header: 'Course', render: (r) => r.course?.title || '—' }, { key: 'status', header: 'Status' }, { key: 'createdAt', header: 'Issued / eligible', render: (r) => date(r.createdAt) }] },
  assessments: { title: 'Assessment analytics', eyebrow: 'Knowledge checks', description: 'Submitted assessment attempts and the assessments available across courses.', icon: LuChartNoAxesCombined, value: (m) => count(m.assessmentAttempts), context: (m) => ['Submitted attempts only', `${count(m.activeLearners)} approved learners`, `${count(m.publishedCourses)} published courses`], load: () => platformAdminApi.operations('assessments'), manage: '/dashboard/admin/assessments', manageLabel: 'Manage assessments', columns: [{ key: 'title', header: 'Assessment' }, { key: 'course', header: 'Course', render: (r) => r.course?.title || '—' }, { key: 'questions', header: 'Questions', render: (r) => count(r._count?.questions) }, { key: 'attempts', header: 'Attempts', render: (r) => count(r._count?.attempts) }] },
  assignments: { title: 'Assignment analytics', eyebrow: 'Applied learning', description: 'Persisted assignment submissions and grading workload by assignment.', icon: LuClipboardCheck, value: (m) => count(m.assignmentSubmissions), context: (m) => ['Submitted learner work', `${count(m.activeLearners)} approved learners`, `${count(m.publishedCourses)} published courses`], load: () => platformAdminApi.operations('assignments'), manage: '/dashboard/admin/assignments', manageLabel: 'Manage assignments', columns: [{ key: 'title', header: 'Assignment' }, { key: 'course', header: 'Course', render: (r) => r.course?.title || '—' }, { key: 'submissions', header: 'Submissions', render: (r) => count(r._count?.submissions) }, { key: 'createdAt', header: 'Created', render: (r) => date(r.createdAt) }] },
  tickets: { title: 'Support analytics', eyebrow: 'Service operations', description: 'Open, assigned, and waiting support requests requiring administrative attention.', icon: LuLifeBuoy, value: (m) => count(m.openTickets), context: () => ['Open operational queue', 'Assigned and waiting included', 'Resolved tickets excluded'], load: () => platformAdminApi.operations('tickets'), manage: '/dashboard/admin/support-tickets', manageLabel: 'Manage tickets', columns: [{ key: 'subject', header: 'Subject' }, { key: 'requester', header: 'Requester', render: (r) => r.requester?.name || '—' }, { key: 'status', header: 'Status' }, { key: 'createdAt', header: 'Opened', render: (r) => date(r.createdAt) }] },
  reviews: { title: 'Review analytics', eyebrow: 'Learner voice', description: 'Published course feedback and the current persisted average rating.', icon: LuMessageSquare, value: (m) => count(m.publishedReviews), context: (m) => [`${Number(m.averageReviewRating || 0).toFixed(2)} average rating`, 'Published reviews only', `${count(m.publishedCourses)} published courses`], load: () => platformAdminApi.operations('reviews'), manage: '/dashboard/admin/reviews', manageLabel: 'Moderate reviews', columns: [{ key: 'learner', header: 'Learner', render: (r) => r.user?.name || '—' }, { key: 'course', header: 'Course', render: (r) => r.course?.title || '—' }, { key: 'rating', header: 'Rating', render: (r) => `${r.rating}/5` }, { key: 'status', header: 'Status' }] },
};

export default function AnalyticsMetricDetail() {
  const { metricKey } = useParams();
  const navigate = useNavigate();
  const config = metricConfig[metricKey];
  const [metrics, setMetrics] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!config) return;
    setLoading(true); setError('');
    try {
      const [summary, related] = await Promise.all([platformAdminApi.analytics(), config.load()]);
      setMetrics(summary.data); setRows(related.data || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!config) return undefined;
    let active = true;
    Promise.all([platformAdminApi.analytics(), config.load()])
      .then(([summary, related]) => { if (active) { setMetrics(summary.data); setRows(related.data || []); } })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [metricKey, config]);

  const context = useMemo(() => metrics && config ? config.context(metrics) : [], [metrics, config]);
  if (!config) return <PageShell eyebrow="Analytics" title="Metric not found" description="This analytics destination does not exist."><EmptyState title="Unknown metric" action={<Button onClick={() => navigate('/dashboard/admin/analytics')}>Back to analytics</Button>} /></PageShell>;

  return <PageShell eyebrow={config.eyebrow} title={config.title} description={config.description} actions={<div className="flex flex-wrap gap-2"><Button variant="ghost" icon={LuArrowLeft} onClick={() => navigate('/dashboard/admin/analytics')}>All metrics</Button><Button icon={LuArrowRight} onClick={() => navigate(config.manage)}>{config.manageLabel}</Button></div>}>
    {loading ? <LoadingState label={`Loading ${config.title.toLowerCase()}`} /> : error ? <EmptyState title="Metric unavailable" description={error} action={<Button onClick={load}>Retry</Button>} /> : <>
      <StatGrid><StatWidget label={config.title.replace(' analytics', '')} value={config.value(metrics)} icon={config.icon} tone="purple" footer="Live database snapshot" source="Persisted platform records" />{context.map((item, index) => <StatWidget key={item} label={['Supporting value', 'Operational context', 'Calculation scope'][index]} value={item} icon={[LuChartNoAxesCombined, LuBookOpen, LuBadgeCheck][index]} tone={['blue', 'green', 'orange'][index]} source="Calculated live" />)}</StatGrid>
      <section className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="section-title">Related records</h2><p className="section-description">The records supporting this metric, using the same persisted source.</p></div><Button variant="ghost" icon={LuRefreshCw} onClick={load}>Refresh</Button></div><EnterpriseTable columns={config.columns} rows={rows.slice(0, 100)} emptyTitle="No supporting records found" /></section>
      <p className="metrics-timestamp">Database snapshot generated {new Date(metrics.generatedAt).toLocaleString()}</p>
    </>}
  </PageShell>;
}
