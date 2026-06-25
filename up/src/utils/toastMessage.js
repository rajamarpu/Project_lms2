import { toast } from '../components/common/Toaster.jsx'

export const toastMessage = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  warning: (message) => toast.warning(message),
  info: (message) => toast.info(message)
}