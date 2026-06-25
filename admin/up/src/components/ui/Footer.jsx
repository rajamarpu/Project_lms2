const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-4 lg:px-6">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 font-bold text-white">
              L
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">LearnSphere</h3>
              <p className="text-sm text-slate-500">
                AI-powered LMS with immersive virtual teaching experience.
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
            Explore industry-ready learning paths in Python, CSS, MERN Stack, and more
            with dynamic AI-generated teaching experiences inspired by well-known
            personalities.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Platform
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Courses</li>
            <li>Dashboards</li>
            <li>Admin Panel</li>
            <li>Learning Tracks</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
            Support
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Help Center</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Contact Support</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4 text-center text-sm text-slate-500">
        © 2026 LearnSphere. Built for next-generation learning experiences.
      </div>
    </footer>
  )
}

export default Footer