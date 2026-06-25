import { useSelector } from 'react-redux'
import DashboardStats from '../../components/ui/DashboardStats'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { enrolledCourses, courses } = useSelector((state) => state.course)

  const learningProgress = [
    { title: 'Modern CSS Mastery', progress: 72, time: '2h 10m left', modules: '14/20 modules' },
    { title: 'Python Essentials', progress: 46, time: '4h 20m left', modules: '9/18 modules' },
    { title: 'MERN Bootcamp', progress: 28, time: '8h 40m left', modules: '5/22 modules' },
  ]

  const recentActivities = [
    'Completed Responsive Layouts module in CSS course',
    'Switched virtual teacher to Alia Bhatt for Python journey',
    'Started MERN project setup lesson',
    'Earned streak badge for 7 continuous learning days',
  ]

  const recommendedCourses = courses.slice(0, 3)

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-white/40 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-2xl lg:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Student workspace</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight lg:text-5xl">
          Welcome back, {user?.name || 'Learner'}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Track your progress, continue enrolled courses, and personalize your learning
          experience with AI-powered virtual teacher switching.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStats
          title="Enrolled Courses"
          value={enrolledCourses.length || 3}
          subtitle="Courses added to your learning path"
          icon="📚"
          trend="+2 this month"
          color="teal"
        />
        <DashboardStats
          title="Hours Learned"
          value="68h"
          subtitle="Total structured learning time"
          icon="⏱️"
          trend="+11% improvement"
          color="blue"
        />
        <DashboardStats
          title="Certificates"
          value="4"
          subtitle="Completed achievement milestones"
          icon="🏆"
          trend="2 pending"
          color="amber"
        />
        <DashboardStats
          title="Streak"
          value="12 days"
          subtitle="Your active consistency score"
          icon="🔥"
          trend="Keep it going"
          color="violet"
        />
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Progress tracker</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Continue learning</h2>
            </div>
            <Button variant="secondary">View All</Button>
          </div>

          <div className="mt-6 space-y-4">
            {learningProgress.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.modules}</p>
                  </div>
                  <Button size="sm">Resume</Button>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                  <span>{item.progress}% complete</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[28px] bg-white/80 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Recent activity</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Your timeline</h2>

            <div className="mt-6 space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity} className="flex gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-teal-500" />
                  <p className="text-sm leading-7 text-slate-600">{activity}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[28px] bg-slate-950 p-6 text-white shadow-2xl">
            <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">AI mentor mode</p>
            <h3 className="mt-2 text-2xl font-bold">Switch your virtual teacher</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Choose a new virtual personality anytime and keep the same course content
              with a fresh presentation style.
            </p>
            <Button className="mt-6 w-full">Explore Teachers</Button>
          </Card>
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-sm uppercase tracking-[0.18em] text-teal-600">Recommendations</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Suggested for you</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {recommendedCourses.map((course) => (
            <Card key={course.id} className="rounded-[28px] bg-white/80 backdrop-blur-xl" hoverable>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{course.category}</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{course.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{course.description}</p>
              <Button className="mt-5">View Course</Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default StudentDashboard