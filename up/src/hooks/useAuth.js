import { useDispatch, useSelector } from 'react-redux'
import {
  loginUser,
  registerUser,
  forgotPasswordRequest,
  logoutUser,
  setAuthFromStorage,
} from '../store/slices/authSlice'

const useAuth = () => {
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)

  return {
    ...auth,
    login: (payload) => dispatch(loginUser(payload)),
    register: (payload) => dispatch(registerUser(payload)),
    forgotPassword: (payload) => dispatch(forgotPasswordRequest(payload)),
    logout: () => dispatch(logoutUser()),
    restoreAuth: () => dispatch(setAuthFromStorage()),
  }
}

export default useAuth