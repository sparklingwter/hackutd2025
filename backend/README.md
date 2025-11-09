# Python Backend - Gemini Chat API

This is the Python FastAPI backend for the Gemini chat application.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

   Get your Gemini API key from: https://makersuite.google.com/app/apikey

3. **Run the server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /` - Health check
- `GET /api/health` - Health check endpoint
- `POST /api/chat` - Chat with Gemini

### Chat Endpoint

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7
}
```

**Response:**
```json
{
  "message": "I'm doing well, thank you! How can I help you today?",
  "role": "assistant"
}
```

## Development

The server runs with auto-reload enabled, so changes will be reflected automatically.

