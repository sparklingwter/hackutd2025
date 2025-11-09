"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon, Search, Mic, MicOff } from "lucide-react";
import StickyHeader from "~/components/ui/sticky-header";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "~/components/ui/input-group";
import { TooltipProvider } from "~/components/ui/tooltip";

export default function Home() {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Prefer opus in webm (widely supported). Safari may use audio/mp4.
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "";

    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: mime || "audio/webm" });
      const fd = new FormData();
      fd.append("file", blob, `audio.${mime.includes("mp4") ? "m4a" : "webm"}`);

      const res = await fetch("/api/stt", { method: "POST", body: fd });
      if (!res.ok) return;
      const data = await res.json();

      // ElevenLabs returns { text, words, language_code, ... }
      if (data?.text) setText((prev) => (prev ? prev + "\n" : "") + data.text);
    };

    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  return (
    <TooltipProvider>
      <StickyHeader logoSize={160} />
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none z-40" />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 sm:px-6 lg:px-8">
          {/* Title - Apple-style typography */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl leading-tight">
              FindMy<span className="text-primary font-medium">Yota</span>
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground font-light tracking-wide">
              A simple way to find your dream car
            </p>
          </div>

          {/* Search Bar - Apple-style glassmorphism */}
          <div className="w-full max-w-3xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <InputGroup className="rounded-full shadow-2xl backdrop-blur-xl bg-card/80 border border-border/50 hover:shadow-xl transition-all duration-300 ease-out overflow-hidden">
              <InputGroupAddon>
                <Search className="h-5 w-5 ml-4 text-muted-foreground/70" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search..."
                className="h-16 text-lg px-4 border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50 font-light"
              />
            </InputGroup>
          </div>

          {/* Chatbox - Apple-style with smooth animations */}
          <div className="w-full max-w-4xl animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <InputGroup className="rounded-3xl shadow-2xl backdrop-blur-xl bg-card/80 border border-border/50 hover:shadow-xl transition-all duration-300 ease-out overflow-hidden">
              <InputGroupTextarea
                placeholder="Ask, search, or chat..."
                className="min-h-[26rem] text-base leading-relaxed p-8 border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50 font-light resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              {/* End controls - Apple-style buttons with smooth hover effects */}
              <InputGroupAddon align="inline-end" className="flex items-center gap-3 pr-6 pb-6">
                {/* Voice (ElevenLabs) */}
                <InputGroupButton
                  variant={recording ? "default" : "outline"}
                  className={`rounded-full p-3.5 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg border-0 ${
                    recording 
                      ? "animate-pulse bg-primary text-primary-foreground" 
                      : "bg-muted/50 backdrop-blur-sm hover:bg-muted"
                  }`}
                  onClick={recording ? stopRecording : startRecording}
                  aria-pressed={recording}
                  aria-label={recording ? "Stop recording" : "Start recording"}
                  title={recording ? "Recording…" : "Voice (ElevenLabs Scribe)"}
                >
                  {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </InputGroupButton>

                <InputGroupButton 
                  variant="outline" 
                  className="rounded-full p-3.5 transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-lg border-0 bg-muted/50 backdrop-blur-sm hover:bg-muted"
                >
                  <IconPlus className="h-5 w-5" />
                </InputGroupButton>

                <Link href="/result">
                  <InputGroupButton 
                    variant="default" 
                    className="rounded-full p-3.5 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl border-0 bg-primary text-primary-foreground"
                  >
                    <ArrowUpIcon className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </InputGroupButton>
                </Link>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
