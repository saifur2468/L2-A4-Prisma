import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../config/prisma';
import { sendResponse } from '../utils/sendResponse';


// export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const { title, description, location, pricePerMonth, amenities, categoryId } = req.body;
//     const landlordId = req.user!.id;

//     const property = await prisma.property.create({
//       data: { title, description, location, pricePerMonth: Number(pricePerMonth), amenities, categoryId, landlordId },
//     });

//     sendResponse(res, {
//       statusCode: 201,
//       success: true,
//       message: 'Property listed successfully!',
//       data: property,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, location, pricePerMonth, amenities, categoryId } = req.body;
    const landlordId = req.user!.id;

    
    let propertyImages: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      propertyImages = req.files.map((file: any) => file.path);
    } else if (req.body.imageUrl) {
      propertyImages = [req.body.imageUrl];
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        location,
        pricePerMonth: Number(pricePerMonth),
        amenities: Array.isArray(amenities) ? amenities : amenities.split(',').map((item: string) => item.trim()),
        categoryId,
        landlordId,
        images: propertyImages,
      },
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Property listed successfully with images!',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const getLandlordProperties = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user!.id;

    const properties = await prisma.property.findMany({
      where: { landlordId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Landlord properties retrieved successfully!',
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};


// export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const landlordId = req.user!.id;

//     const isOwnProperty = await prisma.property.findFirst({ where: { id, landlordId } });
//     if (!isOwnProperty) throw new Error('Unauthorized or Property not found!');

//     const updatedProperty = await prisma.property.update({
//       where: { id },
//       data: req.body,
//     });

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: 'Property updated successfully!',
//       data: updatedProperty,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const updateProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const landlordId = req.user!.id;

    const isOwnProperty = await prisma.property.findFirst({ where: { id, landlordId } });
    if (!isOwnProperty) throw new Error('Unauthorized or Property not found!');

    
    const { title, description, location, price, pricePerMonth, amenities, categoryId } = req.body;

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title,
        description,
        location,
        pricePerMonth: pricePerMonth ? Number(pricePerMonth) : price ? Number(price) : undefined,
        amenities,
        categoryId,
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Property updated successfully!',
      data: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const landlordId = req.user!.id;

    const isOwnProperty = await prisma.property.findFirst({ where: { id, landlordId } });
    if (!isOwnProperty) throw new Error('Unauthorized or Property not found!');

    await prisma.property.delete({ where: { id } });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Property removed successfully!',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};


export const getLandlordRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const landlordId = req.user!.id;

    const requests = await prisma.rentalRequest.findMany({
      where: {
        property: {
          landlordId,
        },
      },
      include: {
        tenant: {
          select: { id: true, name: true, email: true },
        },
        property: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Rental requests retrieved successfully!',
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// ৬. রিকোয়েস্ট Approve বা Reject করা
export const handleRentalRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 
    const landlordId = req.user!.id;

    const request = await prisma.rentalRequest.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!request || request.property.landlordId !== landlordId) {
      throw new Error('Rental request not found or unauthorized!');
    }

    const updatedRequest = await prisma.rentalRequest.update({
      where: { id },
      data: { status },
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: `Rental request has been ${status.toLowerCase()}!`,
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};