import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const AVATAR_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
  '#F97316', '#F59E0B', '#10B981', '#14B8A6',
  '#06B6D4', '#3B82F6',
]

function getAvatarColor(email) {
  const code = (email?.[0] ?? 'a').toLowerCase().charCodeAt(0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
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

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    setSavingName(false)
    if (error) {
      setNameError(error.message)
    } else {
      await refreshProfile(user.id)
      addToast('Name updated successfully')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')

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
      addToast('Password updated successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-2xl mb-0" />
        <div className="h-16 w-16 rounded-full bg-gray-200 -mt-8 ml-6 mb-4 ring-4 ring-white" />
        <div className="px-6 space-y-4">
          <div className="h-6 bg-gray-100 rounded-full w-40" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-white rounded-2xl border border-[#E2E8F0]" />
            <div className="h-20 bg-white rounded-2xl border border-[#E2E8F0]" />
          </div>
        </div>
      </div>
    )
  }

  const avatarColor = getAvatarColor(user?.email)
  const initial = (user?.email?.[0] ?? '?').toUpperCase()
  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const memberSince = user?.created_at ? formatDate(user.created_at) : '—'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16" data-testid="profile-page">

      {/* Cover + avatar */}
      <div className="rounded-2xl overflow-hidden mb-0 border border-[#E2E8F0]">
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="bg-white px-6 pb-6">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 ring-4 ring-white shadow-lg"
              style={{ backgroundColor: avatarColor }}
              data-testid="profile-avatar"
            >
              {initial}
            </div>
            <div className="pb-1">
              <h1 className="text-lg font-bold text-[#0F172A]" data-testid="profile-display-name">
                {profile?.full_name || user?.email}
              </h1>
              <p className="text-sm text-[#64748B]" data-testid="profile-email">{user?.email}</p>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8] font-medium" data-testid="profile-member-since">
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 mb-4" data-testid="profile-stats">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" data-testid="profile-total-orders">
          <p className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wide">Total Orders</p>
          {ordersLoading ? (
            <div className="h-7 bg-gray-100 rounded-full w-12 mt-2 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-[#0F172A] mt-1" data-testid="profile-orders-count">
              {orders.length}
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" data-testid="profile-total-spent">
          <p className="text-xs text-[#94A3B8] font-semibold uppercase tracking-wide">Total Spent</p>
          {ordersLoading ? (
            <div className="h-7 bg-gray-100 rounded-full w-20 mt-2 animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-[#0F172A] mt-1" data-testid="profile-spent-amount">
              ${totalSpent.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[#6366F1] hover:text-[#4F46E5] font-medium transition-colors mb-6"
        data-testid="profile-orders-link"
      >
        View full order history
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>

      {/* Edit display name */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-4" data-testid="profile-name-section">
        <h2 className="text-sm font-bold text-[#0F172A] mb-4">Display Name</h2>
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label htmlFor="full-name" className="block text-sm font-semibold text-[#0F172A] mb-2">
              Full Name
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="input-field"
              data-testid="profile-name-input"
            />
          </div>
          {nameError && (
            <p className="text-sm text-[#EF4444]" data-testid="profile-name-error">{nameError}</p>
          )}
          <button
            type="submit"
            disabled={savingName}
            className="btn-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            data-testid="profile-name-save"
          >
            {savingName ? 'Saving…' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6" data-testid="profile-password-section">
        <h2 className="text-sm font-bold text-[#0F172A] mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-[#0F172A] mb-2">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              className="input-field"
              data-testid="profile-new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-[#0F172A] mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="input-field"
              data-testid="profile-confirm-password"
            />
          </div>
          {passwordError && (
            <p className="text-sm text-[#EF4444]" data-testid="profile-password-error">{passwordError}</p>
          )}
          <button
            type="submit"
            disabled={savingPassword}
            className="btn-gradient text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            data-testid="profile-password-save"
          >
            {savingPassword ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  )
}
