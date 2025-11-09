import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '~/env';

/**
 * Gemini Chat API Route
 * 
 * Provides AI-powered chat using Google Gemini API.
 * Uses direct REST API calls (no SDK dependency required).
 * 
 * @see https://ai.google.dev/api/rest/v1/models/generateContent
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  temperature?: number;
  model?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequest;
    const { 
      messages, 
      temperature = 0.7,
      model = 'gemini-2.0-flash-exp' // Latest and fastest model
    } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Get Gemini API key from environment
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Convert messages to Gemini format
    // Gemini expects alternating user/model messages
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Call Gemini API directly via REST
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return NextResponse.json(
        { error: `Gemini API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json() as {
      candidates: Array<{
        content: {
          parts: Array<{ text: string }>;
        };
      }>;
    };

    // Extract the response text
    const responseText = data.candidates[0]?.content?.parts[0]?.text ?? '';

    return NextResponse.json({
      message: responseText,
      role: 'assistant',
    });
  } catch (error) {
    console.error('Error in Gemini chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
