import { Router } from "express";

import {
  registerUser,
  loginUser,
} from "../controllers/auth.controllers";

import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
} from "../controllers/payment.controllers";

import {
  authGuard,
  checkRole,
} from "../middleware/auth";

import {
  getAllProperties,
  getPropertyById,
  getAllCategories,
} from "../controllers/property.controllers";

import {
  createProperty,
  getLandlordProperties,
  updateProperty,
  deleteProperty,
  getLandlordRequests,
  handleRentalRequest,
} from "../controllers/landlord.controller";

import {
  submitRentalRequest,
  getMyRentalRequests,
  createReview,
} from "../controllers/tenant.controller";

import {
  getAllUsers,
  toggleUserStatus,
  getAllPropertiesForAdmin,
  getAllRentalsForAdmin,
} from "../controllers/admin.controller";

const router = Router();

// ==========================================
// PUBLIC
// ==========================================

router.get("/properties", getAllProperties);

router.get("/properties/:id", getPropertyById);

router.get("/categories", getAllCategories);

// ==========================================
// AUTH
// ==========================================

router.post("/auth/register", registerUser);

router.post("/auth/login", loginUser);

// ==========================================
// TENANT
// ==========================================

router.post(
  "/rentals",
  authGuard,
  checkRole("TENANT"),
  submitRentalRequest
);

router.get(
  "/rentals",
  authGuard,
  checkRole("TENANT"),
  getMyRentalRequests
);

router.post(
  "/reviews",
  authGuard,
  checkRole("TENANT"),
  createReview
);

// ==========================================
// LANDLORD
// ==========================================

router.get(
  "/landlord/properties",
  authGuard,
  checkRole("LANDLORD"),
  getLandlordProperties
);

router.post(
  "/landlord/properties",
  authGuard,
  checkRole("LANDLORD"),
  createProperty
);

router.put(
  "/landlord/properties/:id",
  authGuard,
  checkRole("LANDLORD"),
  updateProperty
);

router.delete(
  "/landlord/properties/:id",
  authGuard,
  checkRole("LANDLORD"),
  deleteProperty
);

router.get(
  "/landlord/requests",
  authGuard,
  checkRole("LANDLORD"),
  getLandlordRequests
);

router.patch(
  "/landlord/requests/:id",
  authGuard,
  checkRole("LANDLORD"),
  handleRentalRequest
);

// ==========================================
// PAYMENTS
// ==========================================

router.post(
  "/payments/create",
  authGuard,
  checkRole("TENANT"),
  createPaymentIntent
);

// router.post(
//   "/payments/confirm",
//   authGuard,
//   checkRole("TENANT"),
//   confirmPayment
// );
router.post(
  "/payments/confirm/:transactionId", 
  authGuard,
  checkRole("TENANT"),
  confirmPayment
);

router.get(
  "/payments/history",
  authGuard,
  checkRole("TENANT"),
  getPaymentHistory
);

// ==========================================
// ADMIN
// ==========================================

router.get(
  "/admin/users",
  authGuard,
  checkRole("ADMIN"),
  getAllUsers
);

router.patch(
  "/admin/users/:id",
  authGuard,
  checkRole("ADMIN"),
  toggleUserStatus
);

router.get(
  "/admin/properties",
  authGuard,
  checkRole("ADMIN"),
  getAllPropertiesForAdmin
);

router.get(
  "/admin/rentals",
  authGuard,
  checkRole("ADMIN"),
  getAllRentalsForAdmin
);



export default router;