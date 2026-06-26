import { useEffect, useMemo, useState } from 'react';
import { LuBadgeCheck, LuClipboardCheck, LuClock3, LuFileQuestion, LuIndianRupee, LuLifeBuoy, LuMessageSquare, LuShieldAlert, LuShieldCheck, LuStar, LuUsers } from 'react-icons/lu';
import { Button, EmptyState, EnterpriseTable, FilterBar, LoadingState, PageShell, StatGrid, StatWidget } from '../../../components/ui/EnterpriseUI';
import { platformAdminApi } from '../../../api/platform';

const formatCount = (value) => Number(value || 0).toLocaleString('en-IN');
const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const configs = {
  assessments: { title: 'Assessments', description: 'Persisted assessments and learner attempt activity.', icon: LuFileQuestion },
  assignments: { title: 'Assignments', description: 'Persisted assignments, submissions, grading, and feedback.', icon: LuClipboardCheck },
  certificates: { title: 'Certificates', description: 'Eligible, issued, and revoked learner credentials.', icon: LuBadgeCheck },
  billing: { title: 'Billing records', description: 'Verified payment records only. No simulated transactions.', icon: LuIndianRupee },
  tickets: { title: 'Support tickets', description: 'Persisted learner support requests and status.', icon: LuLifeBuoy },
  reviews: { title: 'Reviews', description: 'Verified reviews submitted by enrolled learners.', icon: LuMessageSquare },
};

const cell = (row, key) => {
  if (key === 'course') return row.course?.title || '-';
  if (key === 'learner') return row.user?.name || row.requester?.name || '-';
  if (key === 'activity') return row._count ? Object.entries(row._count).map(([name, value]) => `${value} ${name}`).join(' | ') : '-';
  if (key === 'date') return new Date(row.issuedAt || row.submittedAt || row.createdAt).toLocaleDateString();
  if (key === 'amount') return `${row.currency || 'INR'} ${Number(row.amount || 0).toLocaleString('en-IN')}`;
  return row[key] ?? '-';
};

const metricsFor = (kind, rows) => {
  if (kind === 'certificates') {
    return [
      { label: 'Total certificates', value: rows.length, icon: LuBadgeCheck, tone: 'blue', footer: 'All records', source: 'Certificate registry' },
      { label: 'Verified', value: rows.filter((row) => row.status === 'issued').length, icon: LuShieldCheck, tone: 'green', footer: 'Active credentials', source: 'Issued certificates' },
      { label: 'Pending verification', value: rows.filter((row) => row.status === 'eligible').length, icon: LuFileQuestion, tone: 'orange', footer: 'Ready to issue', source: 'Completion queue' },
      { label: 'Revoked', value: rows.filter((row) => row.status === 'revoked').length, icon: LuShieldAlert, tone: 'red', footer: 'No longer valid', source: 'Revocation log' },
    ];
  }

  if (kind === 'assignments') {
    const submissions = rows.reduce((sum, row) => sum + Number(row._count?.submissions || 0), 0);
    return [
      { label: 'Total assignments', value: rows.length, icon: LuClipboardCheck, tone: 'blue', footer: 'All coursework', source: 'Assignment records' },
      { label: 'Submissions', value: submissions, icon: LuUsers, tone: 'green', footer: 'Learner work received', source: 'Submission records' },
      { label: 'Pending review', value: submissions, icon: LuFileQuestion, tone: 'orange', footer: 'Open grading queue', source: 'Review queue' },
      { label: 'Courses covered', value: new Set(rows.map((row) => row.course?.title).filter(Boolean)).size, icon: LuBadgeCheck, tone: 'purple', footer: 'With assignments', source: 'Course mapping' },
    ];
  }

  if (kind === 'assessments') {
    const attempts = rows.reduce((sum, row) => sum + Number(row._count?.attempts || 0), 0);
    const questions = rows.reduce((sum, row) => sum + Number(row._count?.questions || 0), 0);
    return [
      { label: 'Total assessments', value: rows.length, icon: LuFileQuestion, tone: 'blue', footer: 'All assessments', source: 'Assessment records' },
      { label: 'Learner attempts', value: attempts, icon: LuUsers, tone: 'green', footer: 'Submitted attempts', source: 'Attempt records' },
      { label: 'Question bank', value: questions, icon: LuClipboardCheck, tone: 'orange', footer: 'Assessment questions', source: 'Question records' },
      { label: 'Courses covered', value: new Set(rows.map((row) => row.course?.title).filter(Boolean)).size, icon: LuBadgeCheck, tone: 'purple', footer: 'With assessments', source: 'Course mapping' },
    ];
  }

  if (kind === 'billing') {
    const paid = rows.filter((row) => row.status === 'paid');
    const revenue = paid.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    return [
      { label: 'Total records', value: rows.length, icon: LuIndianRupee, tone: 'blue', footer: 'All transactions', source: 'Billing records' },
      { label: 'Paid revenue', value: formatCurrency(revenue), icon: LuBadgeCheck, tone: 'green', footer: `${formatCount(paid.length)} paid payments`, source: 'Verified payments' },
      { label: 'Pending payments', value: rows.filter((row) => row.status === 'pending').length, icon: LuFileQuestion, tone: 'orange', footer: 'Awaiting confirmation', source: 'Payment status' },
      { label: 'Failed payments', value: rows.filter((row) => row.status === 'failed').length, icon: LuShieldAlert, tone: 'red', footer: 'Needs review', source: 'Payment status' },
    ];
  }

  if (kind === 'tickets') {
    return [
      { label: 'Total tickets', value: rows.length, icon: LuLifeBuoy, tone: 'blue', footer: 'All requests', source: 'Support queue' },
      { label: 'Open tickets', value: rows.filter((row) => ['open', 'assigned', 'waiting'].includes(row.status)).length, icon: LuFileQuestion, tone: 'orange', footer: 'Needs response', source: 'Ticket status' },
      { label: 'Resolved', value: rows.filter((row) => row.status === 'resolved').length, icon: LuBadgeCheck, tone: 'green', footer: 'Closed successfully', source: 'Ticket status' },
      { label: 'Urgent', value: rows.filter((row) => row.priority === 'urgent' || row.priority === 'high').length, icon: LuShieldAlert, tone: 'red', footer: 'High priority', source: 'Priority queue' },
    ];
  }

  if (kind === 'reviews') {
    const published = rows.filter((row) => row.status === 'published');
    const average = published.length ? (published.reduce((sum, row) => sum + Number(row.rating || 0), 0) / published.length).toFixed(1) : '0.0';
    return [
      { label: 'Total reviews', value: rows.length, icon: LuMessageSquare, tone: 'blue', footer: 'All feedback', source: 'Review records' },
      { label: 'Published', value: published.length, icon: LuBadgeCheck, tone: 'green', footer: 'Visible reviews', source: 'Moderation status' },
      { label: 'Hidden', value: rows.filter((row) => row.status === 'hidden').length, icon: LuShieldAlert, tone: 'red', footer: 'Moderated reviews', source: 'Moderation status' },
      { label: 'Average rating', value: average, icon: LuStar, tone: 'orange', footer: 'Published reviews', source: 'Rating summary' },
    ];
  }

  return [];
};

export function PersistedOperations({ kind }) {
  const config = configs[kind];
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submissions, setSubmissions] = useState(null);

  const load = () => {
    setLoading(true);
    setError('');
    platformAdminApi.operations(kind).then((payload) => setRows(payload.data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    platformAdminApi.operations(kind).then((payload) => { if (active) setRows(payload.data); }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [kind]);

  const mutate = async (operation, success) => {
    setNotice('');
    try {
      await operation();
      setNotice(success);
      load();
    } catch (err) {
      setNotice(err.message);
    }
  };

  const openSubmissions = async (row) => {
    try {
      const payload = await platformAdminApi.submissions(row.id);
      setSubmissions({ assignment: row, rows: payload.data });
    } catch (err) {
      setNotice(err.message);
    }
  };

  const grade = async (submission) => {
    const score = window.prompt(`Score from 0 to ${submissions.assignment.maxPoints}`, submission.score ?? '');
    if (score === null) return;
    const feedback = window.prompt('Feedback for the learner', submission.feedback || '');
    if (feedback === null) return;
    await mutate(() => platformAdminApi.gradeSubmission(submission.id, { score: Number(score), feedback }), 'Submission graded and learner notified.');
    await openSubmissions(submissions.assignment);
  };

  const action = (row) => {
    if (kind === 'assessments') return <Button variant="ghost" onClick={() => { if (window.confirm(`Delete ${row.title}?`)) mutate(() => platformAdminApi.deleteAssessment(row.id), 'Assessment deleted.'); }}>Delete</Button>;
    if (kind === 'assignments') return <div className="flex gap-2"><Button variant="ghost" onClick={() => openSubmissions(row)}>Submissions</Button><Button variant="ghost" onClick={() => { if (window.confirm(`Delete ${row.title}?`)) mutate(() => platformAdminApi.deleteAssignment(row.id), 'Assignment deleted.'); }}>Delete</Button></div>;
    if (kind === 'certificates') return row.status === 'eligible' ? <Button variant="ghost" onClick={() => mutate(() => platformAdminApi.issueCertificate(row.enrollmentId), 'Certificate issued.')}>Issue</Button> : row.status === 'issued' ? <Button variant="ghost" onClick={() => mutate(() => platformAdminApi.revokeCertificate(row.id), 'Certificate revoked.')}>Revoke</Button> : row.enrollmentId ? <Button variant="ghost" onClick={() => mutate(() => platformAdminApi.issueCertificate(row.enrollmentId), 'Certificate reissued.')}>Reissue</Button> : null;
    if (kind === 'tickets') return <Button variant="ghost" onClick={() => mutate(() => platformAdminApi.updateTicket(row.id, { status: row.status === 'resolved' ? 'open' : 'resolved' }), row.status === 'resolved' ? 'Ticket reopened.' : 'Ticket resolved.')}>{row.status === 'resolved' ? 'Reopen' : 'Resolve'}</Button>;
    if (kind === 'reviews') return <Button variant="ghost" onClick={() => mutate(() => platformAdminApi.moderateReview(row.id, row.status === 'published' ? 'hidden' : 'published'), row.status === 'published' ? 'Review hidden.' : 'Review published.')}>{row.status === 'published' ? 'Hide' : 'Publish'}</Button>;
    return null;
  };

  const filtered = useMemo(() => rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const byKind = {
    assessments: [['title', 'Assessment'], ['course', 'Course'], ['passingScore', 'Pass score'], ['activity', 'Activity'], ['date', 'Created']],
    assignments: [['title', 'Assignment'], ['course', 'Course'], ['maxPoints', 'Points'], ['activity', 'Activity'], ['date', 'Created']],
    certificates: [['learner', 'Learner'], ['course', 'Course'], ['status', 'Status'], ['verificationId', 'Verification ID'], ['date', 'Issued']],
    billing: [['providerRef', 'Provider reference'], ['amount', 'Amount'], ['status', 'Status'], ['date', 'Created']],
    tickets: [['subject', 'Subject'], ['learner', 'Requester'], ['priority', 'Priority'], ['status', 'Status'], ['activity', 'Messages']],
    reviews: [['learner', 'Learner'], ['course', 'Course'], ['rating', 'Rating'], ['comment', 'Comment'], ['status', 'Status']],
  };
  const columns = [...(byKind[kind] || []).map(([key, header]) => ({ key, header, render: (row) => cell(row, key) })), ...(kind === 'billing' ? [] : [{ key: 'actions', header: 'Actions', render: action }])];

  if (!config) return <EmptyState title="Unknown operation" />;

  return (
    <PageShell eyebrow="Persisted operations" title={config.title} description={config.description}>
      {notice && <p role="status" className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 text-sm admin-text-primary">{notice}</p>}
      <StatGrid>
        {metricsFor(kind, rows).map((metric) => (
          <StatWidget key={metric.label} {...metric} value={typeof metric.value === 'number' ? formatCount(metric.value) : metric.value} />
        ))}
      </StatGrid>
      {submissions && (
        <section className="enterprise-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">{submissions.assignment.title} submissions</h2>
              <p className="section-description">Scores and feedback are persisted and immediately visible to learners.</p>
            </div>
            <Button variant="ghost" onClick={() => setSubmissions(null)}>Close</Button>
          </div>
          {submissions.rows.length ? submissions.rows.map((item) => (
            <article key={item.id} className="rounded-xl border border-[var(--admin-border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold admin-text-primary">{item.user.name}</h3>
                  <p className="text-xs admin-text-muted">{item.user.email} | {item.status}</p>
                  <p className="mt-2 text-sm admin-text-primary">{item.text || item.fileUrl || 'No response text'}</p>
                  {item.feedback && <p className="mt-2 text-sm admin-text-muted">Feedback: {item.feedback}</p>}
                </div>
                <Button variant="ghost" onClick={() => grade(item)}>{item.status === 'graded' ? 'Regrade' : 'Grade'}</Button>
              </div>
            </article>
          )) : <EmptyState title="No submissions" />}
        </section>
      )}
      <FilterBar value={query} onChange={setQuery} placeholder={`Search ${config.title.toLowerCase()}`} />
      {loading ? <LoadingState label={`Loading ${config.title.toLowerCase()}`} /> : error ? <EmptyState title="Could not load data" description={error} action={<Button onClick={load}>Retry</Button>} /> : <EnterpriseTable columns={columns} rows={filtered} emptyTitle={`No ${config.title.toLowerCase()} found`} />}
    </PageShell>
  );
}

export function AuditLogPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snapshotTime] = useState(() => Date.now());

  useEffect(() => {
    platformAdminApi.auditLogs().then((payload) => setRows(payload.data)).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const highRisk = rows.filter((row) => /fail|delete|revoke|suspend/i.test(row.action || '')).length;
  const uniqueActors = new Set(rows.map((row) => row.actor?.email || row.actor?.name || 'System')).size;
  const recentEvents = rows.filter((row) => snapshotTime - new Date(row.createdAt).getTime() < 24 * 60 * 60 * 1000).length;
  const columns = [
    { key: 'action', header: 'Action' },
    { key: 'actor', header: 'Actor', render: (row) => row.actor?.name || 'System' },
    { key: 'targetType', header: 'Target' },
    { key: 'targetId', header: 'Target ID' },
    { key: 'createdAt', header: 'Time', render: (row) => new Date(row.createdAt).toLocaleString() },
  ];

  return (
    <PageShell eyebrow="Governance" title="Audit logs" description="Persisted administrative changes.">
      <StatGrid>
        <StatWidget label="Total events" value={formatCount(rows.length)} icon={LuShieldCheck} tone="blue" footer="All logged actions" source="Audit log" />
        <StatWidget label="Unique actors" value={formatCount(uniqueActors)} icon={LuUsers} tone="green" footer="Admins and system events" source="Actor records" />
        <StatWidget label="High risk events" value={formatCount(highRisk)} icon={LuShieldAlert} tone="red" footer="Delete, fail, revoke, suspend" source="Risk filter" />
        <StatWidget label="Last 24 hours" value={formatCount(recentEvents)} icon={LuClock3} tone="orange" footer="Recent activity" source="Audit timeline" />
      </StatGrid>
      {loading ? <LoadingState /> : error ? <EmptyState title="Audit log unavailable" description={error} /> : <EnterpriseTable columns={columns} rows={rows} emptyTitle="No audit events recorded" />}
    </PageShell>
  );
}

export const AssignmentsPage = () => <PersistedOperations kind="assignments" />;
export const AssessmentsPage = () => <PersistedOperations kind="assessments" />;
export const CertificatesPage = () => <PersistedOperations kind="certificates" />;
export const BillingPage = () => <PersistedOperations kind="billing" />;
export const SupportTicketsPage = () => <PersistedOperations kind="tickets" />;
export const ReviewsPage = () => <PersistedOperations kind="reviews" />;
