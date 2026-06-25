import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { routes } from '../constants/routes'

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace />
  }

  if (allowedRoles.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={routes.courseList} replace />
  }

  return <Outlet />
}

export default PrivateRoute