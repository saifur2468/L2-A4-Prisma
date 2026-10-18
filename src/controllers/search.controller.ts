import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const handleAISearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

   
    const properties = await prisma.property.findMany({
      
    });

    const systemInstruction = `
      You are an AI Real Estate Search Assistant for RentNest.
      Analyze the user's natural language search query and find the best matching properties from the provided database list based on location, budget, bedrooms, and tenant preference.
      Return clean, structured recommendations in a polite tone.
    `;

    const prompt = `
      User Search Query: "${query}"
      
      Available Properties in Database:
      ${JSON.stringify(properties)}
      
      Extract search intent and suggest the best matching properties.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { systemInstruction },
    });

    res.status(200).json({
      success: true,
      result: response.text,
    });
  } catch (error: any) {
    console.error('AI Search Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'AI Search failed',
    });
  }
};