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
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
}

const TEST_CARDS = [
  { icon: '✅', label: 'Success', number: '4242 4242 4242 4242' },
  { icon: '❌', label: 'Declined', number: '4000 0000 0000 0002' },
  { icon: '❌', label: 'Insufficient funds', number: '4000 0000 0000 9995' },
  { icon: '🔐', label: '3D Secure', number: '4000 0027 6000 3184' },
]

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? ''
}

// Inner form — must be inside <Elements>
function CheckoutForm({ clientSecret, cartItems, cartTotal, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useAuth()
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

    // Ask backend to verify + create order
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
    } catch (err) {
      setError('Network error confirming order. Contact support.')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="payment-form">

      {/* Billing name */}
      <div>
        <label htmlFor="billing-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name on card
        </label>
        <input
          id="billing-name"
          type="text"
          value={billingName}
          onChange={e => setBillingName(e.target.value)}
          placeholder="Jane Smith"
          required
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          data-testid="billing-name-input"
        />
      </div>

      {/* Stripe Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card details
        </label>
        <div
          className="border border-gray-200 rounded-lg px-3 py-3 focus-within:ring-2 focus-within:ring-indigo-500"
          data-testid="card-element-wrapper"
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" data-testid="payment-error">
          {error}
        </p>
      )}

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || paying || !clientSecret}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
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
          `Pay $${cartTotal.toFixed(2)}`
        )}
      </button>

      {/* Test cards collapsible */}
      <div className="border border-gray-100 rounded-lg overflow-hidden" data-testid="test-cards-section">
        <button
          type="button"
          onClick={() => setTestCardsOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          data-testid="test-cards-toggle"
          aria-expanded={testCardsOpen}
        >
          <span>Test Cards</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${testCardsOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {testCardsOpen && (
          <div className="px-4 py-3 space-y-2 bg-white" data-testid="test-cards-list">
            <p className="text-xs text-gray-400 mb-2">Use any future expiry and any 3-digit CVC.</p>
            {TEST_CARDS.map(card => (
              <div key={card.number} className="flex items-center justify-between text-sm" data-testid={`test-card-${card.label.replace(/\s+/g, '-').toLowerCase()}`}>
                <span className="text-gray-600">
                  <span className="mr-1.5">{card.icon}</span>
                  {card.label}
                </span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 tracking-wider">
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
            body: JSON.stringify({
              amount: Math.round(cartTotal * 100), // cents
              currency: 'usd',
            }),
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
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-full lg:w-72">
            <div className="bg-white rounded-xl shadow-sm p-6 h-64" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10" data-testid="payment-page">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Payment form */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-6" data-testid="payment-card">
            <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Payment Details
            </h2>

            {intentError ? (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" data-testid="intent-error">
                {intentError}
              </p>
            ) : !clientSecret ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
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
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24" data-testid="payment-summary">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4" data-testid="payment-items">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-3" data-testid={`payment-item-${item.id}`}>
                  <img
                    src={item.products?.image_url || `https://picsum.photos/seed/${item.product_id}/40/40`}
                    alt={item.products?.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" data-testid={`payment-item-name-${item.id}`}>
                      {item.products?.name}
                    </p>
                    <p className="text-xs text-gray-400" data-testid={`payment-item-qty-${item.id}`}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0" data-testid={`payment-item-subtotal-${item.id}`}>
                    ${(Number(item.products?.price ?? 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-gray-900 text-lg">
              <span>Total</span>
              <span data-testid="payment-total">${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
