import DashboardStats from '../../components/ui/DashboardStats'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const AdminDashboard = () => {
  const platformUpdates = [
    'New AI teacher switching module deployed successfully',
    '42 new learner registrations recorded today',
    'Course review queue updated by content team',
    'Admin moderation alerts cleared for current session',
  ]

  const quickActions = [
    'Review user access requests',
    'Approve newly created courses',
    'Check system health and moderation logs',
    'Manage featured catalog sections',
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl lg:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Admin command center</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-5xl">
          Platform-wide monitoring and management
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          View operational insights, manage users, track course inventory, and maintain
          the learning platform from a premium dashboard interface.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStats title="Total Users" value="24.8K" subtitle="Registered across all roles" icon="👥" trend="+8.2%" color="teal" />
        <DashboardStats title="Active Courses" value="148" subtitle="Published in catalog" icon="📘" trend="+14 added" color="blue" />
        <DashboardStats title="Instructors" value="62" subtitle="Creators managing content" icon="🎤" trend="+5 onboarded" color="violet" />
        <DashboardStats title="Revenue" value="₹8.6L" subtitle="Monthly platform performance" icon="💰" trend="+12.5%" color="amber" />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Platform updates</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Latest admin insights</h2>
            </div>
            <Button>Generate Report</Button>
          </div>

          <div className="mt-6 grid gap-4">
            {platformUpdates.map((item) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Quick actions</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Admin checklist</h2>

          <div className="mt-6 space-y-4">
            {quickActions.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default AdminDashboard