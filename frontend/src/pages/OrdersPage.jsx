import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const STATUS_STYLES = {
  pending:   'bg-amber-50 text-amber-700 border-amber-100',
  shipped:   'bg-blue-50 text-blue-700 border-blue-100',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
}

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-600 border-gray-100'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${cls}`}
      data-testid="order-status-badge"
    >
      {status}
    </span>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function shortId(id) {
  return id.slice(0, 8).toUpperCase()
}

function SkeletonRow() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded-full w-1/4" />
        <div className="h-4 bg-gray-100 rounded-full w-1/6" />
      </div>
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
    </div>
  )
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate('/login', { state: { from: '/orders' } })
      return
    }

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(data ?? [])
      setLoading(false)
    }

    fetchOrders()
  }, [user, authLoading, navigate])

  const toggle = (id) => setExpandedId(prev => (prev === id ? null : id))

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-3">
        <div className="h-8 bg-gray-100 rounded-xl w-1/4 animate-pulse mb-8" />
        {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="orders-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0F172A]">My Orders</h1>
        <p className="text-[#64748B] text-sm mt-1">Your complete order history</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24" data-testid="orders-empty">
          <div className="w-20 h-20 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-xl font-bold text-[#0F172A] mb-2">No orders yet</p>
          <p className="text-[#64748B] text-sm mb-8">When you place an order it'll show up here.</p>
          <Link
            to="/"
            className="btn-gradient text-white px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
            data-testid="orders-shop-link"
          >
            Start shopping
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-3" data-testid="orders-list">
          {orders.map(order => {
            const isOpen = expandedId === order.id
            const items = order.order_items ?? []

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden"
                data-testid={`order-row-${order.id}`}
              >
                <button
                  onClick={() => toggle(order.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[#FAFAFA] transition-colors"
                  data-testid={`order-toggle-${order.id}`}
                  aria-expanded={isOpen}
                >
                  <svg
                    className={`w-4 h-4 text-[#94A3B8] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>

                  <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 items-center">
                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide">Order</p>
                      <p className="text-sm font-bold text-[#0F172A] font-mono" data-testid={`order-short-id-${order.id}`}>
                        #{shortId(order.id)}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide">Date</p>
                      <p className="text-sm text-[#64748B]" data-testid={`order-date-${order.id}`}>
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide mb-1">Status</p>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="text-right sm:text-left">
                      <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wide">Total</p>
                      <p className="text-sm font-bold text-[#0F172A]" data-testid={`order-total-${order.id}`}>
                        ${Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#E2E8F0] px-5 py-4" data-testid={`order-detail-${order.id}`}>
                    <p className="text-xs text-[#94A3B8] mb-4 sm:hidden">
                      Placed on {formatDate(order.created_at)}
                    </p>

                    <div className="space-y-3" data-testid={`order-items-${order.id}`}>
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3" data-testid={`order-item-${item.id}`}>
                          <Link to={`/products/${item.product_id}`} className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0]">
                              <img
                                src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/48/48`}
                                alt={item.products?.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/products/${item.product_id}`}
                              className="text-sm font-semibold text-[#0F172A] hover:text-[#6366F1] transition-colors truncate block"
                              data-testid={`order-item-name-${item.id}`}
                            >
                              {item.products?.name ?? 'Product unavailable'}
                            </Link>
                            <p className="text-xs text-[#94A3B8] mt-0.5" data-testid={`order-item-qty-${item.id}`}>
                              Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#0F172A] flex-shrink-0" data-testid={`order-item-subtotal-${item.id}`}>
                            ${(item.quantity * Number(item.price)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
                      <p className="text-xs text-[#94A3B8] font-mono" data-testid={`order-full-id-${order.id}`}>
                        ID: {order.id}
                      </p>
                      <p className="text-sm font-bold text-[#0F172A]">
                        ${Number(order.total_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
