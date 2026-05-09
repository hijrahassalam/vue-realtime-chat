# Vue Realtime Chat

![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat&logo=tailwindcss&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-State-FFD859?style=flat&logo=pinia&logoColor=black)
![Pusher](https://img.shields.io/badge/Pusher-Channels-70B5F9?style=flat&logo=pusher&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Testing-6E9F18?style=flat&logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-Linting-4B32C3?style=flat&logo=eslint&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-Deployment-00C7B7?style=flat&logo=netlify&logoColor=white)

**Live App:** [https://vue-realtime-chat-fe.netlify.app](https://vue-realtime-chat-fe.netlify.app)

**Backend API:** [https://laravel-realtime-chat-api-production.up.railway.app/api](https://laravel-realtime-chat-api-production.up.railway.app/api)

> Real-time chat frontend built with Vue 3, Pinia, Tailwind CSS, and Laravel Echo with Pusher Channels.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vue 3 App (Netlify)                                 │  │
│  │                                                      │  │
│  │  ┌──────────┐  ┌───────────┐  ┌─────────────────┐   │  │
│  │  │  Pinia   │  │  Vue      │  │  Laravel Echo   │   │  │
│  │  │  stores  │  │  Router   │  │  + Pusher.js    │   │  │
│  │  │  (auth,  │  │           │  │                 │   │  │
│  │  │   chat)  │  │           │  │ Subscribes to:  │   │  │
│  │  └────┬─────┘  └───────────┘  │ private-room.*  │   │  │
│  │       │                        └────────┬────────┘   │  │
│  │       │                                 │            │  │
│  └───────┼─────────────────────────────────┼────────────┘  │
└──────────┼─────────────────────────────────┼───────────────┘
           │ HTTPS                WSS (TLS)
    ┌──────▼──────┐        ┌──────▼──────┐
    │   REST API   │        │   Pusher    │
    │  /api/*      │        │  Channels   │
    └──────────────┘        └─────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Vue 3 (Composition API) |
| Build Tool | Vite 6 |
| State Management | Pinia |
| Styling | Tailwind CSS 3 |
| HTTP Client | Axios |
| WebSocket | Laravel Echo + Pusher.js |
| Testing | Vitest |
| Linting | ESLint |
| Hosting | Netlify |

## Features

- 🔐 **User Authentication** — Register, login, logout via Laravel Sanctum
- 💬 **Real-time Messaging** — Instant message delivery via Pusher WebSocket
- 🚪 **Room Management** — Create, join, leave, delete chat rooms
- 📖 **Message History** — Paginated message retrieval
- ✅ **Read Receipts** — Mark messages as read
- ⏳ **Typing Indicators** — Real-time typing status
- 🎨 **Modern UI** — Clean, responsive interface with Tailwind CSS

## Project Structure

```
vue-realtime-chat/
├── src/
│   ├── assets/          # Global styles
│   ├── components/      # Reusable Vue components (ChatRoom, MessageList, TypingIndicator)
│   ├── stores/          # Pinia stores (auth, chat)
│   ├── views/          # Page components (Login, Register, Rooms, Chat)
│   ├── router/         # Vue Router configuration
│   ├── lib/            # API client + Laravel Echo + Pusher config
│   └── App.vue         # Root component
├── public/
├── tests/
│   └── unit/          # Vitest unit tests
└── netlify.toml       # Netlify deployment config
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install Dependencies

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Run Tests

```bash
pnpm test:unit
```

### Lint

```bash
pnpm lint
```

## Environment Variables

```env
VITE_API_URL=<your-api-url>/api
VITE_PUSHER_APP_KEY=<your-pusher-app-key>
VITE_PUSHER_APP_CLUSTER=ap1
```

Set these in `.env` (local) or Netlify environment variables (production).

## Backend

This frontend communicates with the **Laravel Realtime Chat API**:

- **Repository:** [github.com/hijrahassalam/laravel-realtime-chat-api](https://github.com/hijrahassalam/laravel-realtime-chat-api)
- **Live API:** [https://laravel-realtime-chat-api-production.up.railway.app/api](https://laravel-realtime-chat-api-production.up.railway.app/api)
- **Stack:** Laravel 13 · PHP 8.4 · PostgreSQL (Neon) · Redis (Upstash) · Pusher Channels · Railway

## Real-time Data Flow

```
User A types message → POST /api/rooms/2/messages
                              │
                    Laravel API stores in DB
                              │
                    Fire: MessageSent event
                              │
                    Pusher HTTP API receives event
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         User A FE       User B FE       User C FE
         (echo)          (echo)          (echo)
              │               │               │
         "message.sent"  "message.sent"  (not in room.2)
         received        received
              │               │
         Vue updates     Vue updates
         chat UI         chat UI
```

## License

MIT
