import axiosInstance from './axiosInstance'
import { apiUrls } from '../constants/apiUrls'

export const authApi = {
  login: async (payload) => {
    const response = await axiosInstance.post(apiUrls.auth.login, payload)
    return response.data
  },

  register: async (payload) => {
    const response = await axiosInstance.post(apiUrls.auth.register, payload)
    return response.data
  },

  forgotPassword: async (payload) => {
    const response = await axiosInstance.post(apiUrls.auth.forgotPassword, payload)
    return response.data
  },
}