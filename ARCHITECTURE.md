# FastMem Architecture

## Overview

FastMem is a SvelteKit-based flashcard learning application built on these core principles:

- **Component-First Design**: UI elements are modular, reusable Svelte components
- **Centralized State Management**: Svelte stores manage all application state
- **Type-Safe Database**: Drizzle ORM with TypeScript for SQLite operations
- **Responsive & Accessible**: Mobile-friendly with keyboard navigation support
- **Minimal Dependencies**: Prioritizes built-in browser APIs over external libraries

## Project Structure

```
fastmem/
├── src/
│   ├── routes/                    # SvelteKit page routes & API endpoints
│   │   ├── +layout.svelte        # Root layout with navigation
│   │   ├── +layout.server.ts     # Session validation on app load
│   │   ├── +page.svelte          # Login page
│   │   ├── +error.svelte         # Error page (404, 500, etc)
│   │   ├── dashboard/            # Dashboard (set grid & management)
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   ├── study/[setId]/        # Study view for individual sets
│   │   │   ├── +page.svelte
│   │   │   └── +page.server.ts
│   │   └── api/                  # REST API endpoints
│   │       ├── auth/
│   │       │   └── login/+server.ts
│   │       ├── sets/
│   │       │   ├── +server.ts      (GET, POST)
│   │       │   └── [setId]/+server.ts (PUT, DELETE)
│   │       └── cards/
│   │           ├── +server.ts      (GET, POST)
│   │           └── [cardId]/+server.ts (PUT, DELETE)
│   │
│   ├── lib/
│   │   ├── components/            # Reusable Svelte components
│   │   │   ├── Button.svelte
│   │   │   ├── Modal.svelte
│   │   │   ├── LoginForm.svelte
│   │   │   ├── SetGrid.svelte
│   │   │   ├── SetCard.svelte
│   │   │   ├── SetForm.svelte
│   │   │   ├── FlipCard.svelte
│   │   │   ├── StudyCard.svelte
│   │   │   ├── CardForm.svelte
│   │   │   ├── CardEditor.svelte
│   │   │   └── SideMenu.svelte
│   │   │
│   │   ├── stores/                # Svelte stores (state management)
│   │   │   ├── session.ts
│   │   │   ├── sets.ts
│   │   │   └── cards.ts
│   │   │
│   │   ├── db/                    # Database layer
│   │   │   ├── schema.ts          # Drizzle schema definitions
│   │   │   ├── client.ts          # Database client
│   │   │   ├── init.ts            # Database initialization
│   │   │   └── queries/           # Database query functions
│   │   │       ├── users.ts
│   │   │       ├── sets.ts
│   │   │       └── cards.ts
│   │   │
│   │   ├── utils/                 # Utility functions
│   │   │   ├── api.ts             # API client wrapper
│   │   │   ├── errorHandler.ts    # Error response formatting
│   │   │   ├── sessionUtils.ts    # Session management
│   │   │   ├── gestures.ts        # Pointer event handling
│   │   │   ├── validation.ts      # Input validation
│   │   │   └── logger.ts          # Application logging
│   │   │
│   │   ├── types/                 # TypeScript type definitions
│   │   │   └── index.ts
│   │   │
│   │   └── styles/                # Global styles (minimal)
│   │       ├── app.css
│   │       └── animations.css
│   │
│   ├── app.html                   # HTML shell
│   ├── app.css                    # Global styles
│   └── hooks.server.ts            # Server-side hooks
│
├── data/                          # Database directory
│   └── fastmem.db                 # SQLite database
│
├── specs/                         # Feature specifications
│   └── 001-flashcard-crud/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       ├── research.md
│       ├── quickstart.md
│       ├── tasks.md
│       ├── checklists/
│       └── contracts/
│
├── DEVELOPMENT.md                 # Development guide
├── ARCHITECTURE.md                # This file
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Core Concepts

### 1. Components

Components are the building blocks of the UI. Each component is:
- **Atomic**: Self-contained with clear inputs (props) and outputs (events)
- **Reusable**: Used across multiple pages/contexts
- **Styled**: Scoped CSS keeps styles isolated
- **Accessible**: Semantic HTML, ARIA labels, keyboard support

Key components:

| Component | Purpose |
|-----------|---------|
| `Button` | Semantic button with variants (primary, secondary, danger) |
| `Modal` | Overlay dialog for forms and operations |
| `FlipCard` | 3D card with flip animation on click |
| `StudyCard` | Card with gesture detection for swipe interactions |
| `SetGrid` | Grid layout for displaying flashcard sets |
| `CardForm` | Form for creating/editing flashcards |
| `SideMenu` | Quick-access menu for study operations |

### 2. Stores (State Management)

Svelte stores centralize application state and business logic:

```typescript
// src/lib/stores/session.ts
export const sessionStore = writable({ userId: null, username: null });

// src/lib/stores/sets.ts
export const setsStore = writable({ sets: [], loading: false, error: null });

// src/lib/stores/cards.ts
export const cardsStore = writable({ cards: [], loading: false, error: null });
```

Stores handle:
- **API Communication**: Fetch, create, update, delete operations
- **State Updates**: Subscribe to changes across components
- **Error Handling**: Centralized error management
- **Persistence**: localStorage for session, database for data

### 3. Database Layer

The database architecture follows a clean separation:

```
Database Queries (typed with TypeScript)
    ↓
Drizzle ORM (type-safe operations)
    ↓
SQLite Database (local file-based)
```

**Schema** (src/lib/db/schema.ts):
- `users` - User accounts with password hashes
- `flashcard_sets` - Collections of cards
- `flashcards` - Individual question/answer pairs

**Queries** (src/lib/db/queries/):
- Reusable functions for CRUD operations
- Always verify user ownership for security
- Return typed results for safety

### 4. API Routes

API endpoints follow REST conventions:

```
POST   /api/auth/login               → Authenticate user
GET    /api/sets                     → List user's sets
POST   /api/sets                     → Create new set
PUT    /api/sets/[setId]             → Update set
DELETE /api/sets/[setId]             → Delete set
GET    /api/cards?setId=[id]         → List cards in set
POST   /api/cards                    → Create card
PUT    /api/cards/[cardId]           → Update card
DELETE /api/cards/[cardId]           → Delete card
```

All endpoints:
- Validate authentication via localStorage-backed session
- Verify user ownership of resources
- Return consistent JSON response format
- Include proper HTTP status codes

### 5. Data Flow

#### Login Flow
```
User Input (LoginForm)
    ↓
POST /api/auth/login
    ↓
Validate Credentials (Database Query)
    ↓
Return User + Session
    ↓
Store in localStorage & sessionStore
    ↓
Redirect to /dashboard
```

#### Study Flow
```
User Navigates to /study/[setId]
    ↓
Component mounts → Check session
    ↓
cardsStore.fetchCards(setId)
    ↓
GET /api/cards?setId=[id]
    ↓
Display FlipCard & gesture handlers
    ↓
User drags card (left/right gesture)
    ↓
Advance to next card
    ↓
On last card → Show completion
```

#### Add Card Flow
```
User clicks "Add Card" button
    ↓
SideMenu dispatches 'addCard' event
    ↓
Study page opens CardEditor Modal
    ↓
User fills form & submits
    ↓
CardEditor calls cardsStore.createCard()
    ↓
Store makes POST /api/cards request
    ↓
Card added to store & DOM updates
```

## Key Design Decisions

### 1. localStorage for Sessions
- Lightweight session management without server-side state
- Session sent as Bearer token in Authorization header
- Validated on API endpoints and app load

### 2. Client-Side Stores
- Svelte stores as single source of truth for app state
- Components subscribe to stores for reactive updates
- Reduces boilerplate and improves maintainability

### 3. Type Safety with TypeScript
- All database operations return typed results
- Components have strict prop types
- Errors caught at compile-time, not runtime

### 4. Minimal CSS
- No Tailwind or utility frameworks
- Vanilla CSS with CSS Grid/Flexbox
- Scoped component styles prevent conflicts

### 5. Pointer Events for Gestures
- Modern unified API for touch and mouse
- Simpler than separate touch/mouse handlers
- Better support for stylus and other pointers

## Performance Considerations

### Bundle Size
- Target: <200KB gzipped
- Achieved through minimal dependencies
- SvelteKit compiler strips unused code

### Animation Performance
- CSS-based animations (60 FPS)
- 3D transforms use GPU acceleration
- No JavaScript animation libraries

### Database Performance
- SQLite suitable for MVP (single device/user)
- Better-sqlite3 provides synchronous API
- Indexed queries for faster lookups

### Responsive Design
- Mobile-first CSS approach
- Flexbox and CSS Grid for layout
- Touch-friendly controls (48px minimum height)

## Security Considerations

### Authentication
- Passwords hashed with bcryptjs
- Default credentials only for development
- Session token expires on browser close

### Authorization
- User ownership verified on all operations
- DELETE operations cascade properly
- No direct ID access without ownership check

### Input Validation
- All user inputs validated on both client and server
- HTML entity escaping prevents XSS
- parameterized queries prevent SQL injection

## Testing

### Manual Testing
- Follow [quickstart.md](./specs/001-flashcard-crud/quickstart.md)
- Test login, create/edit/delete sets and cards
- Test drag gestures on study view
- Test on mobile devices

### Automated Testing
- Vitest for unit tests
- Svelte Testing Library for component tests
- Playwright for end-to-end tests (optional)

## Future Extensibility

### Phase 2 (Spaced Repetition)
- Add `lastReviewedAt` and `nextReviewAt` to flashcards
- Implement SRS algorithm in study store
- Update progress tracking

### Phase 3 (Statistics)
- Add `reviewCount` and `correctCount` tracking
- Create statistics dashboard
- Generate performance charts

### Phase 4 (Cloud Sync)
- Replace SQLite with server backend
- Add cloud persistence layer
- Implement multi-device sync

## Glossary

- **Component**: Reusable Svelte UI element
- **Store**: Svelte reactive state container
- **Route**: SvelteKit page or API endpoint
- **Query**: Database operation function
- **Gesture**: Pointer event interaction (drag, swipe)
- **Modal**: Overlay dialog component
- **Session**: User authentication state
- **Flashcard Set**: Collection of flashcards
- **Flashcard**: Single question/answer pair
