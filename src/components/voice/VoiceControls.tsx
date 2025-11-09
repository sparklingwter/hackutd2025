"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Info } from "lucide-react";
import { DISCLAIMERS } from "~/config/disclaimers";

interface VoiceControlsProps {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  showDisclosure?: boolean;
}

export function VoiceControls({
  onTranscript,
  onError,
  disabled = false,
  className = "",
  showDisclosure = false,
}: VoiceControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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
        onTranscript?.(data.text);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      onError?.(
        error instanceof Error
          ? error.message
          : "Failed to transcribe audio. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Voice Synthesis Disclosure */}
      {showDisclosure && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{DISCLAIMERS.voiceSynthesis}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || isProcessing}
          className={`p-4 rounded-full transition-all shadow-lg ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 animate-pulse"
              : "bg-blue-600 hover:bg-blue-700"
          } ${
            disabled || isProcessing
              ? "opacity-50 cursor-not-allowed"
              : "hover:scale-110"
          } text-white`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* Mute Toggle */}
        <button
          onClick={toggleMute}
          disabled={disabled}
          className={`p-3 rounded-full transition-all ${
            isMuted
              ? "bg-gray-400 hover:bg-gray-500"
              : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        {/* Status Text */}
        {isRecording && (
          <span className="text-sm text-red-600 dark:text-red-400 font-medium">
            Recording...
          </span>
        )}
        {isProcessing && (
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Processing...
          </span>
        )}
      </div>
    </div>
  );
}
