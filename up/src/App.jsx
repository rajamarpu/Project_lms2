import { Routes, Route } from 'react-router-dom'
import { Toaster } from './components/common/Toaster.jsx'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import { routes } from './constants/routes'
import ParticlesBackground from './components/ui/ParticlesBackground'
import AppRouter from './routes/AppRouter'


function App() {
  return (
    <>
     <ParticlesBackground />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path={routes.login} element={<div>Login Page</div>} />
          <Route path={routes.register} element={<div>Register Page</div>} />
          <Route path={routes.forgotPassword} element={<div>Forgot Password</div>} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          <Route path={routes.courseList} element={<div>Course List</div>} />
          <Route path={routes.courseDetails} element={<div>Course Details</div>} />
          <Route path={routes.studentDashboard} element={<div>Student Dashboard</div>} />
          <Route path={routes.adminDashboard} element={<div>Admin Dashboard</div>} />
          <Route path={routes.manageUsers} element={<div>Manage Users</div>} />
          <Route path={routes.manageCourses} element={<div>Manage Courses</div>} />
          <Route path="/" element={<div>Home/Dashboard</div>} />
        </Route>
      </Routes>
      <AppRouter/>
      <Toaster />
    </>
  )
}

export default App