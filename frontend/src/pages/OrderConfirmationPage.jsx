import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const [{ data: orderData }, { data: itemsData }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).single(),
        supabase.from('order_items').select('*, products(*)').eq('order_id', orderId),
      ])
      setOrder(orderData)
      setOrderItems(itemsData ?? [])
      setLoading(false)
    }
    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-8" />
        <div className="h-56 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-24 text-gray-400" data-testid="order-not-found">
        <p className="text-lg">Order not found.</p>
        <Link to="/" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">Go home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="order-confirmation-page">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900" data-testid="confirmation-title">Order Confirmed!</h1>
        <p className="text-gray-400 mt-2 text-sm">Thank you for your purchase. We'll get it shipped soon.</p>
        <p className="text-xs text-gray-300 mt-2 font-mono" data-testid="order-id">#{order.id}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Order Details</h2>

        <div className="space-y-4 mb-6" data-testid="order-items">
          {orderItems.map(item => (
            <div key={item.id} className="flex items-center gap-4" data-testid={`order-item-${item.id}`}>
              <img
                src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/64/64`}
                alt={item.products?.name}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.products?.name}</p>
                <p className="text-sm text-gray-400">
                  {item.quantity} × ${Number(item.price).toFixed(2)}
                </p>
              </div>
              <p className="font-semibold text-gray-900 flex-shrink-0">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex justify-between font-bold text-gray-900 text-lg">
          <span>Total Paid</span>
          <span data-testid="order-total">${Number(order.total_amount).toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link
          to="/"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          data-testid="continue-shopping-link"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
