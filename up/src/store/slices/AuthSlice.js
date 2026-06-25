import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../../api/authApi'

const storedToken = sessionStorage.getItem('lms_token')
const storedUser = sessionStorage.getItem('lms_user')

const initialState = {
  loading: false,
  isAuthenticated: !!storedToken,
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  error: null,
  forgotPasswordSuccess: false,
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload)

      const token = response?.token || 'demo-ui-token'
      const user = response?.user || {
        name: payload.email?.split('@')[0] || 'Student User',
        email: payload.email,
        role: 'student',
      }

      sessionStorage.setItem('lms_token', token)
      sessionStorage.setItem('lms_user', JSON.stringify(user))

      return { token, user }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Login failed. Please try again.',
      )
    }
  },
)

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload)

      const token = response?.token || 'demo-ui-token'
      const user = response?.user || {
        name: payload.name,
        email: payload.email,
        role: payload.role || 'student',
      }

      sessionStorage.setItem('lms_token', token)
      sessionStorage.setItem('lms_user', JSON.stringify(user))

      return { token, user }
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Registration failed. Please try again.',
      )
    }
  },
)

export const forgotPasswordRequest = createAsyncThunk(
  'auth/forgotPasswordRequest',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(payload)
      return response?.message || 'Password reset link sent successfully.'
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || 'Failed to send reset link.',
      )
    }
  },
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      sessionStorage.removeItem('lms_token')
      sessionStorage.removeItem('lms_user')
      state.loading = false
      state.isAuthenticated = false
      state.token = null
      state.user = null
      state.error = null
      state.forgotPasswordSuccess = false
    },
    setAuthFromStorage: (state) => {
      const token = sessionStorage.getItem('lms_token')
      const user = sessionStorage.getItem('lms_user')

      state.token = token || null
      state.user = user ? JSON.parse(user) : null
      state.isAuthenticated = !!token
    },
    clearAuthError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.user = action.payload.user
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(forgotPasswordRequest.pending, (state) => {
        state.loading = true
        state.error = null
        state.forgotPasswordSuccess = false
      })
      .addCase(forgotPasswordRequest.fulfilled, (state) => {
        state.loading = false
        state.forgotPasswordSuccess = true
      })
      .addCase(forgotPasswordRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.forgotPasswordSuccess = false
      })
  },
})

export const { logoutUser, setAuthFromStorage, clearAuthError } = authSlice.actions
export default authSlice.reducer