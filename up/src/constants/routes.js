export const routes = {
  // Auth Routes
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  
  // Course Routes
  courseList: '/courses',
  courseDetails: '/courses/:id',
  
  // Dashboard Routes
  studentDashboard: '/dashboard/student',
  instructorDashboard: '/dashboard/instructor',
  
  // Admin Routes
  adminDashboard: '/admin',
  manageUsers: '/admin/users',
  manageCourses: '/admin/courses'
}