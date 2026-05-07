import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setAdding(true)
    await addToCart(product.id)
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const outOfStock = product.stock_quantity === 0

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col" data-testid="product-card">
      <Link to={`/products/${product.id}`} data-testid={`product-link-${product.id}`} className="block overflow-hidden">
        <img
          src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          data-testid="product-image"
        />
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide" data-testid="product-category">
          {product.category}
        </span>
        <Link to={`/products/${product.id}`} className="block mt-1 flex-1">
          <h3 className="text-gray-900 font-semibold truncate hover:text-indigo-600 transition-colors" data-testid="product-name">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-3 gap-2">
          <span className="text-lg font-bold text-gray-900" data-testid="product-price">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={adding || outOfStock}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0 ${
              added
                ? 'bg-green-500 text-white'
                : outOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
            data-testid={`add-to-cart-${product.id}`}
          >
            {adding ? '…' : added ? 'Added!' : outOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
