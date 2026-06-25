import DashboardStats from '../../components/ui/DashboardStats'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const InstructorDashboard = () => {
  const publishedCourses = [
    { title: 'Advanced CSS Systems', students: 1820, status: 'Published' },
    { title: 'Python Workflow Essentials', students: 1240, status: 'Published' },
    { title: 'MERN API Foundations', students: 910, status: 'Draft Review' },
  ]

  const tasks = [
    'Review lesson sequencing for Python track',
    'Upload updated course thumbnails',
    'Prepare quiz questions for CSS modules',
    'Approve feedback notes from recent batch',
  ]

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl lg:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Instructor control room</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-5xl">
          Manage your course delivery experience
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Monitor content flow, learner reach, and publishing progress from one modern workspace.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStats title="Published Courses" value="12" subtitle="Currently live on platform" icon="🎥" trend="+3 this quarter" color="teal" />
        <DashboardStats title="Total Learners" value="8.4K" subtitle="Students following your content" icon="👨‍🎓" trend="+18%" color="blue" />
        <DashboardStats title="Avg Rating" value="4.8" subtitle="Across all active modules" icon="⭐" trend="Excellent" color="amber" />
        <DashboardStats title="Pending Reviews" value="7" subtitle="Modules waiting for approval" icon="📝" trend="Needs attention" color="violet" />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Course pipeline</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Published and draft content</h2>
            </div>
            <Button>Add Course</Button>
          </div>

          <div className="mt-6 space-y-4">
            {publishedCourses.map((course) => (
              <div
                key={course.title}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{course.students} enrolled learners</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white">
                    {course.status}
                  </span>
                  <Button variant="secondary" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Task list</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Today&apos;s actions</h2>

          <div className="mt-6 space-y-4">
            {tasks.map((task) => (
              <div key={task} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mt-1 h-4 w-4 rounded-md border-2 border-teal-500" />
                <p className="text-sm leading-7 text-slate-600">{task}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

export default InstructorDashboard