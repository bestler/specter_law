# Specter Law: Microsoft Word Add-in

## Project Outline

Specter Law is a Microsoft Word Add-in that leverages Office.js, React, and TypeScript to provide advanced document analysis and AI-powered legal clause suggestions. The add-in is designed to help users compare contracts, analyze clauses, and receive AI-driven feedback directly within Microsoft Word. The project is scaffolded for clean separation of UI, Office.js logic, and business logic, and includes a FastAPI backend for LLM-powered analysis.

## Agentic AI Approach

Specter Law uses an "agentic" approach for clause and contract analysis:

1. **Raw Changelog Extraction:**
   - The add-in first extracts tracked changes and raw diff information from the Word document using Office.js.
2. **LLM Preprocessing:**
   - This raw information is sent to a Large Language Model (LLM) for preprocessing, cleaning, and structuring.
3. **Few-Shot Prompting:**
   - The LLM is guided by a large prompt template with many few-shot examples, ensuring high-quality, context-aware responses tailored to legal scenarios.
4. **(Planned) Knowledge Base Integration:**
   - In the future, the system can be enhanced by connecting to a Knowledge Base or Document Management System (DMS) for even more accurate and context-rich analysis.
5. **Interactive Results in Word:**
   - The final AI judgment and suggestions are returned directly to the user inside Word, allowing for seamless review and interaction within the familiar Word interface.

## Main Structure

```
legal_hackathon/
│
├── README.md                # This file
├── backend/                 # FastAPI backend for AI/LLM analysis
│   ├── main.py              # FastAPI app entry point
│   ├── clause_analysis.py   # Business logic for clause analysis
│   ├── requirements.txt     # Python dependencies
│   └── certs/               # Local HTTPS certificates
│
└── plugin/
    └── specter-law/         # Word Add-in (frontend)
        ├── manifest.xml     # Office Add-in manifest
        ├── package.json     # Frontend dependencies and scripts
        ├── tsconfig.json    # TypeScript configuration
        ├── webpack.config.js# Webpack bundling config
        ├── assets/          # Icons and images
        └── src/
            ├── commands/    # Office.js command logic
            └── taskpane/    # Main React app and logic
                ├── components/   # React UI components
                ├── office/       # Office.js interaction logic
                └── business/     # (Planned) Business logic (diff/LLM analysis)
```

### Folder Responsibilities
- **components/**: All React UI components (e.g., App, Header, DocumentCompare)
- **office/**: Functions for interacting with Office.js/Word APIs
- **business/**: (Planned) Pure business logic, e.g., diffing, LLM analysis, etc.

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Python 3.9+
- Microsoft Word (desktop, with sideloading enabled)

## Setup Instructions

### 1. Clone the Repository
```zsh
git clone <your-repo-url>
cd legal_hackathon
```

### 2. Set Up the Backend (FastAPI)
```zsh
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set your Google API key in a .env file:
echo "GOOGLE_API_KEY=your-key-here" > .env
# Run the backend (with HTTPS for local dev)
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --ssl-keyfile certs/key.pem --ssl-certfile certs/cert.pem
```

### 3. Set Up the Word Add-in Frontend
```zsh
cd ../plugin/specter-law
npm install
```

### 4. Run the Add-in Locally
```zsh
npm run dev-server
# In a new terminal:
npm start
```
- This will start the local dev server (https://localhost:3000) and sideload the add-in into Word.

### 5. Sideload the Add-in in Word
- Open Microsoft Word (desktop)
- Go to **Insert > My Add-ins > Shared Folder**
- Select the `manifest.xml` from `plugin/specter-law/`

> **Note:** Office Add-ins require a valid SSL certificate. Self-signed certificates are not accepted by Word for production use. For this reason, the add-in is also hosted with a valid certificate at:
>
> **https://specter-law.onrender.com**

## Usage
- Use the task pane to compare documents, select clauses, and get AI-powered suggestions.
- The backend will process requests for clause analysis and return suggestions using Gemini-pro (Google AI).

## Development Notes
- **Separation of Concerns:**
  - UI (React) in `components/`
  - Office.js logic in `office/`
  - Business logic (planned) in `business/`
- **HTTPS is required** for Office Add-ins in development. Certificates are provided in `backend/certs/`.

## Scripts
- `npm run dev-server` – Start the frontend dev server
- `npm start` – Sideload the add-in into Word
- `npm run build` – Build the production bundle
- `uvicorn main:app ...` – Start the FastAPI backend

## Credits
- Based on [OfficeDev/Office-Addin-TaskPane-React](https://github.com/OfficeDev/Office-Addin-TaskPane-React)
- Uses [FastAPI](https://fastapi.tiangolo.com/) for backend
- Uses [Fluent UI](https://react.fluentui.dev/) for frontend components
- Special thanks to [GitHub Copilot](https://github.com/features/copilot) as an AI coworker and coding assistant ;-)
