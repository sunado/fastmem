# Data Model: Flashcard CRUD & Study System

**Created**: 2026-04-26  
**Purpose**: Define entities, relationships, validation rules, and database schema

## Entity Definitions

### Entity 1: User

Represents a user account with authentication credentials.

**Purpose**: Authenticate users and associate data (sets, cards) with user accounts.

**Attributes**:
- `id` (integer, primary key, auto-increment): Unique identifier
- `username` (string, unique, max 50 chars): Login username; must be alphanumeric + underscore
- `password_hash` (string): Bcrypt hash of password (for production); plaintext "user" for MVP
- `created_at` (timestamp): Account creation date (ISO 8601 format)
- `updated_at` (timestamp): Last account modification date

**Validation Rules**:
- `username`: Required, 3-50 chars, alphanumeric + underscore only, must be unique
- `password_hash`: Required, non-empty

**Relationships**:
- One-to-Many with FlashcardSet (user has multiple sets)

**State Transitions**:
- Created on signup or app init (default user created automatically)
- Updated only when password changes (deferred to v2)

**Storage**: SQLite table `users`

---

### Entity 2: FlashcardSet

Represents a collection of flashcards organized by topic or subject.

**Purpose**: Organize flashcards into manageable groups; enable set-level CRUD operations.

**Attributes**:
- `id` (integer, primary key, auto-increment): Unique identifier
- `user_id` (integer, foreign key → User.id): Owner of the set
- `name` (string, max 100 chars): Set name (e.g., "Spanish Verbs", "Biology Chapter 3")
- `description` (string, max 500 chars, optional): Set description
- `card_count` (integer, computed from Flashcard.set_id): Number of cards in set (derived, not stored)
- `created_at` (timestamp): Set creation date
- `updated_at` (timestamp): Last modification date
- `deleted_at` (timestamp, optional): Soft delete timestamp (deferred to v2); NULL = active

**Validation Rules**:
- `name`: Required, 1-100 chars, non-empty
- `description`: Optional, max 500 chars
- `user_id`: Required, must reference valid User

**Relationships**:
- Many-to-One with User (via user_id)
- One-to-Many with Flashcard (set has multiple cards)

**State Transitions**:
- Created: User clicks "Add Set", enters name, set appears in dashboard
- Updated: User edits set name/description
- Deleted: User clicks delete; set and associated cards marked deleted (soft delete in v2)
- Published: Deferred to v3 (sharing, collaboration)

**Storage**: SQLite table `flashcard_sets`

---

### Entity 3: Flashcard

Represents a single question-answer pair within a flashcard set.

**Purpose**: Store learning content; track review progress.

**Attributes**:
- `id` (integer, primary key, auto-increment): Unique identifier
- `set_id` (integer, foreign key → FlashcardSet.id): Parent set
- `question` (string, max 500 chars): Question or prompt text
- `answer` (string, max 1000 chars): Answer or response text
- `position` (integer): Card order within set (0-indexed, managed by client)
- `review_status` (enum: 'pending', 'remembered', 'forgot'): Current review state in session
- `created_at` (timestamp): Card creation date
- `updated_at` (timestamp): Last modification date

**Validation Rules**:
- `question`: Required, 1-500 chars, non-empty
- `answer`: Required, 1-1000 chars, non-empty
- `set_id`: Required, must reference valid FlashcardSet
- `position`: Non-negative integer, unique within set (no duplicates)

**Relationships**:
- Many-to-One with FlashcardSet (via set_id)

**State Transitions**:
- Created: User clicks "Add Card" in study view or set editor, enters question/answer
- Updated: User clicks "Edit Card", modifies question/answer text
- Deleted: User clicks "Delete Card"; card removed from set
- Review Status: Updated during study session (pending → remembered OR forgot)
  - `pending`: Initial state, unused in v1 (no spaced rep)
  - `remembered`: Set when user drags card left
  - `forgot`: Set when user drags card right
  - Resets to `pending` on session restart (deferred: persistent tracking in v3)

**Storage**: SQLite table `flashcards`

---

### Entity 4: Session (Runtime Only, Not Persisted to DB)

Represents an active user session in the browser.

**Purpose**: Track authenticated user and current study context.

**Attributes**:
- `username` (string): Authenticated username
- `user_id` (integer): Reference to User entity (if stored in DB)
- `created_at` (ISO 8601 timestamp): Session start time
- `current_set_id` (integer, optional): Set being studied (null if on dashboard)
- `current_card_index` (integer): Current card position in set (0-indexed)
- `reviewed_count` (integer): Cards reviewed so far in session

**Validation Rules**:
- `username`: Required, must match authenticated user
- `created_at`: Required, ISO 8601 format
- All attributes must be non-null except `current_set_id`

**Persistence**: 
- Stored in browser `localStorage` (with `sessionStorage` during page session)
- Key: `fastmem_session`
- Format: JSON stringified
- Recovery: On app load, check localStorage for valid session; if expired (>24h), clear and redirect to login

**State Transitions**:
- Initialized: User logs in with correct credentials
- Updated: User navigates between dashboard and study mode, progresses through cards
- Cleared: User logs out (deferred to v2) or session expires

**Example JSON**:
```json
{
  "username": "user",
  "user_id": 1,
  "created_at": "2026-04-26T14:30:00Z",
  "current_set_id": 5,
  "current_card_index": 3,
  "reviewed_count": 3
}
```

---

## Relationships Summary

```
User (1) ──────────────────────────── (Many) FlashcardSet
         has                          belongs_to
         (user_id in flashcard_sets)


FlashcardSet (1) ──────────────────── (Many) Flashcard
                  contains             belongs_to
                  (set_id in flashcards)

Session: Runtime-only object
  - References: User (by username)
  - References: FlashcardSet (by current_set_id)
  - No database persistence
```

---

## Database Schema (Drizzle ORM)

**File**: `src/lib/db/schema.ts`

```typescript
import { sqliteTable, integer, text, timestamp } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(), // Plaintext "user" for MVP
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Flashcard sets table
export const flashcard_sets = sqliteTable('flashcard_sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Flashcards table
export const flashcards = sqliteTable('flashcards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  set_id: integer('set_id')
    .notNull()
    .references(() => flashcard_sets.id),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  position: integer('position').notNull().default(0),
  review_status: text('review_status')
    .notNull()
    .default('pending'), // 'pending', 'remembered', 'forgot'
  created_at: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
```

---

## TypeScript Type Definitions

**File**: `src/lib/types/index.ts`

```typescript
// User type
export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: string; // ISO 8601
  updated_at: string;
}

// FlashcardSet type
export interface FlashcardSet {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  card_count?: number; // Computed, not from DB
  created_at: string;
  updated_at: string;
}

// Flashcard type
export interface Flashcard {
  id: number;
  set_id: number;
  question: string;
  answer: string;
  position: number;
  review_status: 'pending' | 'remembered' | 'forgot';
  created_at: string;
  updated_at: string;
}

// Session type (runtime only)
export interface Session {
  username: string;
  user_id?: number;
  created_at: string; // ISO 8601
  current_set_id?: number;
  current_card_index: number;
  reviewed_count: number;
}
```

---

## Validation Rules Summary

| Entity | Field | Rule |
|--------|-------|------|
| User | username | Required, 3-50 chars, alphanumeric + `_`, unique |
| User | password_hash | Required, non-empty |
| FlashcardSet | name | Required, 1-100 chars, non-empty |
| FlashcardSet | description | Optional, max 500 chars |
| FlashcardSet | user_id | Required, FK → User.id |
| Flashcard | question | Required, 1-500 chars, non-empty |
| Flashcard | answer | Required, 1-1000 chars, non-empty |
| Flashcard | set_id | Required, FK → FlashcardSet.id |
| Flashcard | position | Non-negative, unique within set |
| Flashcard | review_status | Enum: 'pending', 'remembered', 'forgot' |

---

## State Machine: Flashcard Review Status

```
┌──────────────┐
│   pending    │ (initial state)
└──────┬───────┘
       │ User drags left OR right during study session
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌──────────────┐                     ┌──────────────┐
│ remembered   │                     │    forgot    │
└──────┬───────┘                     └──────┬───────┘
       │ Session ends                       │ Session ends
       └─────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │   pending    │ (reset on next session)
              └──────────────┘
```

---

## Migration Strategy (Future)

**For v1 (MVP)**: Create tables on app startup if they don't exist (via Drizzle Kit or manual SQL).

**For v2+**: Track schema changes with numbered migrations:
```
src/lib/db/migrations/
├── 001_init.sql         # Create users, flashcard_sets, flashcards
├── 002_add_soft_delete.sql
└── 003_add_review_history.sql
```

Run migrations on app startup via Drizzle Kit push command.

