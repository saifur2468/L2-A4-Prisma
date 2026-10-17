import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    
    const systemInstruction = `
      You are "RentNest Assistant", an AI helper for RentNest real estate platform.
      Help users find properties, understand rental processes, rent payments, and landlord/tenant roles.
      Be polite, helpful, and concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
        systemInstruction,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}