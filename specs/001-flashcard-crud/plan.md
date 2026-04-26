# Implementation Plan: Flashcard CRUD & Study System

**Branch**: `001-flashcard-crud` | **Date**: 2026-04-26 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from [spec.md](spec.md) with technology stack: TypeScript, SvelteKit/Vite, minimal libraries, local SQLite via ORM, minimal CSS

## Summary

Build a web-based flashcard learning application with user authentication, set management (CRUD), and interactive study mode. Users authenticate with default credentials, manage flashcard sets in a grid dashboard, and study cards with flip animations and drag gestures (left = remembered, right = forgot). All data persists to local SQLite database with browser session integration. Technology stack: SvelteKit + Vite + TypeScript with minimal external dependencies to keep bundle size under 200KB.

## Technical Context

**Language/Version**: TypeScript (latest stable, strict mode enforced)  
**Framework**: SvelteKit (latest stable with Vite as build tool)  
**Primary Dependencies**: 
- Svelte ecosystem: SvelteKit, Svelte (included)
- Database: Drizzle ORM with SQLite driver
- Minimal additional libraries (prioritize built-in browser APIs)
- Styling: Scoped CSS (no Tailwind or heavy CSS frameworks)

**Storage**: SQLite database via Drizzle ORM (local file-based for development, extensible to server-backed in future)  
**Testing**: Vitest (unit/integration), Svelte Testing Library (component tests), Playwright (e2e optional)  
**Target Platform**: Web browser (desktop/mobile, no server runtime required for MVP)  
**Project Type**: Full-stack web application (SvelteKit handles both frontend and backend routes)  
**Performance Goals**: 
- Lighthouse score ≥90 (Performance, Accessibility, Best Practices)
- Bundle size <200KB gzipped (measured at build)
- Card flip animations 60 FPS (smooth interaction)
- Drag gesture response <100ms

**Constraints**: 
- Minimal CSS (use CSS Grid/Flexbox only, no utility framework)
- Minimal dependencies (prefer standard Web APIs: Fetch, IndexedDB optional backup, localStorage for sessions)
- Image handling: Local images embedded or stored as base64, no external uploads
- Database: SQLite local file, schema versioning for future migrations

**Scale/Scope**: MVP for single-user desktop/mobile browser experience; supports 100+ flashcard sets and 5000+ individual cards without performance degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle Alignment Assessment

**Principle I: Component-First Architecture** ✅
- All UI elements (cards, menus, modals) will be built as reusable Svelte components
- Components will have clear prop interfaces and event handlers
- Monolithic pages prohibited; dashboard and study view will be composed from smaller components
- **Design Decision**: Create dedicated `Card`, `CardGrid`, `StudyCard`, `Menu`, `Modal` components

**Principle II: User-Centric Interaction Design** ✅
- Card flip animation target: 300ms duration at 60 FPS (smooth transition)
- Drag gesture handling: Recognize left/right swipes, provide visual feedback (highlight/scale)
- Touch and mouse input: Implement both via pointer events (more modern than separate handlers)
- Accessibility: Semantic HTML (no divs as buttons), ARIA labels, keyboard navigation (Tab, Enter, Escape)
- **Design Decision**: Use pointer events for unified touch/mouse handling; CSS transitions for animations

**Principle III: Progressive Enhancement** ✅
- Phase 1 (MVP): Authentication, set CRUD, static flashcard display, manual navigation
- Phase 2 (deferred): Drag animations, flip interactions, localStorage persistence (per spec assumption)
- Phase 3 (deferred): Spaced repetition, statistics, export/import
- Phase 4 (deferred): Cloud sync, collaboration
- **Design Decision**: All Phase 1 features will not depend on Phase 2+; localStorage as fallback to SQLite during session

**Principle IV: Data Persistence & State Management** ✅
- State: Svelte stores (writable for user, sets, cards; derived for computed properties)
- Persistence: SQLite as primary; Svelte store state synced to DB on mutations
- User session: localStorage-backed session token (username/timestamp), validated on app load
- **Design Decision**: Create stores: `userStore`, `setsStore`, `cardsStore`, `sessionStore`; sync mutations to DB

**Principle V: Performance & Accessibility Standards** ✅
- Lighthouse target: ≥90 (enforced pre-deployment)
- Bundle constraint: <200KB gzipped (strict limit)
- Keyboard accessibility: All interactive elements tabbable; card flip on Enter; menu navigation with arrow keys
- WCAG 2.1 AA: Semantic HTML, sufficient color contrast (test with contrast checkers), text sizing ≥12px
- **Design Decision**: CSS-only animations (no JavaScript animation libraries); minimal JS for gesture handling

### Constitution Gate Status

**Gate 1: Technology Stack Justified** ✅
- SvelteKit chosen to minimize bundle and maximize reactivity (per Principle I & V)
- Drizzle ORM chosen for type-safe queries without heavy ORM overhead (minimal dependencies)
- Vite for fast builds and ES module bundling efficiency

**Gate 2: Feature Scope Aligns with Phase 1** ✅
- All requirements fit MVP phase per Principle III
- Deferred features (spaced rep, cloud sync) clearly marked in spec assumptions

**Gate 3: Performance & Accessibility Not Compromised** ✅
- No heavy dependencies; no CSS frameworks; animations are CSS-based
- Accessibility woven into component design from start (semantic HTML, ARIA, keyboard)

**Result**: ✅ **GATES PASSED** — Plan may proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-flashcard-crud/
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 output (technology research, design decisions)
├── data-model.md        # Phase 1 output (entities, database schema)
├── quickstart.md        # Phase 1 output (setup, run, test instructions)
├── contracts/           # Phase 1 output (API contracts for future integration)
│   ├── authentication.md
│   ├── sets.md
│   ├── cards.md
│   └── session.md
├── checklists/
│   └── requirements.md   # Quality checklist (requirements validation)
└── tasks.md             # Phase 2 output (/speckit.tasks command, not created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── routes/                    # SvelteKit page routes
│   ├── +page.svelte          # Home/login page
│   ├── +page.server.ts        # Login form handler (POST /login)
│   ├── dashboard/
│   │   ├── +page.svelte       # Set grid dashboard
│   │   └── +page.server.ts    # Set list endpoint
│   ├── study/[setId]/
│   │   ├── +page.svelte       # Study view with card display
│   │   └── +page.server.ts    # Card list, session handlers
│   └── api/
│       ├── auth/
│       │   └── login.ts       # POST /api/auth/login
│       ├── sets/
│       │   ├── +server.ts     # GET/POST /api/sets (list, create)
│       │   └── [setId]/
│       │       └── +server.ts # GET/PUT/DELETE /api/sets/[setId]
│       └── cards/
│           ├── +server.ts     # GET/POST /api/cards (list, create)
│           └── [cardId]/
│               └── +server.ts # GET/PUT/DELETE /api/cards/[cardId]
│
├── lib/
│   ├── components/            # Reusable Svelte components (Principle I)
│   │   ├── LoginForm.svelte
│   │   ├── SetGrid.svelte
│   │   ├── SetCard.svelte
│   │   ├── StudyCard.svelte
│   │   ├── FlipCard.svelte    # Card with flip animation
│   │   ├── SideMenu.svelte
│   │   ├── CardEditor.svelte
│   │   ├── Modal.svelte
│   │   └── Button.svelte      # Semantic button component
│   │
│   ├── stores/                # Svelte stores (Principle IV)
│   │   ├── auth.ts            # userStore (writable)
│   │   ├── session.ts         # sessionStore (localStorage-backed)
│   │   ├── sets.ts            # setsStore (writable)
│   │   ├── cards.ts           # cardsStore (writable)
│   │   └── notifications.ts   # notificationStore (derived)
│   │
│   ├── db/                    # Database layer
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   ├── client.ts          # Database client initialization
│   │   └── migrations/        # SQL migration files (empty for MVP)
│   │
│   ├── utils/                 # Helper functions
│   │   ├── auth.ts            # Login, session validation
│   │   ├── gestures.ts        # Pointer event handlers (drag detection)
│   │   ├── animations.ts      # Shared animation timing constants
│   │   └── validators.ts      # Input validation (card question/answer)
│   │
│   ├── types/                 # TypeScript interfaces
│   │   ├── index.ts           # Exported types
│   │   ├── user.ts            # User type definition
│   │   ├── set.ts             # FlashcardSet type
│   │   ├── card.ts            # Flashcard type
│   │   └── session.ts         # Session type
│   │
│   └── styles/                # Global styles (minimal CSS)
│       ├── app.css            # Global typography, colors, reset
│       ├── animations.css     # Shared animations (flip, fade)
│       └── layout.css         # Grid/flex layout utilities
│
├── app.html                   # HTML shell
├── app.css                    # Mounted app styles (minimal)
└── env.d.ts                   # Environment variable types

tests/
├── unit/                      # Store and utility function tests (Vitest)
│   ├── stores/
│   │   ├── auth.test.ts
│   │   ├── sets.test.ts
│   │   └── cards.test.ts
│   └── utils/
│       ├── auth.test.ts
│       ├── gestures.test.ts
│       └── validators.test.ts
│
├── components/                # Component tests (Svelte Testing Library)
│   ├── LoginForm.test.ts
│   ├── SetGrid.test.ts
│   ├── StudyCard.test.ts
│   ├── SideMenu.test.ts
│   └── Modal.test.ts
│
└── integration/               # End-to-end workflows (optional Playwright)
    ├── auth-flow.test.ts
    ├── set-crud.test.ts
    └── study-session.test.ts

Configuration files:
├── svelte.config.js           # SvelteKit config (adapter, vite options)
├── vite.config.ts             # Vite config (build optimizations, bundle limits)
├── tsconfig.json              # TypeScript strict mode
├── drizzle.config.ts          # Drizzle ORM config (SQLite path)
├── .eslintrc.json             # ESLint config (Svelte + TypeScript)
├── .prettierrc.json           # Prettier config (code formatting)
└── package.json               # Dependencies, scripts
```

## Deliverables by Phase

### Phase 0: Research & Clarification (Active)

**Output**: `research.md`

Research tasks (to be resolved in this phase):
1. Evaluate Drizzle ORM vs alternatives for minimal SQLite integration
2. Confirm gesture detection strategy (pointer events vs touch/mouse separate)
3. Confirm animation approach (CSS transitions vs requestAnimationFrame)
4. Investigate localStorage fallback strategy for session persistence
5. Confirm Lighthouse build configuration with Vite

### Phase 1: Design & Contracts (Sequence after Phase 0)

**Output**: `data-model.md`, `contracts/`, `quickstart.md`, updated `.github/copilot-instructions.md`

1. **Data Model** (`data-model.md`):
   - Entity definitions (User, FlashcardSet, Flashcard, Session)
   - Relationships and constraints
   - Validation rules
   - Database schema (Drizzle types)

2. **API Contracts** (`contracts/`):
   - `authentication.md` — POST /api/auth/login request/response
   - `sets.md` — GET/POST/PUT/DELETE /api/sets
   - `cards.md` — GET/POST/PUT/DELETE /api/cards
   - `session.md` — Session storage and validation protocol

3. **Quickstart Guide** (`quickstart.md`):
   - Development environment setup (Node.js, npm)
   - Running `npm install && npm run dev`
   - Creating first flashcard set
   - Running tests (`npm run test`)
   - Building for production (`npm run build`)

### Phase 2: Task Generation (Sequence after Phase 1)

**Output**: `tasks.md` (generated by `/speckit.tasks` command)

Tasks will be organized by user story (P1 Auth, P1 Sets, P2 Study, P2 Menu) with 16 task items covering:
- Component implementation (Login, SetGrid, StudyCard, Menu, Modal)
- Store setup (auth, sets, cards, session)
- API routes (auth, sets, cards)
- Gesture handlers and animations
- Database schema and migrations
- Tests (unit, component, integration)

---

**Next step**: Execute Phase 0 research by creating `/research.md` with findings for each research task.

