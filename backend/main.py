from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
import httpx
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

# Configure Gemini API (primary)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Initialize the model - using gemini-2.5-flash (latest stable model)
    model = genai.GenerativeModel("models/gemini-2.5-flash")
else:
    print("⚠ Warning: GEMINI_API_KEY not set, will use OpenRouter only")
    model = None

# Configure OpenRouter API (fallback)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

if not OPENROUTER_API_KEY:
    print("⚠ Warning: OPENROUTER_API_KEY not set, fallback will not work")


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


async def call_gemini_api(messages: List[Message], temperature: float) -> str:
    """Call Gemini API and return the response text."""
    if not GEMINI_API_KEY or not model:
        raise ValueError("Gemini API not configured")
    
    # Convert messages to Gemini format
    # Gemini expects alternating user/assistant messages
    chat_history = []
    for msg in messages[:-1]:  # All messages except the last one
        if msg.role == "user":
            chat_history.append({"role": "user", "parts": [msg.content]})
        elif msg.role == "assistant":
            chat_history.append({"role": "model", "parts": [msg.content]})

    # Get the last user message
    last_message = messages[-1]
    if last_message.role != "user":
        raise ValueError("Last message must be from user")
    user_message = last_message.content
    
    # Start a chat session with history
    chat_session = model.start_chat(history=chat_history)
    
    # Generate response with temperature setting
    from google.generativeai.types import GenerationConfig
    
    generation_config = GenerationConfig(
        temperature=temperature,
    )
    
    response = chat_session.send_message(
        user_message,
        generation_config=generation_config
    )

    return response.text


async def call_openrouter_api(messages: List[Message], temperature: float) -> str:
    """Call OpenRouter API and return the response text."""
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY not configured")
    
    # Convert messages to OpenRouter format (similar to OpenAI format)
    openrouter_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in messages
    ]
    
    # Use a Gemini model through OpenRouter as fallback
    # Try free model first, fallback to paid if rate limited
    models_to_try = [
        "google/gemini-2.0-flash-exp:free",  # Free model
        "google/gemini-2.0-flash-exp",  # Paid model (if free is rate limited)
    ]
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",  # Optional: for tracking
        "X-Title": "Gemini Chat Agent",  # Optional: for tracking
    }
    
    last_error = None
    for model_name in models_to_try:
        try:
            payload = {
                "model": model_name,
                "messages": openrouter_messages,
                "temperature": temperature,
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    OPENROUTER_API_URL,
                    json=payload,
                    headers=headers
                )
                
                # Handle rate limit errors specifically
                if response.status_code == 429:
                    error_msg = response.text
                    if "free" in model_name:
                        # Try paid model if free is rate limited
                        print(f"⚠ Free model rate limited, trying paid model...")
                        continue
                    else:
                        raise HTTPException(
                            status_code=429,
                            detail=f"OpenRouter rate limit exceeded. Please wait a moment or add credits to your OpenRouter account. Error: {error_msg}"
                        )
                
                response.raise_for_status()
                data = response.json()
                
                # Extract the message content from OpenRouter response
                if "choices" in data and len(data["choices"]) > 0:
                    print(f"✓ Used OpenRouter model: {model_name}")
                    return data["choices"][0]["message"]["content"]
                else:
                    raise ValueError("Unexpected response format from OpenRouter")
        except HTTPException:
            # Re-raise HTTP exceptions (like 429)
            raise
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                last_error = e
                continue  # Try next model
            else:
                raise
        except Exception as e:
            last_error = e
            continue  # Try next model
    
    # If all models failed, raise the last error
    if last_error:
        if isinstance(last_error, httpx.HTTPStatusError) and last_error.response.status_code == 429:
            raise HTTPException(
                status_code=429,
                detail="OpenRouter rate limit exceeded. Please wait a moment or add credits to your OpenRouter account at https://openrouter.ai/credits"
            )
        raise last_error
    else:
        raise ValueError("All OpenRouter models failed")


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Try Gemini API first (if configured)
        if GEMINI_API_KEY and model:
            try:
                response_text = await call_gemini_api(request.messages, request.temperature)
                print("✓ Successfully used Gemini API")
                return ChatResponse(
                    message=response_text,
                    role="assistant"
                )
            except Exception as gemini_error:
                print(f"⚠ Gemini API failed: {gemini_error}")
                
                # Fallback to OpenRouter if Gemini fails
                if OPENROUTER_API_KEY:
                    try:
                        print("🔄 Attempting fallback to OpenRouter API...")
                        response_text = await call_openrouter_api(request.messages, request.temperature)
                        print("✓ Successfully used OpenRouter API (fallback)")
                        return ChatResponse(
                            message=response_text,
                            role="assistant"
                        )
                    except HTTPException as http_error:
                        # Re-raise HTTP exceptions (like 429 rate limits) with their original status
                        print(f"❌ OpenRouter API failed with HTTP {http_error.status_code}: {http_error.detail}")
                        raise http_error
                    except Exception as openrouter_error:
                        print(f"❌ OpenRouter API also failed: {openrouter_error}")
                        # If both fail, provide helpful error message
                        error_detail = f"Both Gemini and OpenRouter APIs failed. "
                        if "429" in str(openrouter_error) or "rate limit" in str(openrouter_error).lower():
                            error_detail += "OpenRouter rate limit exceeded. Please wait a moment or add credits at https://openrouter.ai/credits. "
                        error_detail += f"Gemini error: {str(gemini_error)}"
                        raise HTTPException(
                            status_code=500,
                            detail=error_detail
                        )
                else:
                    # No OpenRouter key configured, just raise Gemini error
                    raise HTTPException(
                        status_code=500,
                        detail=f"Gemini API failed and OpenRouter is not configured. Error: {str(gemini_error)}"
                    )
        else:
            # No Gemini key, use OpenRouter directly
            if OPENROUTER_API_KEY:
                try:
                    print("🔄 Using OpenRouter API (Gemini not configured)...")
                    response_text = await call_openrouter_api(request.messages, request.temperature)
                    print("✓ Successfully used OpenRouter API")
                    return ChatResponse(
                        message=response_text,
                        role="assistant"
                    )
                except HTTPException as http_error:
                    raise http_error
                except Exception as openrouter_error:
                    print(f"❌ OpenRouter API failed: {openrouter_error}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"OpenRouter API failed. Error: {str(openrouter_error)}"
                    )
            else:
                raise HTTPException(
                    status_code=500,
                    detail="Neither Gemini nor OpenRouter API keys are configured. Please set at least one API key."
                )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        import traceback
        error_details = {
            "error": str(e),
            "type": type(e).__name__,
            "traceback": traceback.format_exc()
        }
        print(f"❌ Error in /api/chat: {error_details}")  # Log to console
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "gemini-chat-api"}

