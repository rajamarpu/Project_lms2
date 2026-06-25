import { NavLink } from 'react-router-dom'
import { routes } from '../../constants/routes'

const Sidebar = ({ isOpen, onClose }) => {
  const sidebarLinks = [
    { name: 'Explore Courses', path: routes.courseList, icon: '📚' },
    { name: 'Student Dashboard', path: routes.studentDashboard, icon: '🎓' },
    { name: 'Instructor Dashboard', path: routes.instructorDashboard, icon: '🎥' },
    { name: 'Admin Dashboard', path: routes.adminDashboard, icon: '🛠️' },
    { name: 'Manage Users', path: routes.manageUsers, icon: '👥' },
    { name: 'Manage Courses', path: routes.manageCourses, icon: '🧠' },
  ]

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition lg:hidden ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-white/10 bg-slate-950 text-white shadow-2xl transition-transform duration-300 lg:sticky lg:z-30 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <h2 className="text-lg font-bold">LMS Panel</h2>
            <p className="text-xs text-slate-400">Modern learning workspace</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 lg:hidden"
          >
            ✕
          </button>
        </div>

        <div className="px-4 py-5">
          <div className="rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-blue-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-teal-300">Featured</p>
            <h3 className="mt-2 text-sm font-semibold leading-6 text-white">
              Learn Python, CSS & MERN with AI celebrity-style virtual teachers
            </h3>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs text-slate-400">Upgrade experience</p>
            <p className="mt-1 text-sm font-semibold text-white">
              Personalized AI learning journey
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar