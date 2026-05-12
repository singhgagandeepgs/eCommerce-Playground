import Stripe from 'stripe'
import { supabase } from '../config/supabase.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function createIntent(req, res, next) {
  try {
    const { amount, currency = 'usd' } = req.body
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(amount)), // already in cents from client
      currency,
      metadata: { userId: req.user.id },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    next(err)
  }
}

export async function confirmPayment(req, res, next) {
  try {
    const { paymentIntentId } = req.body
    const userId = req.user.id

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'paymentIntentId is required' })
    }

    // Verify with Stripe that this payment actually succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: `Payment not completed. Status: ${paymentIntent.status}`,
      })
    }

    // Guard: payment intent must belong to this user
    if (paymentIntent.metadata.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Idempotency guard: don't create a duplicate order for the same intent
    const { data: existing } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntentId)
      .maybeSingle()

    if (existing) {
      return res.status(200).json({ orderId: existing.id })
    }

    // Fetch current cart
    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId)

    if (cartError) throw cartError
    if (!cartItems?.length) return res.status(400).json({ error: 'Cart is empty' })

    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.products.price),
      0
    )

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'pending',
        total_amount,
        payment_intent_id: paymentIntentId,
        payment_status: 'paid',
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(
        cartItems.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: Number(item.products.price),
        }))
      )

    if (itemsError) throw itemsError

    // Clear cart
    await supabase.from('cart_items').delete().eq('user_id', userId)

    res.status(201).json({ orderId: order.id })
  } catch (err) {
    next(err)
  }
}
