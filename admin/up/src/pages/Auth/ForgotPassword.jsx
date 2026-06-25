import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'
import { regex } from '../../constants/regex'
import { routes } from '../../constants/routes'
import { toastMessage } from '../../utils/toastMessage'

const ForgotPassword = () => {
  const { forgotPassword, loading, error, forgotPasswordSuccess } = useAuth()

  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }

    if (!regex.email.test(email)) {
      setEmailError('Enter a valid email address')
      return
    }

    setEmailError('')
    const result = await forgotPassword({ email })

    if (result?.meta?.requestStatus === 'fulfilled') {
      toastMessage.success('Reset link sent successfully')
    } else {
      toastMessage.error(result?.payload || 'Unable to send reset link')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-600">
          Password recovery
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          Forgot your password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Enter your registered email and we&apos;ll send you a reset link.
        </p>
      </div>

      {forgotPasswordSuccess ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-lg font-semibold text-emerald-800">Check your inbox</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-700">
            We have sent a password reset link to your email address. Please follow the
            instructions to reset your password.
          </p>

          <Link
            to={routes.login}
            className="mt-5 inline-flex text-sm font-semibold text-emerald-700 underline underline-offset-4"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setEmailError('')
            }}
            error={emailError}
            required
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        Remember your password?{' '}
        <Link to={routes.login} className="font-semibold text-teal-600 hover:text-teal-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default ForgotPassword