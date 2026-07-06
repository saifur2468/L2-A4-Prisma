import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controllers';
import { createPaymentIntent, confirmPayment } from '../controllers/payment.controllers';
import { authGuard, checkRole } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

// Payment Routes
router.post('/payments/create', authGuard, checkRole('TENANT'), createPaymentIntent);
router.post('/payments/confirm', authGuard, checkRole('TENANT'), confirmPayment);

export default router;