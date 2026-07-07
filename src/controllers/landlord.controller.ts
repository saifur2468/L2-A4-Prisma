// import { Response, NextFunction } from 'express';
// import { AuthRequest } from '../middleware/auth';
// import { prisma } from '../config/prisma';
// import { sendResponse } from '../utils/sendResponse';


// export const createProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const { title, description, location, pricePerMonth, amenities, categoryId } = req.body;
//     const landlordId = req.user!.id;

//     const property = await prisma.property.create({
//       data: { title, description, location, pricePerMonth, amenities, categoryId, landlordId },
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


// export const deleteProperty = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const landlordId = req.user!.id;

//     const isOwnProperty = await prisma.property.findFirst({ where: { id, landlordId } });
//     if (!isOwnProperty) throw new Error('Unauthorized or Property not found!');

//     await prisma.property.delete({ where: { id } });

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: 'Property removed successfully!',
//       data: null,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// export const getLandlordRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const landlordId = req.user!.id;

//     const requests = await prisma.rentalRequest.findMany({
//       where: { property: { landlordId } },
//       include: { tenant: { select: { name: true, email: true } }, property: true },
//     });

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: 'Rental requests retrieved successfully!',
//       data: requests,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// export const handleRentalRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body; 
//     const landlordId = req.user!.id;

//     const request = await prisma.rentalRequest.findUnique({
//       where: { id },
//       include: { property: true },
//     });

//     if (!request || request.property.landlordId !== landlordId) {
//       throw new Error('Rental request not found or unauthorized!');
//     }

//     const updatedRequest = await prisma.rentalRequest.update({
//       where: { id },
//       data: { status },
//     });

//     sendResponse(res, {
//       statusCode: 200,
//       success: true,
//       message: `Rental request has been ${status.toLowerCase()}!`,
//       data: updatedRequest,
//     });
//   } catch (error) {
//     next(error);
//   }
// };