import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { supabase } from '../config/supabase.js'

const router = Router()

/**
 * POST /api/test-reset
 *
 * Wipes cart_items + all orders (and their order_items) for the
 * authenticated user. Intended for resetting state between mabl
 * automation test runs — never call this in production flows.
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id

    // Fetch order IDs first so we can delete order_items explicitly
    // (avoids relying solely on the ON DELETE CASCADE in case it isn't set)
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)

    if (fetchError) throw fetchError

    if (orders?.length) {
      const orderIds = orders.map(o => o.id)

      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .in('order_id', orderIds)

      if (itemsError) throw itemsError

      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('user_id', userId)

      if (ordersError) throw ordersError
    }

    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)

    if (cartError) throw cartError

    res.json({
      ok: true,
      userId,
      cleared: {
        orders: orders?.length ?? 0,
        cart_items: true,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
