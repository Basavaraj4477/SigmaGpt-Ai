# SigmaGPT

SigmaGPT is an AI-powered chat application built using React.js, Node.js, Express.js, MongoDB, Ollama and Llama 3.2.

It allows users to create multiple conversations and interact with an AI model through a simple and responsive chat interface.

## Features

- User registration and login
- JWT authentication
- Create multiple chats
- Multiple chat sessions
- Chat history stored in MongoDB
- AI-powered responses using Llama 3.2
- Chat titles based on the first message
- Delete chats
- Responsive user interface

## Technologies Used

- React.js
- Node.js
- Express.js
- MongoDB
- Mongoose
- Ollama
- Llama 3.2
- Axios
- JWT
- CSS

## Project Structure

    SigmaGPT
    │
    ├── Backend
    │   ├── config
    │   ├── controllers
    │   ├── middleware
    │   ├── models
    │   ├── routes
    │   ├── services
    │   ├── .env.example
    │   └── server.js
    │
    ├── Frontend
    │   ├── public
    │   ├── src
    │   └── package.json
    │
    ├── package.json
    ├── render.yaml
    └── README.md

## How to Run Locally

### 1. Clone the Repository

    git clone YOUR_GITHUB_REPOSITORY_URL
    cd SigmaGPT

Replace `YOUR_GITHUB_REPOSITORY_URL` with the URL of this GitHub repository.

### 2. Install Dependencies

From the project root, run:

    npm run build

This installs the required dependencies and builds the React frontend.

### 3. Configure Environment Variables

Create a `.env` file inside the `Backend` folder.

    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    OLLAMA_URL=http://localhost:11434
    OLLAMA_MODEL=llama3.2

Do not upload the `.env` file to GitHub.

### 4. Start Ollama

Make sure Ollama is installed and run:

    ollama run llama3.2

Keep Ollama running while using the AI chat.

### 5. Start SigmaGPT

From the project root, run:

    npm start

The application will run on:

    http://localhost:5000

Open the URL manually in your browser.

The browser will not open automatically.

## Backend Health Check

To check whether the backend is running, open:

    http://localhost:5000/api/health

## Database

SigmaGPT uses MongoDB to store:

- User accounts
- Chat sessions
- Chat messages

The MongoDB connection string is stored in the `MONGO_URI` environment variable.

## AI

SigmaGPT currently uses Ollama with the Llama 3.2 model.

The backend sends the conversation messages to Ollama and returns the generated response to the frontend.

## Deployment

The project is structured as a monolithic application where the Express backend serves the React frontend.

The application can be deployed as a single web service.

Environment variables should be added to the deployment platform and should not be committed to GitHub.

## Future Improvements

- AI response streaming
- Markdown support
- Code syntax highlighting
- Chat search
- More AI model options
- Improved UI
- Production AI hosting

## Author

Basavaraj

B.Tech Computer Science and Engineering
