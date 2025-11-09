import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '~/env';

/**
 * ElevenLabs Speech-to-Text API Route
 * 
 * Converts audio to text using ElevenLabs API.
 * Accepts audio file upload via FormData.
 * 
 * @see https://docs.elevenlabs.io/api-reference/speech-to-text
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
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

    // Convert File to Buffer for ElevenLabs API
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create FormData for ElevenLabs API
    const elevenLabsFormData = new FormData();
    const blob = new Blob([buffer], { type: audioFile.type || 'audio/webm' });
    elevenLabsFormData.append('file', blob, audioFile.name || 'audio.webm');
    elevenLabsFormData.append('model_id', 'scribe_v1'); // Required by ElevenLabs API

    // Send to ElevenLabs Speech-to-Text API
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        // Don't set Content-Type - browser will set it with boundary for FormData
      },
      body: elevenLabsFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs STT API error:', error);
      return NextResponse.json(
        { error: `ElevenLabs API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json() as { text: string };
    return NextResponse.json({ text: data.text || '' });
  } catch (error) {
    console.error('Error in speech-to-text:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
