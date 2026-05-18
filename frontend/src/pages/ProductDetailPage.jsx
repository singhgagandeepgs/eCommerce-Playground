import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { saveGuestCartItem } from '../lib/cartUtils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
  const { addToast } = useToast()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      saveGuestCartItem(product.id, quantity)
      addToast('Item saved! Sign in to checkout')
      navigate('/login')
      return
    }
    setAdding(true)
    await addToCart(product.id, quantity)
    setAdding(false)
    setAdded(true)
    addToast(`${product.name} added to cart`)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-4 bg-gray-100 rounded-full w-28 mb-8" />
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2 aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-3 bg-gray-100 rounded-full w-1/5" />
            <div className="h-8 bg-gray-100 rounded-xl w-3/4" />
            <div className="h-4 bg-gray-100 rounded-full w-full" />
            <div className="h-4 bg-gray-100 rounded-full w-5/6" />
            <div className="h-4 bg-gray-100 rounded-full w-2/3" />
            <div className="h-12 bg-gray-100 rounded-xl w-1/3 mt-4" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-[#94A3B8]" data-testid="product-not-found">
        <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-[#0F172A]">Product not found</p>
        <Link to="/" className="text-[#6366F1] hover:text-[#4F46E5] text-sm mt-3 inline-flex items-center gap-1 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to products
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock_quantity === 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="product-detail">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#6366F1] mb-8 font-medium transition-colors"
        data-testid="back-to-products"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to products
      </Link>

      <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
        {/* Image */}
        <div className="w-full md:w-[45%] flex-shrink-0">
          <div className="rounded-2xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0]">
            <img
              src={product.image_url || `https://picsum.photos/seed/${product.id}/600/500`}
              alt={product.name}
              className="w-full aspect-[4/3] object-cover"
              data-testid="detail-product-image"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col">
          <span
            className="inline-flex items-center text-xs font-semibold text-[#6366F1] bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full w-fit"
            data-testid="detail-category"
          >
            {product.category}
          </span>

          <h1
            className="mt-3 text-2xl sm:text-3xl font-bold text-[#0F172A] leading-tight"
            data-testid="detail-product-name"
          >
            {product.name}
          </h1>

          <p
            className="mt-4 text-[#64748B] leading-relaxed text-sm sm:text-base flex-1"
            data-testid="detail-product-description"
          >
            {product.description || 'No description available.'}
          </p>

          {/* Price + stock */}
          <div className="mt-6 flex items-center gap-4">
            <span className="text-3xl font-bold text-[#0F172A]" data-testid="detail-product-price">
              ${Number(product.price).toFixed(2)}
            </span>
            {outOfStock ? (
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#EF4444] bg-red-50 border border-red-100 px-2.5 py-1 rounded-full"
                data-testid="stock-status"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                Out of stock
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#10B981] bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full"
                data-testid="stock-status"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                In stock ({product.stock_quantity} left)
              </span>
            )}
          </div>

          {/* Separator */}
          <div className="my-6 border-t border-[#E2E8F0]" />

          {!outOfStock && (
            <div className="flex items-center gap-4">
              {/* Quantity selector */}
              <div
                className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden"
                data-testid="quantity-selector"
              >
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-lg font-medium"
                  data-testid="quantity-decrease"
                >
                  −
                </button>
                <span
                  className="w-12 text-center font-semibold text-[#0F172A] text-sm"
                  data-testid="quantity-value"
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors text-lg font-medium"
                  data-testid="quantity-increase"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-200/50'
                    : 'btn-gradient text-white'
                } disabled:opacity-70`}
                data-testid="detail-add-to-cart"
              >
                {adding ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Adding…
                  </>
                ) : added ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to cart!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to cart
                  </>
                )}
              </button>
            </div>
          )}

          {outOfStock && (
            <button
              disabled
              className="mt-2 w-full py-3 rounded-xl font-semibold bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed text-sm"
              data-testid="detail-add-to-cart"
            >
              Out of stock
            </button>
          )}

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { icon: '🚚', text: 'Free shipping over $50' },
              { icon: '↩️', text: '30-day returns' },
              { icon: '🔒', text: 'Secure checkout' },
            ].map(b => (
              <span key={b.text} className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
                <span>{b.icon}</span>
                {b.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
