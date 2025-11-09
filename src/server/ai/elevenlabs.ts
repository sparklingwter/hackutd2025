/**
 * ElevenLabs Voice Integration
 * 
 * Server-side helpers for text-to-speech and speech-to-text using ElevenLabs API.
 */

import { env } from '~/env';

/**
 * Available ElevenLabs voices
 */
export const VOICES = {
  RACHEL: '21m00Tcm4TlvDq8ikWAM', // Professional Female (default)
  ADAM: 'pNInz6obpgDQGcFmaJgB', // Professional Male
  ANTONI: 'ErXwobaYiN019PkySvjV', // Well-rounded Male
  BELLA: 'EXAVITQu4vr4xnSDxMaL', // Soft Female
  DOMI: 'AZnzlk1XvdvUeBnXmlld', // Strong Male
} as const;

export interface TTSOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export interface STTOptions {
  audioFile: File | Blob;
  modelId?: string;
}

/**
 * Convert text to speech using ElevenLabs API
 * 
 * @param options - TTS options
 * @returns Audio buffer as MP3
 */
export async function textToSpeech(options: TTSOptions): Promise<ArrayBuffer> {
  const {
    text,
    voiceId = VOICES.RACHEL,
    modelId = 'eleven_turbo_v2_5',
    stability = 0.5,
    similarityBoost = 0.75,
  } = options;

  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS API error: ${error}`);
  }

  return response.arrayBuffer();
}

/**
 * Convert speech to text using ElevenLabs API
 * 
 * @param options - STT options
 * @returns Transcribed text
 */
export async function speechToText(options: STTOptions): Promise<string> {
  const { audioFile, modelId = 'scribe_v1' } = options;

  const apiKey = env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  // Create FormData for audio upload
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model_id', modelId);

  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs STT API error: ${error}`);
  }

  const data = await response.json() as { text: string };
  return data.text;
}

/**
 * Generate audio summary for vehicle recommendations
 * 
 * @param text - Summary text to convert to speech
 * @param useCache - Whether to check cache first (default: true)
 * @returns Audio buffer
 */
export async function generateRecommendationSummary(
  text: string,
  _useCache = true
): Promise<ArrayBuffer> {
  // TODO: Implement Firebase Storage caching
  // For now, just generate fresh audio
  return textToSpeech({ text });
}
