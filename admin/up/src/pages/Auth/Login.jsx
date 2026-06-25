import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'
import { regex } from '../../constants/regex'
import { routes } from '../../constants/routes'
import { toastMessage } from '../../utils/toastMessage'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, error, isAuthenticated, user } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [formErrors, setFormErrors] = useState({})

  const validate = () => {
    const errors = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!regex.email.test(formData.email)) {
      errors.email = 'Enter a valid email address'
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    return errors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setFormErrors((prev) => ({
      ...prev,
      [name]: '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const result = await login(formData)

    if (result?.meta?.requestStatus === 'fulfilled') {
      toastMessage.success('Login successful')
    } else {
      toastMessage.error(result?.payload || 'Unable to login')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || (
        user?.role === 'admin' ? routes.adminDashboard : routes.studentDashboard
      )
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, user, navigate, location])

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
          Welcome back
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Login to your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Continue your learning journey with immersive AI-powered course experiences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          required
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          required
        />

        <div className="flex items-center justify-end">
          <Link
            to={routes.forgotPassword}
            className="text-sm font-medium text-teal-600 transition hover:text-teal-700"
          >
            Forgot Password?
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to={routes.register} className="font-semibold text-teal-600 hover:text-teal-700">
          Create account
        </Link>
      </p>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Demo access</p>
        <p className="mt-2 text-sm text-slate-700">
          Use any valid email and password with 6+ characters for UI testing.
        </p>
      </div>
    </div>
  )
}

export default Login