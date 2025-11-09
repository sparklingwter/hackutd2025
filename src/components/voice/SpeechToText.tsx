"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SpeechToText({
  onTranscript,
  onError,
  placeholder = "Press the microphone to speak...",
  disabled = false,
  className = "",
}: SpeechToTextProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setInterimTranscript("Listening...");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onError?.("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      setInterimTranscript("Processing...");
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/elevenlabs/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = (await response.json()) as { text?: string; error?: string };
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.text) {
        setTranscript(data.text);
        setInterimTranscript("");
        onTranscript(data.text);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      setInterimTranscript("");
      onError?.(
        error instanceof Error
          ? error.message
          : "Failed to transcribe audio. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Text Display */}
      <div className="mb-3 p-4 min-h-20 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg">
        {transcript ? (
          <p className="text-gray-900 dark:text-white">{transcript}</p>
        ) : interimTranscript ? (
          <p className="text-gray-500 dark:text-gray-400 italic">{interimTranscript}</p>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 italic">{placeholder}</p>
        )}
      </div>

      {/* Recording Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggleRecording}
          disabled={disabled || isProcessing}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-blue-600 hover:bg-blue-700"
          } ${
            disabled || isProcessing
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-105"
          } text-white shadow-lg`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : isRecording ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start Recording</span>
            </>
          )}
        </button>

        {transcript && (
          <button
            onClick={() => {
              setTranscript("");
              setInterimTranscript("");
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
