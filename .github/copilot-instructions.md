# Real-time Chat Application

## Project Overview
SPA application for real-time messaging built with Vue 3 + Ionic + TypeScript + Vite. Integrates with Azure SignalR Service for real-time communication.

## Key Features
- ✅ Login page with nickname input and validation
- ✅ Real-time chat with message display and sending
- ✅ SignalR integration with automatic reconnection
- ✅ Responsive design with Ionic components
- ✅ Dark mode support
- ✅ TypeScript type safety

## Technology Stack
- **Frontend**: Vue 3, Ionic, TypeScript
- **Build Tool**: Vite
- **Real-time**: Microsoft SignalR Client (@microsoft/signalr)
- **Styling**: Ionic CSS Components
- **Icons**: Ionicons
- **Router**: Vue Router

## Project Structure
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

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Backend Integration
Connects to Azure SignalR Service at `http://localhost:3209/chatHub`
Repository: https://github.com/NickSuomi/AzureSignalRService

## Completed Tasks
- [x] Project scaffolding with Vite + Vue 3 + TypeScript
- [x] Ionic integration and theming
- [x] SignalR service implementation
- [x] Login page with validation
- [x] Chat page with real-time messaging
- [x] Router configuration
- [x] TypeScript types and interfaces
- [x] Responsive design and dark mode
- [x] Documentation and README
