import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    const systemInstruction = `
      You are "RentNest Assistant", an AI helper for RentNest real estate platform.
      Help users find properties, understand rental processes, rent payments, and landlord/tenant roles.
      Be polite, helpful, and concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: messages,
      config: {
        systemInstruction,
      },
    });

    res.status(200).json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate response',
    });
  }
};