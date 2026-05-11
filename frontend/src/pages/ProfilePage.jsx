import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const AVATAR_COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500',
  'bg-orange-500', 'bg-amber-500', 'bg-green-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-blue-500',
]

function getAvatarColor(email) {
  const code = (email?.[0] ?? 'a').toLowerCase().charCodeAt(0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { state: { from: '/profile' } })
      return
    }

    setFullName(profile?.full_name ?? '')

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, total_amount')
        .eq('user_id', user.id)
      setOrders(data ?? [])
      setOrdersLoading(false)
    }
    fetchOrders()
  }, [user, authLoading, profile, navigate])

  const handleSaveName = async (e) => {
    e.preventDefault()
    setSavingName(true)
    setNameError('')
    setNameSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    setSavingName(false)
    if (error) {
      setNameError(error.message)
    } else {
      await refreshProfile(user.id)
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4 animate-pulse">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-52" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 h-20" />
          <div className="bg-white rounded-xl shadow-sm p-5 h-20" />
        </div>
      </div>
    )
  }

  const avatarColor = getAvatarColor(user?.email)
  const initial = (user?.email?.[0] ?? '?').toUpperCase()
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const memberSince = user?.created_at ? formatDate(user.created_at) : '—'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="profile-page">

      {/* Avatar + identity */}
      <div className="flex items-center gap-5 mb-8">
        <div
          className={`${avatarColor} w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}
          data-testid="profile-avatar"
        >
          {initial}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="profile-display-name">
            {profile?.full_name || user?.email}
          </h1>
          <p className="text-sm text-gray-500" data-testid="profile-email">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5" data-testid="profile-member-since">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Order stats */}
      <div className="grid grid-cols-2 gap-4 mb-4" data-testid="profile-stats">
        <div className="bg-white rounded-xl shadow-sm p-5" data-testid="profile-total-orders">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Orders</p>
          {ordersLoading ? (
            <div className="h-7 bg-gray-100 rounded w-12 mt-1 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1" data-testid="profile-orders-count">
              {orders.length}
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5" data-testid="profile-total-spent">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Total Spent</p>
          {ordersLoading ? (
            <div className="h-7 bg-gray-100 rounded w-20 mt-1 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 mt-1" data-testid="profile-spent-amount">
              ${totalSpent.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8">
        <Link
          to="/orders"
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          data-testid="profile-orders-link"
        >
          View full order history →
        </Link>
      </div>

      {/* Edit display name */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-4" data-testid="profile-name-section">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Display Name</h2>
        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="profile-name-input"
            />
          </div>
          {nameError && (
            <p className="text-sm text-red-600" data-testid="profile-name-error">{nameError}</p>
          )}
          {nameSuccess && (
            <p className="text-sm text-green-600" data-testid="profile-name-success">Name updated!</p>
          )}
          <button
            type="submit"
            disabled={savingName}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            data-testid="profile-name-save"
          >
            {savingName ? 'Saving…' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl shadow-sm p-6" data-testid="profile-password-section">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="profile-new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              data-testid="profile-confirm-password"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-red-600" data-testid="profile-password-error">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-sm text-green-600" data-testid="profile-password-success">Password updated!</p>
          )}
          <button
            type="submit"
            disabled={savingPassword}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            data-testid="profile-password-save"
          >
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  )
}
