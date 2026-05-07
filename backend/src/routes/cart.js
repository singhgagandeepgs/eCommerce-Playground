import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController.js'

const router = Router()

router.use(requireAuth)

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:itemId', updateCartItem)
router.delete('/:itemId', removeFromCart)

export default router
