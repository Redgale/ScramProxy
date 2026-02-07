# Scramjet Web Proxy 🔗

A modern, lightweight web proxy built with Scramjet as the core proxy engine. Features a polished UI with tab support, tab cloaking, and a settings panel – behaving like a mini browser.

## ✨ Features

- **Multi-Tab Support**: Open multiple websites simultaneously in tabs
- **Tab Cloaking**: 
  - about:blank mode
  - Blob URL mode
  - Dynamic title/favicon spoofing
- **Modern UI**: Clean, responsive design with smooth animations
- **Settings Panel**: Customize proxy behavior
- **Built-in Navigation**: URL bar with search functionality
- **Mobile Responsive**: Works great on all devices
- **Production Ready**: Optimized and ready for deployment
- **Fast & Lightweight**: Minimal resource usage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/scramjet-web-proxy.git
cd scramjet-web-proxy
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment**
```bash
# Backend
cd backend
cp .env.example .env

# Frontend
cd ../frontend
cp .env.example .env
```

4. **Start the development server**
```bash
# Terminal 1 - Backend (from backend/)
npm run dev

# Terminal 2 - Frontend (from frontend/)
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the proxy
# http://localhost:3000
```

## 📦 Deployment on Koyeb

### Option 1: One-Click Deployment (Recommended)

1. **Fork this repository** on GitHub
2. **Go to [Koyeb Console](https://app.koyeb.com)**
3. **Click "Create Web Service"**
4. **Select your GitHub repository**
5. **Configure:**
   - **Builder:** Docker
   - **Port:** 3000
   - **Entrypoint:** Leave empty
6. **Click "Create Web Service"**

Koyeb will automatically:
- Build the Docker image
- Deploy the application
- Provide a public URL

### Option 2: Git-Based Deployment

```bash
# Install Koyeb CLI
npm install -g @koyeb/cli

# Login to Koyeb
koyeb auth login

# Deploy
koyeb deploy github --repository yourusername/scramjet-web-proxy
```

### Option 3: Manual Docker Push

```bash
# Build the image
docker build -f backend/Dockerfile -t scramjet-proxy:latest .

# Tag for registry
docker tag scramjet-proxy:latest your-registry/scramjet-proxy:latest

# Push to registry
docker push your-registry/scramjet-proxy:latest

# Deploy on Koyeb using the image URL
```

## 🔧 Configuration

### Backend Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Proxy
PROXY_TIMEOUT=30000
PROXY_RETRIES=3

# Security
RATE_LIMIT=100
REQUIRE_AUTH=false
API_KEY=

# Features
TAB_CLOAKING=true
CUSTOM_HEADERS=true
IP_ROTATION=false
```

### Frontend Configuration

Stored in browser's localStorage:
- Cloak mode preference
- JavaScript enabled/disabled
- Ad blocking
- Tracker blocking
- Custom headers

## 📂 Project Structure

```
scramjet-web-proxy/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server setup
│   │   ├── config.js             # Configuration
│   │   ├── middleware/           # Custom middleware
│   │   ├── routes/               # API routes
│   │   └── utils/                # Utility functions
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── index.html            # Main HTML
│   │   ├── app.js                # Main app logic
│   │   ├── index.css             # Styles
│   │   ├── components/           # Reusable components
│   │   └── utils/                # Utility functions
│   └── package.json
├── docker-compose.yml
├── README.md
└── LICENSE
```

## 🎨 UI Features

- **Navbar**: Logo, tabs, address bar, settings