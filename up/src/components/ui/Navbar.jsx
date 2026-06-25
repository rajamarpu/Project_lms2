import { Link, NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { routes } from '../../constants/routes'

const Navbar = ({ onMenuToggle }) => {
  const { user } = useSelector((state) => state.auth)

  const navItems = [
    { label: 'Courses', path: routes.courseList },
    { label: 'Student', path: routes.studentDashboard },
    { label: 'Admin', path: routes.adminDashboard },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
            aria-label="Open menu"
          >
            ☰
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 text-lg font-bold text-white shadow-lg">
              L
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">LearnSphere</p>
              <p className="text-xs text-slate-500">AI Powered Learning Platform</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-2 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {user?.name || 'Guest User'}
            </p>
            <p className="text-xs capitalize text-slate-500">
              {user?.role || 'student'}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-md">
            {(user?.name || 'G').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar