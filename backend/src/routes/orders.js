import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { placeOrder, listOrders, getOrder } from '../controllers/ordersController.js'

const router = Router()

router.use(requireAuth)

router.post('/', placeOrder)
router.get('/', listOrders)
router.get('/:id', getOrder)

export default router
