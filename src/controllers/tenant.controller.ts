import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { sendResponse } from '../utils/sendResponse';


export const submitRentalRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    const tenantId = req.user!.id;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || !property.isAvailable) throw new Error('Property is not available for rent!');

    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        tenantId,
        propertyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Rental request submitted successfully!',
      data: rentalRequest,
    });
  } catch (error) {
    next(error);
  }
};


export const getMyRentalRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.id;
    const rentals = await prisma.rentalRequest.findMany({
      where: { tenantId },
      include: { property: true },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Your rental history retrieved successfully!',
      data: rentals,
    });
  } catch (error) {
    next(error);
  }
};


export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const tenantId = req.user!.id;

  
    const hasRented = await prisma.rentalRequest.findFirst({
      where: { propertyId, tenantId, status: { in: ['ACTIVE', 'COMPLETED'] } },
    });

    if (!hasRented) throw new Error('You can only review properties after an approved & paid stay!');

    const review = await prisma.review.create({
      data: { tenantId, propertyId, rating: Number(rating), comment },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Review posted successfully!',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};