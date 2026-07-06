import { Request, Response, NextFunction } from 'express';
import  prisma  from '../config/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendResponse } from '../utils/sendResponse';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    const isUserExist = await prisma.user.findUnique({ where: { email } });
    if (isUserExist) throw new Error('User already exists with this email!');

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: name, email: true, role: true, createdAt: true }
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'User registered successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isBanned) throw new Error('Invalid email or password / User is Banned');

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) throw new Error('Invalid email or password!');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User logged in successfully!',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};