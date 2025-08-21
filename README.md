# Real-time Chat Application

Real-time messaging SPA built with Vue 3 + Ionic + TypeScript + Vite, integrated with Azure SignalR Service.

## 🚀 Tech Stack

- **Frontend**: Vue 3, Ionic, TypeScript
- **Build Tool**: Vite  
- **Real-time**: Microsoft SignalR Client
- **Styling**: Ionic CSS Components

## ✨ Features

- ✅ Login page with nickname validation
- ✅ Real-time chat with message display and sending
- ✅ SignalR integration with automatic reconnection
- ✅ Responsive design with dark mode support
- ✅ TypeScript type safety

## 🛠 Quick Start

### Prerequisites
- Node.js 16+
- Running Azure SignalR Service server

### Installation

```bash
# Clone repository
git clone https://github.com/danieltadevosyan/ionic-vue-signalr-chat.git
cd ionic-vue-signalr-chat

# Install dependencies
npm install

# Start development server
npm run dev
```

Application will be available at: `http://localhost:5173`

### Build for production
```bash
npm run build
```

## 🏗 Project Structure

```
src/
├── pages/              # Application pages
│   ├── LoginPage.vue   # Nickname input page
│   └── ChatPage.vue    # Main chat interface
├── services/           # Business logic services
│   └── signalRService.ts # SignalR client management
├── types/              # TypeScript interfaces
│   └── index.ts        # Common types
├── theme/              # Ionic theming
│   └── variables.css   # CSS variables
├── App.vue             # Root component
└── main.ts             # Application entry point
```

## 🌐 Backend Integration

Connects to Azure SignalR Service at `http://localhost:3209/messenger/hub`

**Backend Repository**: https://github.com/NickSuomi/AzureSignalRService

## � License

MIT
