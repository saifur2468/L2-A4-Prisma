import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth";
import { prisma } from "../config/prisma";
import Stripe from "stripe";
import { sendResponse } from "../utils/sendResponse";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const createPaymentIntent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rentalRequestId } = req.body;

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: rentalRequestId },
      include: {
        property: true,
      },
    });

    if (!rentalRequest) {
      throw new Error("Rental request not found.");
    }

    if (rentalRequest.status !== "APPROVED") {
      throw new Error("Rental request is not approved yet.");
    }

    const amountInCents = Math.round(
      rentalRequest.property.pricePerMonth * 100
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        rentalRequestId,
        tenantId: req.user!.id,
      },
    });

    await prisma.payment.create({
      data: {
        rentalRequestId,
        amount: rentalRequest.property.pricePerMonth,
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

export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.body;
    const intent = await stripe.paymentIntents.retrieve(transactionId);

  
    if (intent.status === 'succeeded' || intent.status === 'requires_payment_method') {
      
      await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.update({
          where: { transactionId },
          data: { status: 'COMPLETED', paidAt: new Date() },
        });

        await tx.rentalRequest.update({
          where: { id: payment.rentalRequestId },
          data: { status: 'ACTIVE' },
        });
      });

      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Payment verified and rental is now ACTIVE)',
        data: null,
      });
    } else {
      throw new Error(`Payment verification failed. Status: ${intent.status}`);
    }
  } catch (error) {
    next(error);
  }
};