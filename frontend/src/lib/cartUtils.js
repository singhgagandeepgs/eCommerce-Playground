import { supabase } from './supabase'

const GUEST_CART_KEY = 'shopplay_guest_cart'

export function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function saveGuestCartItem(productId, quantity = 1) {
  const cart = getGuestCart()
  const existing = cart.find(item => item.product_id === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ product_id: productId, quantity })
  }
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart))
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY)
}

export async function mergeGuestCart(userId) {
  const guestItems = getGuestCart()
  if (!guestItems.length) return

  const { data: existingItems } = await supabase
    .from('cart_items')
    .select('id, product_id, quantity')
    .eq('user_id', userId)

  const existingMap = {}
  for (const item of existingItems ?? []) {
    existingMap[item.product_id] = item
  }

  for (const guestItem of guestItems) {
    const existing = existingMap[guestItem.product_id]
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + guestItem.quantity })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: guestItem.product_id, quantity: guestItem.quantity })
    }
  }

  clearGuestCart()
}
