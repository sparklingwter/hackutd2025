# HackUTD 2025 - Gemini Chat Agent

A conversational AI agent built with Gemini API, featuring a Python FastAPI backend and a Next.js TypeScript frontend.

## Project Structure

```
hackutd2025/
├── server/          # Python FastAPI backend
│   ├── main.py       # FastAPI application with Gemini integration
│   ├── requirements.txt
│   └── README.md
├── src/              # Next.js frontend
│   ├── app/
│   │   ├── _components/
│   │   │   └── chat.tsx  # Chat interface component
│   │   └── page.tsx      # Main page
│   └── ...
└── ...
```

## Setup Instructions

### 1. Backend Setup (Python)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the `server` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your Gemini API key from: https://makersuite.google.com/app/apikey

5. Run the backend server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

### 2. Frontend Setup (Next.js)

1. Install dependencies (from project root):
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Usage

1. Start the Python backend server (port 8000)
2. Start the Next.js frontend (port 3000)
3. Open `http://localhost:3000` in your browser
4. Start chatting with the Gemini agent!

## API Endpoints

### `POST /api/chat`

Send a chat message to the Gemini agent.

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

## Future Enhancements

- Fine-tune the agent on car-related data
- Add voice input/output with ElevenLabs
- Implement conversation history persistence
- Add car preference tracking

## Technologies

- **Backend**: Python, FastAPI, Google Gemini API
- **Frontend**: Next.js, TypeScript, React, Tailwind CSS
