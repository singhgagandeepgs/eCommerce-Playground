import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'

const FREE_SHIPPING_THRESHOLD = 50

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart()
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [removing, setRemoving] = useState(new Set())

  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/payment')
  }

  const handleRemove = async (itemId, productName) => {
    setRemoving(prev => new Set([...prev, itemId]))
    await new Promise(r => setTimeout(r, 280))
    await removeFromCart(itemId)
    setRemoving(prev => { const s = new Set(prev); s.delete(itemId); return s })
    addToast(`${productName} removed from cart`)
  }

  const shippingProgress = Math.min(100, (cartTotal / FREE_SHIPPING_THRESHOLD) * 100)
  const amountLeft = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal)

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center" data-testid="cart-not-logged-in">
        <div className="w-20 h-20 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-[#0F172A] font-semibold text-lg mb-2">Sign in to view your cart</p>
        <p className="text-[#64748B] text-sm mb-8">Your cart items are saved when you're logged in.</p>
        <Link
          to="/login"
          className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm inline-block"
          data-testid="cart-login-link"
        >
          Sign in
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-[#E2E8F0]" />
        ))}
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center" data-testid="cart-empty">
        <div className="w-20 h-20 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-[#0F172A] mb-2">Your cart is empty</p>
        <p className="text-[#64748B] text-sm mb-8">Looks like you haven't added anything yet.</p>
        <Link
          to="/"
          className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
          data-testid="cart-empty-shop-link"
        >
          Start shopping
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="cart-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">Shopping Cart</h1>
        <p className="text-[#64748B] text-sm mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart items */}
        <div className="flex-1 space-y-3" data-testid="cart-items">
          {cartItems.map(item => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border border-[#E2E8F0] p-4 flex items-center gap-4 transition-all duration-300 ${
                removing.has(item.id) ? 'opacity-0 scale-95 -translate-x-4' : 'opacity-100 scale-100 translate-x-0'
              }`}
              data-testid={`cart-item-${item.id}`}
            >
              <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0]">
                  <img
                    src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/80/80`}
                    alt={item.products?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product_id}`}
                  className="font-semibold text-[#0F172A] hover:text-[#6366F1] transition-colors truncate block text-sm"
                  data-testid={`cart-item-name-${item.id}`}
                >
                  {item.products?.name}
                </Link>
                <p className="text-[#94A3B8] text-xs mt-0.5" data-testid={`cart-item-price-${item.id}`}>
                  ${Number(item.products?.price ?? 0).toFixed(2)} each
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <div
                    className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden"
                    data-testid={`cart-quantity-${item.id}`}
                  >
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-base"
                      data-testid={`cart-decrease-${item.id}`}
                    >
                      −
                    </button>
                    <span
                      className="w-8 text-center text-sm font-semibold text-[#0F172A]"
                      data-testid={`cart-qty-value-${item.id}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-base"
                      data-testid={`cart-increase-${item.id}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id, item.products?.name ?? 'Item')}
                    className="text-xs text-[#94A3B8] hover:text-[#EF4444] transition-colors font-medium"
                    data-testid={`cart-remove-${item.id}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <span className="font-bold text-[#0F172A] flex-shrink-0 text-sm" data-testid={`cart-item-total-${item.id}`}>
                ${(Number(item.products?.price ?? 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-24" data-testid="cart-summary">
            <h2 className="text-base font-bold text-[#0F172A] mb-5">Order Summary</h2>

            {/* Free shipping progress */}
            <div className="mb-5 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              {amountLeft > 0 ? (
                <p className="text-xs text-[#64748B] mb-2">
                  Add <span className="font-semibold text-[#0F172A]">${amountLeft.toFixed(2)}</span> more for free shipping
                </p>
              ) : (
                <p className="text-xs text-[#10B981] font-semibold mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  You've unlocked free shipping!
                </p>
              )}
              <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${shippingProgress}%`,
                    background: shippingProgress >= 100 ? '#10B981' : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                  }}
                />
              </div>
            </div>

            {/* Line items */}
            <div className="space-y-2 text-xs text-[#64748B] mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="truncate">{item.products?.name} × {item.quantity}</span>
                  <span className="flex-shrink-0 font-medium">${(Number(item.products?.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#0F172A]">Total</span>
                <span className="text-xl font-bold text-[#0F172A]" data-testid="cart-total">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
              {cartTotal >= FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-[#10B981] font-medium mt-1 text-right">Free shipping applied</p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-gradient text-white py-3 rounded-xl font-semibold text-sm"
              data-testid="checkout-button"
            >
              Proceed to Payment →
            </button>

            <Link
              to="/"
              className="block text-center text-xs text-[#64748B] hover:text-[#6366F1] transition-colors mt-4 font-medium"
              data-testid="continue-shopping"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
