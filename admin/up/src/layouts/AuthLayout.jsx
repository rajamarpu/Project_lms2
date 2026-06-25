import { Outlet, Link } from 'react-router-dom'
import ParticlesBackground from '../components/ui/ParticlesBackground'

const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <ParticlesBackground />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between border-r border-white/10 bg-slate-950/70 p-10 backdrop-blur-xl lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 text-lg font-bold text-white shadow-lg">
              L
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LearnSphere</h1>
              <p className="text-sm text-slate-400">AI-powered LMS experience</p>
            </div>
          </Link>

          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">
              Next generation learning
            </p>

            <h2 className="mt-5 text-5xl font-bold leading-tight text-white">
              Learn Python, CSS and MERN with immersive AI teacher experiences.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Switch virtual personalities anytime, explore structured courses, and
              experience a premium modern LMS interface built for learners and admins.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="mt-2 text-sm text-slate-400">Active learners exploring tech skills</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
                <p className="text-3xl font-bold text-white">120+</p>
                <p className="mt-2 text-sm text-slate-400">Structured modules across top learning paths</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 LearnSphere. Crafted for immersive digital education.
          </p>
        </div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/85 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 text-lg font-bold text-white shadow-lg">
                L
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">LearnSphere</h2>
              <p className="mt-2 text-sm text-slate-500">Welcome to your smart learning platform</p>
            </div>

            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout