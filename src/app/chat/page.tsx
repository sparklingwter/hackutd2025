import { Chat } from "~/app/_components/chat";

export default function ChatPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Gemini <span className="text-[hsl(280,100%,70%)]">Chat</span> Agent
        </h1>
        <p className="text-xl text-gray-300">
          Chat with the Gemini AI agent (Python backend + TypeScript frontend)
        </p>
        <Chat />
      </div>
    </main>
  );
}

