import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()
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
      navigate('/login')
      return
    }
    setAdding(true)
    await addToCart(product.id, quantity)
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/2 h-96 bg-gray-200 rounded-2xl" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="h-4 bg-gray-200 rounded w-1/5" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-10 bg-gray-200 rounded w-1/3 mt-4" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-24 text-gray-400" data-testid="product-not-found">
        <p className="text-lg">Product not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          ← Back to products
        </Link>
      </div>
    )
  }

  const outOfStock = product.stock_quantity === 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="product-detail">
      <Link to="/" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-8 gap-1" data-testid="back-to-products">
        ← Back to products
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2">
          <img
            src={product.image_url || `https://picsum.photos/seed/${product.id}/600/500`}
            alt={product.name}
            className="w-full rounded-2xl object-cover shadow-md aspect-[4/3]"
            data-testid="detail-product-image"
          />
        </div>

        <div className="flex-1 flex flex-col">
          <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide" data-testid="detail-category">
            {product.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 leading-snug" data-testid="detail-product-name">
            {product.name}
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed flex-1" data-testid="detail-product-description">
            {product.description || 'No description available.'}
          </p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900" data-testid="detail-product-price">
              ${Number(product.price).toFixed(2)}
            </span>
            {outOfStock ? (
              <span className="text-sm text-red-500 font-medium" data-testid="stock-status">Out of stock</span>
            ) : (
              <span className="text-sm text-green-600 font-medium" data-testid="stock-status">
                In stock ({product.stock_quantity} left)
              </span>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden" data-testid="quantity-selector">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  data-testid="quantity-decrease"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-900" data-testid="quantity-value">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  data-testid="quantity-increase"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`flex-1 py-3 rounded-lg font-semibold text-white transition-colors ${
                  added ? 'bg-green-500' : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-70`}
                data-testid="detail-add-to-cart"
              >
                {adding ? 'Adding…' : added ? 'Added to cart!' : 'Add to cart'}
              </button>
            </div>
          )}

          {outOfStock && (
            <button disabled className="mt-6 w-full py-3 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed" data-testid="detail-add-to-cart">
              Out of stock
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
