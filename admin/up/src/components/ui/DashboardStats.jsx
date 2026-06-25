import Card from '../common/Card'

const DashboardStats = ({ title, value, subtitle, icon, trend, color = 'teal' }) => {
  const colorClasses = {
    teal: 'from-teal-500/15 to-cyan-500/10 text-teal-700 border-teal-100',
    blue: 'from-blue-500/15 to-sky-500/10 text-blue-700 border-blue-100',
    violet: 'from-violet-500/15 to-fuchsia-500/10 text-violet-700 border-violet-100',
    amber: 'from-amber-500/15 to-orange-500/10 text-amber-700 border-amber-100',
  }

  return (
    <Card
      className={`border bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl`}
      hoverable
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <span className="text-2xl">{icon}</span>
        </div>
      </div>

      {trend && (
        <div className="mt-5 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {trend}
        </div>
      )}
    </Card>
  )
}

export default DashboardStats