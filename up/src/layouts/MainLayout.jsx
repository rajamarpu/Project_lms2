import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import Sidebar from '../components/ui/Sidebar'
import Footer from '../components/ui/Footer'
import ParticlesBackground from '../components/ui/ParticlesBackground'

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <ParticlesBackground />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

        <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
          <Navbar onMenuToggle={handleMenuToggle} />

          <main className="flex-1 px-4 py-6 lg:px-6 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  )
}

export default MainLayout