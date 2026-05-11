import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const { user, profile } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight" data-testid="nav-logo">
            ShopPlay
          </Link>

          <div className="flex items-center gap-5">
            <Link to="/cart" className="relative p-1" data-testid="nav-cart">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none"
                  data-testid="cart-count"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  to="/orders"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  data-testid="nav-orders"
                >
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  data-testid="nav-profile"
                >
                  Profile
                </Link>
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold"
                    data-testid="nav-admin"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  data-testid="nav-signout"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  data-testid="nav-login"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  data-testid="nav-signup"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
