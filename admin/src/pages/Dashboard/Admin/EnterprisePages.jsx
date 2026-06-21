import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  LuActivity,
  LuBadgeCheck,
  LuBookOpen,
  LuBuilding2,
  LuClipboardCheck,
  LuClock3,
  LuFileChartLine,
  LuGraduationCap,
  LuIndianRupee,
  LuLayers3,
  LuLifeBuoy,
  LuBookMarked,
  LuCircleHelp,
  LuMessageCircle,
  LuListChecks,
  LuMegaphone,
  LuPencilRuler,
  LuShieldCheck,
  LuSparkles,
  LuUserCog,
  LuUsers,
} from 'react-icons/lu';
import {
  Button,
  ChartPanel,
  EmptyState,
  EnterpriseTable,
  FilterBar,
  PageShell,
  ProgressBar,
  SelectControl,
  StatGrid,
  StatWidget,
} from '../../../components/ui/EnterpriseUI';
import { loadCourses, formatRevenue as formatCourseRevenue } from '../../../utils/courseUtils';
import { loadTeachers, formatRevenue as formatTeacherRevenue } from '../../../utils/teacherUtils';

const studentsSeed = [
  { id: 1, name: 'Deepika Mishra', email: 'dipmish9898@gmail.com', course: 'DSA with Java', progress: 72, status: 'Active', certificates: 3, activity: 'Completed recursion module' },
  { id: 2, name: 'Rahul Mishra', email: 'rahul@gmail.com', course: 'MERN', progress: 48, status: 'Active', certificates: 2, activity: 'Submitted capstone draft' },
  { id: 3, name: 'John Doe', email: 'john.doe@gmail.com', course: 'DSA with Java', progress: 100, status: 'Completed', certificates: 1, activity: 'Certificate issued' },
  { id: 4, name: 'Anjali Verma', email: 'anjali.verma@gmail.com', course: 'Python Basics', progress: 12, status: 'Pending', certificates: 0, activity: 'Invited to onboarding' },
];

const trendData = [
  { name: 'Jan', learners: 820, revenue: 120 },
  { name: 'Feb', learners: 960, revenue: 148 },
  { name: 'Mar', learners: 1210, revenue: 182 },
  { name: 'Apr', learners: 1490, revenue: 215 },
  { name: 'May', learners: 1720, revenue: 248 },
  { name: 'Jun', learners: 2140, revenue: 292 },
];

function readStudents() {
  try {
    const saved = localStorage.getItem('lms_students_data');
    return saved ? JSON.parse(saved) : studentsSeed;
  } catch {
    return studentsSeed;
  }
}

function useAdminData() {
  return useMemo(() => {
    const courses = loadCourses();
    const teachers = loadTeachers();
    const students = readStudents();
    const revenue = courses.reduce((sum, course) => sum + (course.revenue || 0), 0);
    return { courses, teachers, students, revenue };
  }, []);
}

function Badge({ children, tone = 'blue' }) {
  return <span className={`admin-badge tone-${tone}`}>{children}</span>;
}

function MiniTrend({ type = 'area' }) {
  const chartColor = 'var(--accent)';
  const Chart = type === 'bar' ? BarChart : type === 'line' ? LineChart : AreaChart;
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <Chart data={trendData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
          {type === 'bar' ? (
            <Bar dataKey="revenue" fill={chartColor} radius={[6, 6, 0, 0]} />
          ) : type === 'line' ? (
            <Line type="monotone" dataKey="learners" stroke={chartColor} strokeWidth={3} dot={false} />
          ) : (
            <Area type="monotone" dataKey="learners" stroke={chartColor} fill="rgba(59,130,246,0.18)" strokeWidth={3} />
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

export function StudentDetails() {
  const { studentId } = useParams();
  const { students } = useAdminData();
  const student = students.find((item) => String(item.id) === String(studentId)) || students[0] || studentsSeed[0];
  return (
    <PageShell eyebrow="Student management" title="Student Details" description="Learning history, completion tracking, certificates, and activity logs in one workspace.">
      <StatGrid>
        <StatWidget label="Progress" value={`${student.progress}%`} delta="+12% this month" icon={LuGraduationCap} />
        <StatWidget label="Certificates" value={student.certificates} delta="Verified" icon={LuBadgeCheck} tone="green" />
        <StatWidget label="Current Course" value={student.course || student.enrolledCourse} footer={student.status} icon={LuBookOpen} tone="purple" />
        <StatWidget label="Last Activity" value="2h" footer={student.activity} icon={LuClock3} tone="orange" />
      </StatGrid>
      <ChartPanel title="Progress Timeline" description="A compact view of the learner journey."><MiniTrend type="line" /></ChartPanel>
      <EnterpriseTable
        columns={[
          { key: 'course', header: 'Course', sortable: true, render: (row) => row.course || row.enrolledCourse },
          { key: 'progress', header: 'Progress', render: (row) => <ProgressBar value={row.progress} /> },
          { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'Completed' ? 'green' : 'blue'}>{row.status}</Badge> },
          { key: 'activity', header: 'Latest Activity' },
        ]}
        rows={students}
      />
    </PageShell>
  );
}

export function TeacherDetails() {
  const { teacherId } = useParams();
  const { teachers } = useAdminData();
  const teacher = teachers.find((item) => String(item.id) === String(teacherId)) || teachers[0];
  return (
    <PageShell eyebrow="Instructor operations" title="Teacher Details" description="Performance, revenue, course assignments, and instructor activity tracking.">
      <StatGrid>
        <StatWidget label="Instructor" value={teacher.name} footer={teacher.style} icon={LuUserCog} />
        <StatWidget label="Revenue" value={formatTeacherRevenue(teacher.revenue)} delta="+18%" icon={LuIndianRupee} tone="green" />
        <StatWidget label="Courses" value={teacher.courses} footer={teacher.course} icon={LuLayers3} tone="purple" />
        <StatWidget label="Learners" value={teacher.students?.toLocaleString()} delta="High demand" icon={LuUsers} tone="orange" />
      </StatGrid>
      <ChartPanel title="Instructor Revenue" description="Monthly instructor earning trend."><MiniTrend type="bar" /></ChartPanel>
      <EnterpriseTable
        columns={[
          { key: 'name', header: 'Teacher', sortable: true },
          { key: 'course', header: 'Primary Course' },
          { key: 'students', header: 'Students', sortable: true },
          { key: 'enabled', header: 'Status', render: (row) => <Badge tone={row.enabled ? 'green' : 'gray'}>{row.enabled ? 'Active' : 'Paused'}</Badge> },
        ]}
        rows={teachers}
      />
    </PageShell>
  );
}

export function CourseDetails() {
  const { courseId } = useParams();
  const { courses } = useAdminData();
  const course = courses.find((item) => String(item.id) === String(courseId)) || courses[0];
  return (
    <PageShell eyebrow="Course management" title="Course Details" description="Publishing readiness, SEO settings, visibility, analytics, and performance health.">
      <StatGrid>
        <StatWidget label="Course" value={course.title} footer={course.category} icon={LuBookOpen} />
        <StatWidget label="Revenue" value={formatCourseRevenue(course.revenue)} delta="+9.4%" icon={LuIndianRupee} tone="green" />
        <StatWidget label="Completion" value={`${course.completion}%`} footer="Learner average" icon={LuClipboardCheck} tone="purple" />
        <StatWidget label="Visibility" value={course.active ? 'Published' : 'Draft'} footer="SEO ready" icon={LuMegaphone} tone="orange" />
      </StatGrid>
      <ChartPanel title="Course Performance" description="Engagement and revenue trend for active courses."><MiniTrend /></ChartPanel>
      <EnterpriseTable
        columns={[
          { key: 'title', header: 'Course', sortable: true },
          { key: 'level', header: 'Level' },
          { key: 'students', header: 'Students', sortable: true },
          { key: 'completion', header: 'Completion', render: (row) => <ProgressBar value={row.completion} tone="green" /> },
        ]}
        rows={courses}
      />
    </PageShell>
  );
}

export function CourseEdit() {
  const { courseId } = useParams();
  const { courses } = useAdminData();
  const course = courses.find((item) => String(item.id) === String(courseId)) || courses[0];

  return (
    <PageShell
      eyebrow="Course editing"
      title="Course Edit"
      description="Frontend-safe editing workspace for content, pricing, visibility, publish readiness, and instructor ownership."
      actions={<Button icon={LuClipboardCheck}>Save Draft</Button>}
    >
      <StatGrid>
        <StatWidget label="Course" value={course.title} footer={course.category} icon={LuBookOpen} />
        <StatWidget label="Publish State" value={course.active ? 'Published' : 'Draft'} footer="No backend changes" icon={LuMegaphone} tone="green" />
        <StatWidget label="Completion" value={`${course.completion}%`} footer="Learner average" icon={LuClipboardCheck} tone="purple" />
        <StatWidget label="Revenue" value={formatCourseRevenue(course.revenue)} delta="+9.4%" icon={LuIndianRupee} tone="orange" />
      </StatGrid>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="enterprise-card space-y-4">
          <div>
            <h2 className="section-title">Course Information</h2>
            <p className="section-description">Changes here mirror the Add Course drawer fields and preserve the existing localStorage course shape.</p>
          </div>
          <label className="block">
            <span className="admin-label mb-2 block">Course title</span>
            <input className="admin-input" defaultValue={course.title} />
          </label>
          <label className="block">
            <span className="admin-label mb-2 block">Description</span>
            <textarea className="admin-input min-h-32 py-3" defaultValue={course.shortDesc || 'Premium LMS course description'} />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="admin-label mb-2 block">Level</span>
              <input className="admin-input" defaultValue={course.level} />
            </label>
            <label className="block">
              <span className="admin-label mb-2 block">Teacher</span>
              <input className="admin-input" defaultValue={course.teacher} />
            </label>
          </div>
        </div>

        <div className="enterprise-card space-y-4">
          <h2 className="section-title">Publish Checklist</h2>
          {['Thumbnail ready', 'Instructor assigned', 'Pricing configured', 'Certificate enabled', 'Visibility selected'].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <span className="text-sm text-[var(--text-primary)]">{item}</span>
              <Badge tone="green">Ready</Badge>
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="ghost">Preview</Button>
            <Button>Publish Course</Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function CourseBuilder() {
  const [step, setStep] = useState(1);
  const steps = ['Basics', 'Curriculum', 'Media', 'SEO', 'Publish'];
  return (
    <PageShell eyebrow="Course builder" title="Multi-step Course Wizard" description="A frontend-safe builder with draft autosave, validation checkpoints, thumbnail preview, SEO, and visibility controls.">
      <section className="enterprise-card">
        <div className="grid gap-3 md:grid-cols-5">
          {steps.map((label, index) => (
            <button key={label} type="button" onClick={() => setStep(index + 1)} className={`wizard-step ${step === index + 1 ? 'active' : ''}`}>
              <span>{index + 1}</span>
              {label}
            </button>
          ))}
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="enterprise-card space-y-4">
          <h2 className="section-title">{steps[step - 1]} Setup</h2>
          <input className="admin-input" placeholder="Course title" />
          <textarea className="admin-input min-h-32" placeholder="Course description and learning outcomes" />
          <div className="grid gap-3 md:grid-cols-2">
            <input className="admin-input" placeholder="SEO title" />
            <input className="admin-input" placeholder="Slug" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setStep(Math.max(1, step - 1))} variant="ghost">Previous</Button>
            <Button onClick={() => setStep(Math.min(5, step + 1))}>Save Draft</Button>
          </div>
        </div>
        <EmptyState title="Thumbnail Preview" description="Upload preview, validation, visibility, and publish checks appear here before launch." />
      </section>
    </PageShell>
  );
}

function OperationsPage({ config }) {
  const { courses, students, teachers, revenue } = useAdminData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = (config.rows || []).filter((row) =>
    Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()) &&
    (!status || row.status === status)
  );
  const action = config.action ? <Button icon={config.icon}>{config.action}</Button> : null;

  return (
    <PageShell eyebrow={config.eyebrow} title={config.title} description={config.description} actions={action}>
      <StatGrid>
        <StatWidget label={config.stats[0]} value={config.primaryValue({ courses, students, teachers, revenue })} delta={config.delta || '+14%'} icon={config.icon} />
        <StatWidget label="Open Items" value={rows.length} footer="Visible records" icon={LuListChecks} tone="green" />
        <StatWidget label="Automation" value="86%" footer="Policy coverage" icon={LuShieldCheck} tone="purple" />
        <StatWidget label="SLA" value="99.2%" footer="On-time completion" icon={LuClock3} tone="orange" />
      </StatGrid>
      <FilterBar value={query} onChange={setQuery} placeholder={`Search ${config.title.toLowerCase()}`}>
        <SelectControl label="Status" value={status} onChange={setStatus} options={Array.from(new Set((config.rows || []).map((row) => row.status).filter(Boolean)))} />
      </FilterBar>
      <EnterpriseTable columns={config.columns} rows={rows} emptyTitle={`No ${config.title.toLowerCase()} found`} />
      <ChartPanel title={`${config.title} Trend`} description="Progressive loading and animated chart treatment for operational reporting.">
        <MiniTrend type={config.chart || 'area'} />
      </ChartPanel>
    </PageShell>
  );
}

const pageConfigs = {
  Certificates: {
    eyebrow: 'Credential operations',
    title: 'Certificates',
    description: 'Issue, review, revoke, and track learner certificate history.',
    action: 'Issue Certificate',
    icon: LuBadgeCheck,
    stats: ['Certificates Issued'],
    primaryValue: ({ students }) => students.reduce((sum, s) => sum + (s.certificates || 0), 0),
    columns: [
      { key: 'learner', header: 'Learner', sortable: true },
      { key: 'course', header: 'Course' },
      { key: 'status', header: 'Status', render: (row) => <Badge tone="green">{row.status}</Badge> },
      { key: 'date', header: 'Issued' },
    ],
    rows: [
      { id: 1, learner: 'Deepika Mishra', course: 'DSA with Java', status: 'Verified', date: 'Jun 14, 2026' },
      { id: 2, learner: 'Rahul Mishra', course: 'MERN', status: 'Pending', date: 'Jun 12, 2026' },
    ],
  },
  Assignments: {
    eyebrow: 'Assessment operations',
    title: 'Assignments',
    description: 'Manage submissions, grading queues, rubrics, and overdue work.',
    action: 'Create Assignment',
    icon: LuClipboardCheck,
    stats: ['Submissions'],
    primaryValue: () => 428,
    chart: 'bar',
    columns: [
      { key: 'title', header: 'Assignment', sortable: true },
      { key: 'course', header: 'Course' },
      { key: 'due', header: 'Due Date' },
      { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'Open' ? 'blue' : 'green'}>{row.status}</Badge> },
    ],
    rows: [
      { id: 1, title: 'React Dashboard Audit', course: 'Advanced React Patterns', due: 'Jun 22, 2026', status: 'Open' },
      { id: 2, title: 'Python Model Notebook', course: 'Python for Machine Learning', due: 'Jun 26, 2026', status: 'Review' },
    ],
  },
  Assessments: {
    eyebrow: 'Learning validation',
    title: 'Assessments',
    description: 'Track quizzes, exams, skill checks, question banks, and pass rates.',
    action: 'Create Assessment',
    icon: LuPencilRuler,
    stats: ['Avg Pass Rate'],
    primaryValue: () => '81%',
    columns: [
      { key: 'name', header: 'Assessment', sortable: true },
      { key: 'questions', header: 'Questions' },
      { key: 'passRate', header: 'Pass Rate' },
      { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    ],
    rows: [
      { id: 1, name: 'JavaScript Foundations', questions: 32, passRate: '84%', status: 'Live' },
      { id: 2, name: 'DSA Final Check', questions: 48, passRate: '76%', status: 'Draft' },
    ],
  },
  Billing: {
    eyebrow: 'Finance',
    title: 'Billing',
    description: 'Revenue insights, invoices, plan movement, and payment health.',
    action: 'Export Ledger',
    icon: LuIndianRupee,
    stats: ['Recognized Revenue'],
    primaryValue: ({ revenue }) => formatCourseRevenue(revenue),
    chart: 'bar',
    columns: [
      { key: 'invoice', header: 'Invoice' },
      { key: 'customer', header: 'Customer' },
      { key: 'amount', header: 'Amount' },
      { key: 'status', header: 'Status', render: (row) => <Badge tone="green">{row.status}</Badge> },
    ],
    rows: [
      { id: 1, invoice: 'INV-1024', customer: 'Enterprise Cohort A', amount: '$4,200', status: 'Paid' },
      { id: 2, invoice: 'INV-1025', customer: 'Learner Bundle', amount: '$890', status: 'Paid' },
    ],
  },
  AuditLogs: {
    eyebrow: 'Governance',
    title: 'Audit Logs',
    description: 'Security-sensitive admin actions and compliance timeline.',
    icon: LuShieldCheck,
    stats: ['Tracked Events'],
    primaryValue: () => 1248,
    columns: [
      { key: 'event', header: 'Event' },
      { key: 'actor', header: 'Actor' },
      { key: 'scope', header: 'Scope' },
      { key: 'time', header: 'Time' },
    ],
    rows: [
      { id: 1, event: 'Course published', actor: 'Admin', scope: 'Courses', time: '8 min ago' },
      { id: 2, event: 'Role updated', actor: 'Admin', scope: 'Users', time: '31 min ago' },
    ],
  },
  ActivityLogs: {
    eyebrow: 'Operations',
    title: 'Activity Logs',
    description: 'Learner, teacher, and admin activity across the platform.',
    icon: LuActivity,
    stats: ['Daily Activities'],
    primaryValue: () => 8612,
    columns: [
      { key: 'activity', header: 'Activity' },
      { key: 'person', header: 'Person' },
      { key: 'type', header: 'Type' },
      { key: 'time', header: 'Time' },
    ],
    rows: [
      { id: 1, activity: 'Lesson completed', person: 'Deepika Mishra', type: 'Learner', time: '2 min ago' },
      { id: 2, activity: 'Assignment graded', person: 'Virat Kohli', type: 'Teacher', time: '18 min ago' },
    ],
  },
  SupportTickets: {
    eyebrow: 'Support',
    title: 'Support Tickets',
    description: 'Queue, prioritize, assign, and resolve student support cases.',
    action: 'Create Ticket',
    icon: LuLifeBuoy,
    stats: ['Open Tickets'],
    primaryValue: () => 18,
    columns: [
      { key: 'ticket', header: 'Ticket' },
      { key: 'requester', header: 'Requester' },
      { key: 'priority', header: 'Priority', render: (row) => <Badge tone={row.priority === 'High' ? 'orange' : 'blue'}>{row.priority}</Badge> },
      { key: 'status', header: 'Status' },
    ],
    rows: [
      { id: 1, ticket: 'Payment receipt issue', requester: 'Rahul Mishra', priority: 'High', status: 'Open' },
      { id: 2, ticket: 'Certificate name change', requester: 'Anjali Verma', priority: 'Medium', status: 'Assigned' },
    ],
  },
  Reports: {
    eyebrow: 'Reporting',
    title: 'Reports',
    description: 'Export-ready summaries for revenue, completion, growth, and engagement.',
    action: 'Generate Report',
    icon: LuFileChartLine,
    stats: ['Reports Ready'],
    primaryValue: () => 12,
    chart: 'line',
    columns: [
      { key: 'report', header: 'Report' },
      { key: 'owner', header: 'Owner' },
      { key: 'cadence', header: 'Cadence' },
      { key: 'status', header: 'Status', render: (row) => <Badge tone="green">{row.status}</Badge> },
    ],
    rows: [
      { id: 1, report: 'Monthly Revenue Summary', owner: 'Finance', cadence: 'Monthly', status: 'Ready' },
      { id: 2, report: 'Learner Completion Cohort', owner: 'Academic', cadence: 'Weekly', status: 'Ready' },
    ],
  },
  Profile: {
    eyebrow: 'Account',
    title: 'Profile',
    description: 'Admin identity, notification preferences, security posture, and workspace settings.',
    action: 'Update Profile',
    icon: LuUserCog,
    stats: ['Security Score'],
    primaryValue: () => '96%',
    columns: [
      { key: 'setting', header: 'Setting' },
      { key: 'value', header: 'Value' },
      { key: 'status', header: 'Status', render: (row) => <Badge tone="green">{row.status}</Badge> },
    ],
    rows: [
      { id: 1, setting: 'Two-factor authentication', value: 'Enabled', status: 'Healthy' },
      { id: 2, setting: 'Workspace role', value: 'Super Admin', status: 'Healthy' },
    ],
  },
};

export const Certificates = () => <OperationsPage config={pageConfigs.Certificates} />;
export const Assignments = () => <OperationsPage config={pageConfigs.Assignments} />;
export const Assessments = () => <OperationsPage config={pageConfigs.Assessments} />;
export const Billing = () => <OperationsPage config={pageConfigs.Billing} />;
export const AuditLogs = () => <OperationsPage config={pageConfigs.AuditLogs} />;
export const ActivityLogs = () => <OperationsPage config={pageConfigs.ActivityLogs} />;
export function SupportTickets() {
  const config = pageConfigs.SupportTickets;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const rows = config.rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase()) && (!status || row.status === status));
  return (
    <PageShell eyebrow="Support" title="Support Center" description="Resolve tickets, guide learners, and keep common support resources in one orderly workspace." actions={<Button icon={LuLifeBuoy} onClick={() => document.getElementById('support-ticket-table')?.scrollIntoView({ behavior: 'smooth' })}>Review Tickets</Button>}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [LuCircleHelp, 'Help Center', 'Guidance for accounts, learning progress, and course access.'],
          [LuBookMarked, 'Documentation', 'Operational playbooks and learner-facing support articles.'],
          [LuMessageCircle, 'Live Chat', 'Agent availability and active learner conversations.'],
          [LuLifeBuoy, 'Common Issues', 'Payment, certificate, password, and enrollment resolutions.'],
        ].map(([Icon, title, description]) => <article key={title} className="enterprise-card"><div className="stat-icon mb-4"><Icon size={18} /></div><h2 className="section-title">{title}</h2><p className="section-description">{description}</p></article>)}
      </section>
      <StatGrid><StatWidget label="Open Tickets" value="18" footer="Across all queues" icon={LuLifeBuoy} /><StatWidget label="First Response" value="24m" delta="12% faster" icon={LuClock3} tone="green" /><StatWidget label="Resolved Today" value="31" footer="93% within SLA" icon={LuListChecks} tone="purple" /><StatWidget label="Live Chat" value="Online" footer="4 agents available" icon={LuMessageCircle} tone="orange" /></StatGrid>
      <div id="support-ticket-table" className="space-y-4"><FilterBar value={query} onChange={setQuery} placeholder="Search support tickets"><SelectControl label="Status" value={status} onChange={setStatus} options={['Open', 'Assigned']} /></FilterBar><EnterpriseTable columns={config.columns} rows={rows} emptyTitle="No support tickets found" /></div>
      <section className="grid gap-4 lg:grid-cols-2"><div className="enterprise-card"><h2 className="section-title">Frequently asked questions</h2><div className="mt-4 space-y-3">{['How do I restore learner course access?', 'Where can I correct a certificate name?', 'How are payment receipt issues escalated?'].map((item) => <details key={item} className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3"><summary className="cursor-pointer text-sm font-medium text-[var(--text-primary)]">{item}</summary><p className="mt-2 text-sm text-[var(--text-secondary)]">Follow the documented verification workflow, record the action, and notify the learner when complete.</p></details>)}</div></div><div className="enterprise-card"><h2 className="section-title">Contact and escalation</h2><p className="section-description">Route sensitive account, security, and payment issues to the responsible operational owner.</p><div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => window.location.href = 'mailto:support@uptoskills.com'}>Email Support</Button><Button variant="ghost" onClick={() => setStatus('Open')}>Show Open Issues</Button></div></div></section>
    </PageShell>
  );
}
export const Reports = () => <OperationsPage config={pageConfigs.Reports} />;
export const Profile = () => <OperationsPage config={pageConfigs.Profile} />;

export function AdminSystemOverview() {
  const { courses, students, teachers, revenue } = useAdminData();
  return (
    <PageShell eyebrow="Enterprise LMS" title="Administration System" description="A complete operational map for the expanded UptoSkills admin workspace.">
      <StatGrid>
        <StatWidget label="Courses" value={courses.length} icon={LuBookOpen} />
        <StatWidget label="Students" value={students.length} icon={LuGraduationCap} tone="green" />
        <StatWidget label="Teachers" value={teachers.length} icon={LuBuilding2} tone="purple" />
        <StatWidget label="Revenue" value={formatCourseRevenue(revenue)} icon={LuIndianRupee} tone="orange" />
      </StatGrid>
      <EmptyState
        title="Enterprise route coverage is enabled"
        description="Dashboard, management, learning operations, finance, reports, support, governance, and profile pages are available without changing backend APIs."
        action={<Button icon={LuSparkles}>Review Workspace</Button>}
      />
    </PageShell>
  );
}
