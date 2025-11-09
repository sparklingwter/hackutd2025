"use client";

import { useEffect, useRef, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { ArrowUpIcon, Search, Mic, MicOff } from "lucide-react";
import StickyHeader from "~/components/ui/sticky-header";
import { ThemeToggle } from "~/components/theme-toggle";
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
      <ThemeToggle />
      <StickyHeader logoSize={160} />
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="container flex flex-col items-center justify-center gap-14 px-6 py-20">
          {/* Title */}
          <h1 className="text-6xl font-extrabold tracking-tight text-foreground sm:text-[6rem]">
            FindMy<span className="text-primary">Yota</span>
          </h1>

          {/* Search Bar (rounded) */}
          <div className="w-full max-w-4xl">
            <InputGroup className="rounded-full shadow-lg overflow-hidden">
              <InputGroupAddon>
                <Search className="h-6 w-6 ml-3 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search..."
                className="h-20 text-xl px-6 border-0 focus:ring-2 focus:ring-primary rounded-full"
              />
            </InputGroup>
          </div>

          {/* Chatbox (rounded) with Mic */}
          <div className="w-full max-w-4xl">
            <InputGroup className="rounded-2xl shadow-lg overflow-hidden">
              <InputGroupTextarea
                placeholder="Ask, Search or Chat..."
                className="min-h-[28rem] text-lg leading-relaxed p-6 border-0 rounded-2xl focus:ring-2 focus:ring-primary"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              {/* End controls: Voice, Plus, Send */}
              <InputGroupAddon align="inline-end" className="flex items-center gap-2 pr-4 py-2">
                {/* Voice (ElevenLabs) */}
                <InputGroupButton
                  variant={recording ? "default" : "outline"}
                  className={`rounded-full p-3 ${recording ? "animate-pulse" : ""}`}
                  onClick={recording ? stopRecording : startRecording}
                  aria-pressed={recording}
                  aria-label={recording ? "Stop recording" : "Start recording"}
                  title={recording ? "Recording…" : "Voice (ElevenLabs Scribe)"}
                >
                  {recording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </InputGroupButton>

                {/* Optional attach/add */}
                <InputGroupButton variant="outline" className="rounded-full p-3">
                  <IconPlus className="h-6 w-6" />
                </InputGroupButton>

                {/* Send */}
                <InputGroupButton variant="default" className="rounded-full p-3">
                  <ArrowUpIcon className="h-6 w-6" />
                  <span className="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}
