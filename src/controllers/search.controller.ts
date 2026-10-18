import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const handleAISearch = async (req: Request, res: Response) => {
  try {
    const { query, properties } = req.body;

    const systemInstruction = `
      You are an AI Real Estate Search Assistant for RentNest.
      You will receive a user query (e.g., "Mirpur 10 under 10000 tk for bachelors") and a list of available properties in JSON format.
      Your task is to analyze the user's natural language request and filter/return matching property IDs or detailed recommendations based on location, budget, bedrooms, and tenant preference.
    `;

    const prompt = `
      User Search Query: "${query}"
      Available Properties Data: ${JSON.stringify(properties || [])}
      
      Extract search intent (location, priceRange, bedrooms, targetTenant) and suggest matching properties.
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