import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


async function generateWithRetry(params: any, retries = 3, delayMs = 1500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
     
      if ((error?.status === 503 || error?.code === 503) && i < retries - 1) {
        console.log(`503 High demand encountered. Retrying in ${delayMs}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Failed to respond after multiple retries.');
}

export const handleChat = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    const systemInstruction = `
      You are "RentNest Assistant", an AI helper for RentNest real estate platform.
      Help users find properties, understand rental processes, rent payments, and landlord/tenant roles.
      Be polite, helpful, and concise.
    `;

    
    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: messages,
      config: { systemInstruction },
    });

    res.status(200).json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(error?.status || 500).json({
      success: false,
      message: error.message || 'Server is temporarily busy. Please try again in a few seconds.',
    });
  }
};