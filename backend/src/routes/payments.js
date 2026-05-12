import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { createIntent, confirmPayment } from '../controllers/paymentsController.js'

const router = Router()

router.use(requireAuth)

router.post('/create-intent', createIntent)
router.post('/confirm', confirmPayment)

export default router
