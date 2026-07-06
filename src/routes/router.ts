import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controllers';
import { createPaymentIntent, confirmPayment } from '../controllers/payment.controllers';
import { authGuard, checkRole } from '../middleware/auth';

import {
  getAllUsers,
  toggleUserStatus,
  getAllPropertiesForAdmin,
  getAllRentalsForAdmin,
} from '../controllers/admin.controller';

const router = Router();


router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);


router.post('/payments/create', authGuard, checkRole('TENANT'), createPaymentIntent);
router.post('/payments/confirm', authGuard, checkRole('TENANT'), confirmPayment);

router.get('/admin/users', authGuard, checkRole('ADMIN'), getAllUsers);
router.patch('/admin/users/:id', authGuard, checkRole('ADMIN'), toggleUserStatus);
router.get('/admin/properties', authGuard, checkRole('ADMIN'), getAllPropertiesForAdmin);
router.get('/admin/rentals', authGuard, checkRole('ADMIN'), getAllRentalsForAdmin);

export default router;