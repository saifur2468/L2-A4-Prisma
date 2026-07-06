import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendResponse } from '../utils/sendResponse';


export const getAllProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { location, priceRange, type, search } = req.query;

   
    const whereCondition: any = { isAvailable: true };

    if (location) {
      whereCondition.location = { contains: String(location), mode: 'insensitive' };
    }
    if (priceRange) {
      const [min, max] = String(priceRange).split('-').map(Number);
      whereCondition.pricePerMonth = { gte: min || 0, lte: max || 999999 };
    }
    if (type) {
      whereCondition.category = { name: { equals: String(type), mode: 'insensitive' } };
    }
    if (search) {
      whereCondition.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const properties = await prisma.property.findMany({
      where: whereCondition,
      include: { category: { select: { name: true } } },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Properties retrieved successfully!',
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};


export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        landlord: { select: { name: true, email: true } },
        reviews: { include: { tenant: { select: { name: true } } } },
      },
    });

    if (!property) throw new Error('Property not found!');

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Property details retrieved successfully!',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Categories retrieved successfully!',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};