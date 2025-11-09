from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model - using gemini-2.5-flash (latest stable model)
# Available models: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-flash-latest
model = genai.GenerativeModel("models/gemini-2.5-flash")


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.7


class ChatResponse(BaseModel):
    message: str
    role: str = "assistant"


@app.get("/")
def read_root():
    return {"message": "Gemini Chat API is running"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Convert messages to Gemini format
        # Gemini expects alternating user/assistant messages
        chat_history = []
        for msg in request.messages[:-1]:  # All messages except the last one
            if msg.role == "user":
                chat_history.append({"role": "user", "parts": [msg.content]})
            elif msg.role == "assistant":
                chat_history.append({"role": "model", "parts": [msg.content]})

        # Get the last user message
        last_message = request.messages[-1]
        if last_message.role != "user":
            raise HTTPException(
                status_code=400, 
                detail="Last message must be from user"
            )
        user_message = last_message.content
        
        # Start a chat session with history
        chat_session = model.start_chat(history=chat_history)
        
        # Generate response with temperature setting
        from google.generativeai.types import GenerationConfig
        
        generation_config = GenerationConfig(
            temperature=request.temperature,
        )
        
        response = chat_session.send_message(
            user_message,
            generation_config=generation_config
        )

        return ChatResponse(
            message=response.text,
            role="assistant"
        )
    except Exception as e:
        import traceback
        error_details = {
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        print(f"Error in /api/chat: {error_details}")  # Log to console
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "gemini-chat-api"}

