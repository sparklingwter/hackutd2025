import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '~/env';

/**
 * ElevenLabs Text-to-Speech API Route
 * 
 * Converts text to speech using ElevenLabs API.
 * Returns audio as MP3 stream.
 * 
 * @see https://docs.elevenlabs.io/api-reference/text-to-speech
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      voice_id = '21m00Tcm4TlvDq8ikWAM', // Rachel - Professional Female (default)
      model_id = 'eleven_turbo_v2_5', // Fastest model
      stability = 0.5,
      similarity_boost = 0.75
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // Get ElevenLabs API key from environment
    const apiKey = env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ELEVENLABS_API_KEY not configured' },
        { status: 500 }
      );
    }

    // Send to ElevenLabs Text-to-Speech API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings: {
            stability,
            similarity_boost,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs TTS API error:', error);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${error}` },
        { status: response.status }
      );
    }

    // Get audio data as blob
    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();

    // Return audio as MP3
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="speech.mp3"',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
