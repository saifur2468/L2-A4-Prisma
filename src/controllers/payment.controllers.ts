// import { Response, NextFunction } from "express";
// import { AuthRequest } from "../middleware/auth";
// import { prisma } from "../config/prisma";
// import Stripe from "stripe";
// import { sendResponse } from "../utils/sendResponse";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// export const createPaymentIntent = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { rentalRequestId } = req.body;

//     const rentalRequest = await prisma.rentalRequest.findUnique({
//       where: { id: rentalRequestId },
//       include: {
//         property: true,
//       },
//     });

//     if (!rentalRequest) {
//       throw new Error("Rental request not found.");
//     }

//     if (rentalRequest.status !== "APPROVED") {
//       throw new Error("Rental request is not approved yet.");
//     }

//     const amountInCents = Math.round(
//       rentalRequest.property.pricePerMonth * 100
//     );

//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amountInCents,
//       currency: "usd",
//       metadata: {
//         rentalRequestId,
//         tenantId: req.user!.id,
//       },
//     });

//     await prisma.payment.create({
//       data: {
//         rentalRequestId,
//         amount: rentalRequest.property.pricePerMonth,
//         transactionId: paymentIntent.id,
//         method: "STRIPE",
//         status: "PENDING",
//       },
//     });

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Payment Intent created successfully.",
//       data: {
//         clientSecret: paymentIntent.client_secret,
//         transactionId: paymentIntent.id,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const { transactionId } = req.body;
//     const intent = await stripe.paymentIntents.retrieve(transactionId);

  
//     if (intent.status === 'succeeded' || intent.status === 'requires_payment_method') {
      
//       await prisma.$transaction(async (tx) => {
//         const payment = await tx.payment.update({
//           where: { transactionId },
//           data: { status: 'COMPLETED', paidAt: new Date() },
//         });

//         await tx.rentalRequest.update({
//           where: { id: payment.rentalRequestId },
//           data: { status: 'ACTIVE' },
//         });
//       });

//       sendResponse(res, {
//         statusCode: 200,
//         success: true,
//         message: 'Payment verified and rental is now ACTIVE)',
//         data: null,
//       });
//     } else {
//       throw new Error(`Payment verification failed. Status: ${intent.status}`);
//     }
//   } catch (error) {
//     next(error);
//   }
// };


















import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";
import Stripe from "stripe";
import { sendResponse } from "../utils/sendResponse";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ==========================================
// CREATE PAYMENT INTENT
// ==========================================

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rentalRequestId } = req.body;

    if (!rentalRequestId) {
      throw new Error("Rental request ID is required.");
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: {
        id: rentalRequestId,
      },
      include: {
        property: true,
      },
    });

    if (!rentalRequest) {
      throw new Error("Rental request not found.");
    }

    // Make sure current user owns this rental request
    if (rentalRequest.tenantId !== req.user!.id) {
      throw new Error("You are not authorized for this rental request.");
    }

    if (rentalRequest.status !== "APPROVED") {
      throw new Error("Rental request is not approved yet.");
    }

    const amountInCents = Math.round(
      Number(rentalRequest.property.pricePerMonth) * 100
    );

    if (amountInCents <= 0) {
      throw new Error("Invalid payment amount.");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",

      metadata: {
        rentalRequestId,
        tenantId: req.user!.id,
      },
    });

    // Save payment as PENDING
    await prisma.payment.create({
      data: {
        rentalRequestId,
        amount: Number(rentalRequest.property.pricePerMonth),
        transactionId: paymentIntent.id,
        method: "STRIPE",
        status: "PENDING",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment Intent created successfully.",
      data: {
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CONFIRM PAYMENT
// ==========================================

// export const confirmPayment = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { transactionId } = req.body;

//     if (!transactionId) {
//       throw new Error("Transaction ID is required.");
//     }

//     // Retrieve Stripe payment
//     const intent = await stripe.paymentIntents.retrieve(transactionId);

//     // ONLY succeeded is a successful payment
//     if (intent.status !== "succeeded") {
//       throw new Error(
//         `Payment verification failed. Status: ${intent.status}`
//       );
//     }

//     await prisma.$transaction(async (tx) => {
//       // Find payment first
//       const payment = await tx.payment.findUnique({
//         where: {
//           transactionId,
//         },
//         include: {
//           rentalRequest: true,
//         },
//       });

//       if (!payment) {
//         throw new Error("Payment record not found.");
//       }

//       // Make sure this payment belongs to logged-in tenant
//       if (payment.rentalRequest.tenantId !== req.user!.id) {
//         throw new Error("You are not authorized for this payment.");
//       }

//       // Update payment
//       await tx.payment.update({
//         where: {
//           transactionId,
//         },
//         data: {
//           status: "COMPLETED",
//           paidAt: new Date(),
//         },
//       });

//       // Activate rental
//       await tx.rentalRequest.update({
//         where: {
//           id: payment.rentalRequestId,
//         },
//         data: {
//           status: "ACTIVE",
//         },
//       });
//     });

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: "Payment verified and rental is now ACTIVE.",
//       data: {
//         transactionId,
//         status: "COMPLETED",
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const confirmPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      throw new Error("Transaction ID is required.");
    }

    // Retrieve Stripe payment
    const intent = await stripe.paymentIntents.retrieve(transactionId);

    if (intent.status !== "succeeded") {
      throw new Error(
        `Payment verification failed. Status: ${intent.status}`
      );
    }

    await prisma.$transaction(
      async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { transactionId },
          include: { rentalRequest: true },
        });

        if (!payment) {
          throw new Error("Payment record not found.");
        }

        if (payment.rentalRequest.tenantId !== req.user!.id) {
          throw new Error("You are not authorized for this payment.");
        }

       
        if (payment.status === "COMPLETED") {
          return;
        }

        await tx.payment.update({
          where: { transactionId },
          data: { status: "COMPLETED", paidAt: new Date() },
        });

        await tx.rentalRequest.update({
          where: { id: payment.rentalRequestId },
          data: { status: "ACTIVE" },
        });
      },
      {
        maxWait: 10000, 
        timeout: 15000, 
      }
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment verified and rental is now ACTIVE.",
      data: {
        transactionId,
        status: "COMPLETED",
      },
    });
  } catch (error) {
    next(error);
  }
};
// ==========================================
// GET PAYMENT HISTORY
// ==========================================

export const getPaymentHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.user!.id;

    const payments = await prisma.payment.findMany({
      where: {
        rentalRequest: {
          tenantId,
        },
        status: "COMPLETED",
      },

      include: {
        rentalRequest: {
          include: {
            property: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment history retrieved successfully.",
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};



