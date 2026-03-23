# Meme Animator Pro - Super App

A comprehensive animation tool for creating viral meme shorts like Rico Animations. Combines FlipaClip-style features with AI-powered tools.

## Features

- **Advanced Timeline Editor** - Multi-track editing with keyframes
- **Drawing Tools** - Brush, eraser, shapes with onion skinning
- **30+ Animations** - Including meme-specific (facepalm, shrug, mic_drop)
- **15+ Expressions** - Full emotional range for characters
- **AI Story Parser** - Convert text descriptions to animations
- **TTS Voice Synthesis** - Multiple voices with speed control
- **Template Store** - Pre-built meme templates
- **Scene Transitions** - Fade, slide, zoom, wipe effects
- **Export Options** - MP4, GIF, PNG sequence

## Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Set up database
bun run db:push

# 3. Start development server
bun run dev

# 4. Open in browser
# http://localhost:3000
```

## Requirements

- Node.js 18+ or Bun runtime
- 4GB RAM minimum

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Prisma ORM (SQLite)
- Zustand state management
- z-ai-web-dev-sdk for AI features

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main Super App page
│   │   └── api/               # Backend APIs
│   │       ├── ai/            # AI endpoints (story-parser, tts)
│   │       ├── projects/      # Project management
│   │       └── templates/     # Template store
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── animator/          # Animation components
│   │   └── super-app/         # Super App components
│   ├── engine/
│   │   └── pro/               # Professional animation engine
│   └── hooks/
│       └── useAnimator.ts     # Zustand store
├── prisma/
│   └── schema.prisma          # Database schema
├── db/
│   └── custom.db              # SQLite database
└── mini-services/
    └── video-export/          # Video export service
```

## Usage

1. **Select a Character** - Click on Alex, Sam, or Jordan
2. **Choose an Animation** - Click any animation button
3. **Add Expression** - Set the character's mood
4. **Add Effects** - Trigger camera or impact effects
5. **Add Text** - Enter meme text overlay
6. **Use AI** - Parse stories or generate TTS
7. **Export** - Download as video, GIF, or PNG

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/story-parser` | POST | Parse text to animation data |
| `/api/ai/tts` | POST | Text-to-speech synthesis |
| `/api/templates` | GET | Get pre-built templates |
| `/api/projects` | GET/POST | Project management |

## Scripts

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run start    # Start production server
bun run lint     # Run ESLint
bun run db:push  # Push database schema
```

## License

MIT

---

Built with Next.js and AI-powered features for creating viral content.
