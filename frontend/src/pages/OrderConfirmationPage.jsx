import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CONFETTI_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444']

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${2 + Math.random() * 3}s`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: `${5 + Math.floor(Math.random() * 8)}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    })),
  [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: '-20px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.borderRadius,
            animation: `confettiFall ${p.duration} ${p.delay} ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

const ORDER_STEPS = [
  { label: 'Order Placed', icon: '📦', done: true },
  { label: 'Processing',   icon: '⚙️',  done: true },
  { label: 'Shipped',      icon: '🚚',  done: false },
  { label: 'Delivered',    icon: '🎉',  done: false },
]

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(true)

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
    const t = setTimeout(() => setShowConfetti(false), 5500)
    return () => clearTimeout(t)
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl mx-auto mb-6" />
        <div className="h-8 bg-gray-100 rounded-xl w-1/2 mx-auto mb-2" />
        <div className="h-4 bg-gray-100 rounded-full w-1/3 mx-auto mb-8" />
        <div className="h-56 bg-white rounded-2xl border border-[#E2E8F0]" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-24 text-[#94A3B8]" data-testid="order-not-found">
        <p className="text-lg font-semibold text-[#0F172A]">Order not found.</p>
        <Link to="/" className="text-[#6366F1] hover:text-[#4F46E5] text-sm mt-3 inline-block font-medium">Go home</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-testid="order-confirmation-page">
      {showConfetti && <Confetti />}

      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 animate-bounce-in">
          <svg className="w-10 h-10 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A]" data-testid="confirmation-title">
          Order Confirmed!
        </h1>
        <p className="text-[#64748B] mt-2 text-sm">
          Thank you for your purchase. We'll get it shipped soon.
        </p>
        <p className="text-xs text-[#94A3B8] mt-2 font-mono" data-testid="order-id">
          #{order.id}
        </p>
      </div>

      {/* Order timeline */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-4">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-5">Order Status</h2>
        <div className="flex items-center justify-between">
          {ORDER_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all ${
                  step.done
                    ? 'bg-[#6366F1] shadow-md shadow-indigo-200/50'
                    : 'bg-[#F1F5F9] border border-[#E2E8F0]'
                }`}>
                  <span>{step.icon}</span>
                </div>
                <span className={`text-[10px] mt-1.5 font-medium ${step.done ? 'text-[#6366F1]' : 'text-[#94A3B8]'}`}>
                  {step.label}
                </span>
              </div>
              {i < ORDER_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${step.done && ORDER_STEPS[i + 1].done ? 'bg-[#6366F1]' : 'bg-[#E2E8F0]'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-5">Order Details</h2>

        <div className="space-y-4 mb-6" data-testid="order-items">
          {orderItems.map(item => (
            <div key={item.id} className="flex items-center gap-4" data-testid={`order-item-${item.id}`}>
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] flex-shrink-0">
                <img
                  src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/64/64`}
                  alt={item.products?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0F172A] truncate text-sm">{item.products?.name}</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {item.quantity} × ${Number(item.price).toFixed(2)}
                </p>
              </div>
              <p className="font-bold text-[#0F172A] flex-shrink-0 text-sm">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-[#64748B]">Total Paid</span>
          <span className="text-xl font-bold text-[#0F172A]" data-testid="order-total">
            ${Number(order.total_amount).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link
          to="/"
          className="btn-gradient text-white px-8 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
          data-testid="continue-shopping-link"
        >
          Continue Shopping
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
