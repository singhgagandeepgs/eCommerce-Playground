import { supabase } from '../config/supabase.js'

export async function placeOrder(req, res, next) {
  try {
    const userId = req.user.id

    const { data: cartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', userId)

    if (cartError) throw cartError
    if (!cartItems?.length) return res.status(400).json({ error: 'Cart is empty' })

    // Verify all referenced products still exist and have stock
    const missingProduct = cartItems.find(item => !item.products)
    if (missingProduct) {
      return res.status(422).json({ error: 'One or more products are no longer available' })
    }

    const total_amount = cartItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.products.price),
      0
    )

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id: userId, status: 'pending', total_amount })
      .select()
      .single()

    if (orderError) throw orderError

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

    await supabase.from('cart_items').delete().eq('user_id', userId)

    const { data: items } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', order.id)

    res.status(201).json({ ...order, items })
  } catch (err) {
    next(err)
  }
}

export async function listOrders(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function getOrder(req, res, next) {
  try {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)   // scoped to owner
      .maybeSingle()

    if (orderError) throw orderError
    if (!order) return res.status(404).json({ error: 'Order not found' })

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*, products(*)')
      .eq('order_id', req.params.id)

    if (itemsError) throw itemsError
    res.json({ ...order, items })
  } catch (err) {
    next(err)
  }
}
