# SigmaGPT

## Run locally (manual browser opening)

This project is configured as a monolithic React + Express application.

### 1. Build the frontend

From the project root:

```powershell
npm run build
```

### 2. Start the backend

From the project root:

```powershell
npm start
```

The terminal will show:

```text
SigmaGPT server running on http://localhost:5000
Open the frontend manually in your browser: http://localhost:5000
```

The browser is **not opened automatically**.

### 3. Open the application manually

Open Chrome/Edge yourself and enter:

```text
http://localhost:5000
```

### 4. Start Ollama separately

In another terminal:

```powershell
ollama run llama3.2
```

Keep Ollama running while testing AI chat.

### Backend health check

```text
http://localhost:5000/api/health
```

## Deployment

The application is structured for a single Render Web Service. Do not commit `.env` or secrets to GitHub.
