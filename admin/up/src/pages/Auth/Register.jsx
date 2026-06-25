import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'
import { regex } from '../../constants/regex'
import { routes } from '../../constants/routes'
import { toastMessage } from '../../utils/toastMessage'

const Register = () => {
  const navigate = useNavigate()
  const { register, loading, error, isAuthenticated, user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    password: '',
    confirmPassword: '',
  })

  const [formErrors, setFormErrors] = useState({})

  const validate = () => {
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Full name is required'
    } else if (!regex.name.test(formData.name)) {
      errors.name = 'Enter a valid full name'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!regex.email.test(formData.email)) {
      errors.email = 'Enter a valid email address'
    }

    if (!formData.password.trim()) {
      errors.password = 'Password is required'
    } else if (!regex.password.test(formData.password)) {
      errors.password =
        'Password must contain 8+ chars, uppercase, lowercase, number and special character'
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm password is required'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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

    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      password: formData.password,
    }

    const result = await register(payload)

    if (result?.meta?.requestStatus === 'fulfilled') {
      toastMessage.success('Registration successful')
    } else {
      toastMessage.error(result?.payload || 'Unable to register')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = user?.role === 'admin' ? routes.adminDashboard : routes.studentDashboard
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
          Get started
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Join the AI-powered learning platform and start building modern tech skills.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          error={formErrors.name}
          required
        />

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

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Select Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          helperText="Use uppercase, lowercase, number and special character."
          required
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          required
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to={routes.login} className="font-semibold text-teal-600 hover:text-teal-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default Register