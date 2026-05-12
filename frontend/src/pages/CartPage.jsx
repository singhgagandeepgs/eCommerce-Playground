import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const handleCheckout = () => {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/payment')
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center" data-testid="cart-not-logged-in">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-500 mb-6 text-lg">Log in to view your cart.</p>
        <Link
          to="/login"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
          data-testid="cart-login-link"
        >
          Log in
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl" />
        ))}
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center" data-testid="cart-empty">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</p>
        <p className="text-gray-400 text-sm mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/"
          className="text-indigo-600 hover:text-indigo-800 font-medium"
          data-testid="cart-empty-shop-link"
        >
          Continue shopping →
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="cart-page">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4" data-testid="cart-items">
          {cartItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4"
              data-testid={`cart-item-${item.id}`}
            >
              <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                <img
                  src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/80/80`}
                  alt={item.products?.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product_id}`}
                  className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate block"
                  data-testid={`cart-item-name-${item.id}`}
                >
                  {item.products?.name}
                </Link>
                <p className="text-gray-400 text-sm mt-0.5" data-testid={`cart-item-price-${item.id}`}>
                  ${Number(item.products?.price ?? 0).toFixed(2)} each
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden" data-testid={`cart-quantity-${item.id}`}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      data-testid={`cart-decrease-${item.id}`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900" data-testid={`cart-qty-value-${item.id}`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                      data-testid={`cart-increase-${item.id}`}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors"
                    data-testid={`cart-remove-${item.id}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <span className="font-bold text-gray-900 flex-shrink-0" data-testid={`cart-item-total-${item.id}`}>
                ${(Number(item.products?.price ?? 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24" data-testid="cart-summary">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-500 mb-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="truncate">{item.products?.name} × {item.quantity}</span>
                  <span className="flex-shrink-0">${(Number(item.products?.price ?? 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-gray-900 text-lg mb-6">
              <span>Total</span>
              <span data-testid="cart-total">${cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              data-testid="checkout-button"
            >
              Proceed to Payment
            </button>

            <Link
              to="/"
              className="block text-center text-sm text-indigo-600 hover:underline mt-4"
              data-testid="continue-shopping"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
