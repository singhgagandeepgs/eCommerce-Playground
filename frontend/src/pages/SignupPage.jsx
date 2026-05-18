import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { mergeGuestCart } from '../lib/cartUtils'

export default function SignupPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      setErrorKey(k => k + 1)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setErrorKey(k => k + 1)
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setLoading(false)
      setError(error.message)
      setErrorKey(k => k + 1)
    } else if (data.session) {
      await mergeGuestCart(data.user.id)
      setLoading(false)
      navigate('/cart', { replace: true })
    } else {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 4000)
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50/60 flex items-center justify-center px-4"
        data-testid="signup-success"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-[#E2E8F0] p-10 text-center animate-scale-in">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Check your email</h2>
          <p className="text-[#64748B] text-sm leading-relaxed">
            We sent a confirmation link to{' '}
            <strong className="text-[#0F172A] font-semibold">{email}</strong>.
            <br />Redirecting to login in a moment…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50/60 flex items-center justify-center px-4 py-12"
      data-testid="signup-page"
    >
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-purple-200/15 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-indigo-200/60">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-xl font-bold gradient-text">ShopPlay</span>
          </Link>
          <p className="text-xs text-[#64748B] mt-3 font-medium">Join 10,000+ happy shoppers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-[#E2E8F0] p-8">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Create an account</h1>
          <p className="text-[#64748B] text-sm mb-7">Start shopping today — it's free.</p>

          {error && (
            <div
              key={errorKey}
              className="bg-red-50 border border-red-100 text-[#EF4444] rounded-xl px-4 py-3 text-sm mb-5 flex items-start gap-2.5 animate-shake"
              data-testid="signup-error"
            >
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="signup-form">
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="input-field"
                data-testid="signup-email"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Min. 6 characters"
                className="input-field"
                data-testid="signup-password"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="input-field"
                data-testid="signup-confirm-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-gradient text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              data-testid="signup-submit"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-sm text-[#64748B] mt-6 text-center">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-[#6366F1] hover:text-[#4F46E5] font-semibold transition-colors"
              data-testid="signup-login-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
