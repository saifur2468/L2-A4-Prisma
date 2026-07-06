import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { sendResponse } from '../utils/sendResponse';


export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All users retrieved successfully!',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};


export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;


    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found!');
    if (user.role === 'ADMIN') throw new Error('You cannot ban an Admin!');

   
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBanned: !user.isBanned },
      select: { id: true, name: true, email: true, isBanned: true },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `User has been ${updatedUser.isBanned ? 'banned' : 'unbanned'} successfully!`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllPropertiesForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        landlord: { select: { name: true, email: true } },
        category: { select: { name: true } },
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All properties retrieved for Admin successfully!',
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};


export const getAllRentalsForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rentals = await prisma.rentalRequest.findMany({
      include: {
        tenant: { select: { name: true, email: true } },
        property: { select: { title: true, pricePerMonth: true } },
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'All rental requests retrieved for Admin successfully!',
      data: rentals,
    });
  } catch (error) {
    next(error);
  }
};