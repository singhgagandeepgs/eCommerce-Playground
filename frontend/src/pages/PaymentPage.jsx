import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: '14px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#0F172A',
      '::placeholder': { color: '#94A3B8' },
    },
    invalid: { color: '#EF4444' },
  },
}

const TEST_CARDS = [
  { icon: '✅', label: 'Success',            number: '4242 4242 4242 4242' },
  { icon: '❌', label: 'Declined',            number: '4000 0000 0000 0002' },
  { icon: '❌', label: 'Insufficient funds',  number: '4000 0000 0000 9995' },
  { icon: '🔐', label: '3D Secure',           number: '4000 0027 6000 3184' },
]

const STEPS = ['Cart', 'Payment', 'Confirmation']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < current
                ? 'bg-[#10B981] text-white'
                : i === current
                ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-200/50'
                : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0]'
            }`}>
              {i < current ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-[10px] mt-1.5 font-medium ${i === current ? 'text-[#6366F1]' : i < current ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-4 rounded-full transition-all ${i < current ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? ''
}

function CheckoutForm({ clientSecret, cartItems, cartTotal, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const { clearCart } = useCart()

  const [billingName, setBillingName] = useState('')
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [testCardsOpen, setTestCardsOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setError('')
    setPaying(true)

    const cardElement = elements.getElement(CardElement)

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: { name: billingName },
      },
    })

    if (stripeError) {
      setError(stripeError.message)
      setPaying(false)
      return
    }

    if (paymentIntent.status !== 'succeeded') {
      setError(`Unexpected payment status: ${paymentIntent.status}`)
      setPaying(false)
      return
    }

    try {
      const token = await getAuthToken()
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/payments/confirm`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Order creation failed. Contact support with your payment reference.')
        setPaying(false)
        return
      }
      await clearCart()
      onSuccess(data.orderId)
    } catch {
      setError('Network error confirming order. Contact support.')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="payment-form">

      <div>
        <label htmlFor="billing-name" className="block text-sm font-semibold text-[#0F172A] mb-2">
          Name on card
        </label>
        <input
          id="billing-name"
          type="text"
          value={billingName}
          onChange={e => setBillingName(e.target.value)}
          placeholder="Jane Smith"
          required
          className="input-field"
          data-testid="billing-name-input"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#0F172A] mb-2">Card details</label>
        <div
          className="border border-[#E2E8F0] rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-[#6366F1]/20 focus-within:border-[#6366F1] transition-all duration-200 bg-white"
          data-testid="card-element-wrapper"
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {error && (
        <div
          className="bg-red-50 border border-red-100 text-[#EF4444] rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
          data-testid="payment-error"
        >
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || paying || !clientSecret}
        className="w-full btn-gradient text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        data-testid="pay-button"
      >
        {paying ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Processing…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay ${cartTotal.toFixed(2)}
          </>
        )}
      </button>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-4 text-xs text-[#94A3B8]">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secured by Stripe
        </span>
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          256-bit SSL
        </span>
      </div>

      {/* Test cards collapsible */}
      <div className="border border-[#E2E8F0] rounded-xl overflow-hidden" data-testid="test-cards-section">
        <button
          type="button"
          onClick={() => setTestCardsOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          data-testid="test-cards-toggle"
          aria-expanded={testCardsOpen}
        >
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Test Cards
          </span>
          <svg
            className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${testCardsOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {testCardsOpen && (
          <div className="px-4 py-3 space-y-2 bg-white" data-testid="test-cards-list">
            <p className="text-xs text-[#94A3B8] mb-3">Use any future expiry + any 3-digit CVC.</p>
            {TEST_CARDS.map(card => (
              <div
                key={card.number}
                className="flex items-center justify-between text-xs"
                data-testid={`test-card-${card.label.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <span className="text-[#64748B] flex items-center gap-1.5">
                  <span>{card.icon}</span>
                  {card.label}
                </span>
                <span className="font-mono bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 rounded-lg text-[#0F172A] tracking-wider">
                  {card.number}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuth()
  const { cartItems, cartTotal, loading: cartLoading } = useCart()
  const navigate = useNavigate()

  const [clientSecret, setClientSecret] = useState('')
  const [intentError, setIntentError] = useState('')

  useEffect(() => {
    if (authLoading || cartLoading) return
    if (!user) {
      navigate('/login', { state: { from: '/payment' } })
      return
    }
    if (cartItems.length === 0) {
      navigate('/cart')
      return
    }

    const fetchIntent = async () => {
      try {
        const token = await getAuthToken()
        const res = await fetch(
          `${import.meta.env.VITE_API_URL ?? 'http://localhost:4000'}/api/payments/create-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: Math.round(cartTotal * 100), currency: 'usd' }),
          }
        )
        const data = await res.json()
        if (!res.ok) {
          setIntentError(data.error ?? 'Failed to initialize payment.')
          return
        }
        setClientSecret(data.clientSecret)
      } catch {
        setIntentError('Network error. Please try again.')
      }
    }

    fetchIntent()
  }, [user, authLoading, cartItems, cartLoading, cartTotal, navigate])

  const handleSuccess = (orderId) => {
    navigate(`/order-confirmation/${orderId}`)
  }

  if (authLoading || cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-100 rounded-xl w-1/3 mb-6" />
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
          <div className="w-full lg:w-72">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 h-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="payment-page">
      <StepIndicator current={1} />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Payment form */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6" data-testid="payment-card">
            <h2 className="text-base font-bold text-[#0F172A] mb-5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              Payment Details
            </h2>

            {intentError ? (
              <div className="bg-red-50 border border-red-100 text-[#EF4444] rounded-xl px-4 py-3 text-sm" data-testid="intent-error">
                {intentError}
              </div>
            ) : !clientSecret ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  onSuccess={handleSuccess}
                />
              </Elements>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-24" data-testid="payment-summary">
            <h2 className="text-sm font-bold text-[#0F172A] mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4" data-testid="payment-items">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3" data-testid={`payment-item-${item.id}`}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] flex-shrink-0">
                    <img
                      src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/40/40`}
                      alt={item.products?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] truncate" data-testid={`payment-item-name-${item.id}`}>
                      {item.products?.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]" data-testid={`payment-item-qty-${item.id}`}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] flex-shrink-0" data-testid={`payment-item-subtotal-${item.id}`}>
                    ${(Number(item.products?.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 flex justify-between items-center">
              <span className="text-xs font-semibold text-[#64748B]">Total</span>
              <span className="text-lg font-bold text-[#0F172A]" data-testid="payment-total">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
