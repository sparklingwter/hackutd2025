'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playedMessagesRef = useRef<Set<string>>(new Set());

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) {
      setInput('');
    }
    setIsLoading(true);

    try {
      // Call Python backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Auto-play audio if enabled
      if (isAudioEnabled) {
        speakText(data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your message. Please make sure the Python backend server is running on http://localhost:8000',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Microphone recording functionality
  const startRecording = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone access granted');
      
      // Try to find a supported MIME type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk received, size:', event.data.size);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        console.log('Audio blob created, size:', audioBlob.size);
        await sendAudioToText(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        setIsMicrophoneEnabled(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('Error during recording. Please try again.');
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
      setIsMicrophoneEnabled(false);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          alert('Microphone permission denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          alert('No microphone found. Please connect a microphone and try again.');
        } else {
          alert(`Could not access microphone: ${error.message}`);
        }
      } else {
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToText = async (audioBlob: Blob) => {
    try {
      console.log('Sending audio to speech-to-text API, size:', audioBlob.size);
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');

      const response = await fetch('/api/elevenlabs/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Speech-to-text API error:', errorData);
        throw new Error(errorData.error || `Speech-to-text failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Speech-to-text response:', data);
      
      if (data.text && data.text.trim()) {
        console.log('Transcribed text:', data.text);
        // Send the transcribed message directly
        await sendMessage(data.text.trim());
      } else {
        console.error('No text received from speech-to-text');
        alert('Could not transcribe audio. The audio might be too short or unclear. Please try again.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error transcribing audio. Please try again.';
      alert(errorMessage);
    }
  };

  const toggleMicrophone = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      stopRecording();
    } else {
      // Start recording
      await startRecording();
    }
  };

  // Text-to-speech functionality
  const speakText = async (text: string) => {
    if (!isAudioEnabled || !text.trim()) {
      console.log('Audio disabled or no text to speak');
      return;
    }

    try {
      console.log('Requesting text-to-speech for:', text.substring(0, 50) + '...');
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await fetch('/api/elevenlabs/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Text-to-speech API error:', errorData);
        throw new Error(errorData.error || `Text-to-speech failed with status ${response.status}`);
      }

      const audioBlob = await response.blob();
      console.log('Audio blob received, size:', audioBlob.size);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Create audio element and play
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Handle errors during playback
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      // Clean up URL after playback
      audio.onended = () => {
        console.log('Audio playback finished');
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
      };
      
      await audio.play();
      console.log('Audio playback started');
    } catch (error) {
      console.error('Error playing audio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error playing audio. Please try again.';
      // Don't show alert for audio errors, just log them
      console.error(errorMessage);
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  // Auto-play audio for assistant messages if enabled
  useEffect(() => {
    if (isAudioEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        // Only play if this is a new message (not already played)
        const messageId = `${lastMessage.role}-${lastMessage.content}-${messages.length}`;
        
        if (!playedMessagesRef.current.has(messageId)) {
          playedMessagesRef.current.add(messageId);
          // Use setTimeout to avoid calling speakText during render
          setTimeout(() => {
            speakText(lastMessage.content);
          }, 100);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isAudioEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto bg-white/10 rounded-lg p-4">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            Start a conversation with the Gemini agent...
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-[hsl(280,100%,70%)] text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                <div className="text-sm font-semibold mb-1">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/20 text-white rounded-lg px-4 py-2">
              <div className="text-sm font-semibold mb-1">Assistant</div>
              <div className="flex space-x-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-[hsl(280,100%,70%)] disabled:opacity-50"
        />
        
        {/* Microphone button */}
        <div className="relative group">
          <button
            onClick={toggleMicrophone}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Talk to Yota"
          >
            <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
          </button>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            Talk to Yota
          </div>
        </div>

        {/* Audio button */}
        <div className="relative group">
          <button
            onClick={toggleAudio}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isAudioEnabled
                ? 'bg-[hsl(280,100%,70%)] text-white hover:bg-[hsl(280,100%,65%)]'
                : 'bg-white/10 text-white hover:bg-white/20'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Listen to Yota"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            Listen to Yota
          </div>
        </div>

        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-[hsl(280,100%,70%)] text-white rounded-lg hover:bg-[hsl(280,100%,65%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

