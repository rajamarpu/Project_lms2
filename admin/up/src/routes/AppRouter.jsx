import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import PrivateRoute from './PrivateRoute'
import { routes } from '../constants/routes'

import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import ForgotPassword from '../pages/Auth/ForgotPassword'

import CourseList from '../pages/Courses/CourseList'
import CourseDetails from '../pages/Courses/CourseDetails'

import StudentDashboard from '../pages/Dashboard/StudentDashboard'
import InstructorDashboard from '../pages/Dashboard/InstructorDashboard'

import AdminDashboard from '../pages/Admin/AdminDashboard'
import ManageUsers from '../pages/Admin/ManageUsers'
import ManageCourses from '../pages/Admin/ManageCourses'

const AppRouter = () => {
  return (
    <Routes>
      {/* Public main routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to={routes.courseList} replace />} />
        <Route path={routes.courseList} element={<CourseList />} />
        <Route path={routes.courseDetails} element={<CourseDetails />} />
      </Route>

      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path={routes.login} element={<Login />} />
        <Route path={routes.register} element={<Register />} />
        <Route path={routes.forgotPassword} element={<ForgotPassword />} />
      </Route>

      {/* Student + instructor + admin shared protected routes */}
      <Route element={<PrivateRoute allowedRoles={['student', 'admin', 'instructor']} />}>
        <Route element={<MainLayout />}>
          <Route path={routes.studentDashboard} element={<StudentDashboard />} />
          <Route path={routes.instructorDashboard} element={<InstructorDashboard />} />
        </Route>
      </Route>

      {/* Admin only routes */}
      <Route element={<PrivateRoute allowedRoles={['admin']} />}>
        <Route element={<MainLayout />}>
          <Route path={routes.adminDashboard} element={<AdminDashboard />} />
          <Route path={routes.manageUsers} element={<ManageUsers />} />
          <Route path={routes.manageCourses} element={<ManageCourses />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={routes.courseList} replace />} />
    </Routes>
  )
}

export default AppRouter