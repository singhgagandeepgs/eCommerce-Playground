import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'

export default function Navbar() {
  const { user, profile } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav
      className={`sticky top-0 z-50 glass transition-all duration-200 ${
        scrolled ? 'border-b border-[#E2E8F0]/70 shadow-sm' : 'border-b border-transparent'
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0" data-testid="nav-logo">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-indigo-200/60">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-lg font-bold gradient-text">ShopPlay</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/cart"
              className="relative p-2.5 hover:bg-gray-100/80 rounded-xl transition-colors"
              data-testid="nav-cart"
            >
              <svg className="w-5 h-5 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-[#6366F1] text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none animate-bounce-in"
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
                  className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-colors"
                  data-testid="nav-orders"
                >
                  Orders
                </Link>
                <Link
                  to="/profile"
                  className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-colors"
                  data-testid="nav-profile"
                >
                  Profile
                </Link>
                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-sm text-[#6366F1] hover:text-[#4F46E5] font-semibold px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors"
                    data-testid="nav-admin"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-colors"
                  data-testid="nav-signout"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium px-3 py-2 rounded-xl hover:bg-gray-100/80 transition-colors"
                  data-testid="nav-login"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold px-4 py-2 rounded-xl btn-gradient text-white"
                  data-testid="nav-signup"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: cart + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <Link to="/cart" className="relative p-2.5" data-testid="nav-cart">
              <svg className="w-5 h-5 text-[#0F172A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-[#6366F1] text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center leading-none"
                  data-testid="cart-count"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2.5 rounded-xl hover:bg-gray-100/80 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <div className="w-5 flex flex-col gap-[5px]">
                <span className={`block h-0.5 rounded-full bg-[#0F172A] transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                <span className={`block h-0.5 rounded-full bg-[#0F172A] transition-all duration-300 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`} />
                <span className={`block h-0.5 rounded-full bg-[#0F172A] transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-fade-in">
          {user ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-gray-50 rounded-xl transition-colors"
                data-testid="nav-orders"
              >
                Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-gray-50 rounded-xl transition-colors"
                data-testid="nav-profile"
              >
                Profile
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-3 text-sm font-semibold text-[#6366F1] hover:bg-indigo-50 rounded-xl transition-colors"
                  data-testid="nav-admin"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-3 text-sm font-medium text-[#64748B] hover:bg-gray-50 rounded-xl transition-colors"
                data-testid="nav-signout"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-gray-50 rounded-xl transition-colors"
                data-testid="nav-login"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 text-sm font-semibold text-white btn-gradient rounded-xl text-center"
                data-testid="nav-signup"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
