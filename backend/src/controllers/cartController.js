import { supabase } from '../config/supabase.js'

export async function getCart(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function addToCart(req, res, next) {
  try {
    const { product_id, quantity = 1 } = req.body
    if (!product_id) return res.status(400).json({ error: 'product_id is required' })
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' })
    }

    // Merge into existing row if present (unique constraint on user_id + product_id)
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.user.id)
      .eq('product_id', product_id)
      .maybeSingle()

    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select('*, products(*)')
        .single()
      if (error) throw error
      return res.json(data)
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: req.user.id, product_id, quantity })
      .select('*, products(*)')
      .single()
    if (error) throw error
    res.status(201).json(data)
  } catch (err) {
    next(err)
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body
    if (quantity === undefined) return res.status(400).json({ error: 'quantity is required' })
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' })
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', req.params.itemId)
      .eq('user_id', req.user.id)   // scoped to owner
      .select('*, products(*)')
      .maybeSingle()

    if (error) throw error
    if (!data) return res.status(404).json({ error: 'Cart item not found' })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function removeFromCart(req, res, next) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', req.params.itemId)
      .eq('user_id', req.user.id)   // scoped to owner

    if (error) throw error
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
