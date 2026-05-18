import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { saveGuestCartItem } from '../lib/cartUtils'

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      saveGuestCartItem(product.id)
      addToast('Item saved! Sign in to checkout')
      navigate('/login')
      return
    }
    setAdding(true)
    await addToCart(product.id)
    setAdding(false)
    setAdded(true)
    addToast(`${product.name} added to cart`)
    setTimeout(() => setAdded(false), 2000)
  }

  const outOfStock = product.stock_quantity === 0

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden card-hover border border-[#E2E8F0]/50 flex flex-col"
      data-testid="product-card"
    >
      {/* Image container */}
      <div className="relative overflow-hidden">
        <Link
          to={`/products/${product.id}`}
          data-testid={`product-link-${product.id}`}
          className="block aspect-[4/3] overflow-hidden"
        >
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            data-testid="product-image"
          />
        </Link>

        {/* Category pill over image */}
        <span
          className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#6366F1] shadow-sm border border-white/50"
          data-testid="product-category"
        >
          {product.category}
        </span>

        {/* Out-of-stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-xs font-semibold text-[#64748B] bg-white px-3 py-1.5 rounded-full shadow-sm border border-[#E2E8F0]">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`} className="block flex-1">
          <h3
            className="text-[#0F172A] font-semibold text-sm leading-snug hover:text-[#6366F1] transition-colors truncate"
            data-testid="product-name"
          >
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-[#0F172A]" data-testid="product-price">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <span className="text-[11px] text-[#EF4444] font-medium">
              {product.stock_quantity} left
            </span>
          )}
        </div>

        {/* Add to cart — subtle slide-up on card hover */}
        <div className="mt-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-200">
          <button
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              added
                ? 'bg-[#10B981] text-white'
                : outOfStock
                ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                : 'btn-gradient text-white'
            } disabled:opacity-70`}
            data-testid={`add-to-cart-${product.id}`}
          >
            {adding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Adding…
              </span>
            ) : added ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </span>
            ) : outOfStock ? (
              'Out of stock'
            ) : (
              'Add to cart'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
