# Tasks: Flashcard CRUD & Study System

**Input**: Design documents from `specs/001-flashcard-crud/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅  
**Tests**: Not requested - implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4])
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan: `src/routes/`, `src/lib/`, `src/lib/components/`, `src/lib/db/`, `src/lib/stores/`, `data/`
- [ ] T002 Initialize SvelteKit + Vite project with TypeScript: `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `package.json`
- [ ] T003 [P] Configure TypeScript strict mode and path aliases in `tsconfig.json`
- [ ] T004 [P] Configure ESLint and Prettier in `.eslintrc.cjs` and `.prettierrc`
- [ ] T005 Install core dependencies: Drizzle ORM, better-sqlite3, Svelte testing libraries

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Drizzle schema definitions in `src/lib/db/schema.ts`: User, FlashcardSet, Flashcard entities
- [x] T007 Create database initialization script in `src/lib/db/init.ts`: Create tables, seed default user (user/user)
- [x] T008 [P] Setup database connection in `src/lib/db/client.ts` using better-sqlite3
- [x] T009 [P] Create base layout component `src/routes/+layout.svelte`: Navigation structure, session check
- [x] T010 [P] Create layout server script `src/routes/+layout.server.ts`: Session validation on app load
- [x] T011 Create Svelte store for session in `src/lib/stores/session.ts`: writable store for user/session state
- [x] T012 [P] Create utility function for session validation in `src/lib/utils/sessionUtils.ts`
- [x] T013 [P] Create error handling utility in `src/lib/utils/errorHandler.ts`: standardized error responses
- [x] T014 Create base API response utility in `src/lib/utils/api.ts`: JSON response wrapper function
- [x] T015 [P] Create Button component in `src/lib/components/Button.svelte`: reusable semantic button
- [x] T016 [P] Create Modal component in `src/lib/components/Modal.svelte`: reusable modal dialog
- [x] T017 Create npm scripts in `package.json`: `dev`, `build`, `preview`, `db:init`, `db:migrate`

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication (Priority: P1) 🎯 MVP ✅ COMPLETE

**Goal**: Enable secure user login with default credentials, establishing session management for subsequent features

**Independent Test**: Navigate to login page, enter credentials (user/user), verify redirect to dashboard and session persistence

### Implementation for User Story 1

- [x] T018 [P] [US1] Create User entity queries in `src/lib/db/queries/users.ts`: getUserByUsername, createUser, verifyPassword
- [x] T019 [US1] Implement login endpoint `src/routes/api/auth/login/+server.ts`: POST endpoint accepting username/password, returning user + session
- [x] T020 [US1] Implement session store update in `src/lib/stores/session.ts`: save session to localStorage after login
- [x] T021 [P] [US1] Create LoginForm component in `src/lib/components/LoginForm.svelte`: username/password input fields, login button, error display
- [x] T022 [US1] Create login page `src/routes/+page.svelte`: display LoginForm, redirect to /dashboard on success
- [x] T023 [US1] Implement login server action in `src/routes/+page.server.ts`: handle form submission, call API
- [x] T024 [US1] Add session validation middleware in `src/routes/+layout.server.ts`: redirect to login if no valid session
- [x] T025 [P] [US1] Create logout functionality in `src/lib/utils/sessionUtils.ts`: clear session from localStorage and redirect

**Checkpoint**: ✅ User Story 1 complete - users can log in with default credentials and maintain session

---

## Phase 4: User Story 2 - Flashcard Set Management (Priority: P1) ✅ COMPLETE

**Goal**: Enable users to view, create, update, and delete flashcard sets in a dashboard grid layout

**Independent Test**: Create a new set via dashboard form, verify it appears in grid, edit its name, delete it, confirm it's removed

### Implementation for User Story 2

- [x] T026 [P] [US2] Create FlashcardSet entity queries in `src/lib/db/queries/sets.ts`: getSetsByUser, getSetById, createSet, updateSet, deleteSet, getCardCountForSet
- [x] T027 [P] [US2] Implement GET /api/sets endpoint in `src/routes/api/sets/+server.ts`: return all sets for authenticated user with card counts
- [x] T028 [P] [US2] Implement POST /api/sets endpoint in `src/routes/api/sets/+server.ts`: create new set, validate name, return created set
- [x] T029 [P] [US2] Implement PUT /api/sets/[setId]/+server.ts endpoint: update set name/description, verify user ownership
- [x] T030 [P] [US2] Implement DELETE /api/sets/[setId]/+server.ts endpoint: delete set and associated cards, verify user ownership
- [x] T031 [US2] Create sets Svelte store in `src/lib/stores/sets.ts`: writable store with fetchSets, createSet, updateSet, deleteSet methods
- [x] T032 [P] [US2] Create SetCard component in `src/lib/components/SetCard.svelte`: display set name, card count, edit/delete buttons
- [x] T033 [P] [US2] Create SetGrid component in `src/lib/components/SetGrid.svelte`: grid layout of SetCard components (2+ columns responsive)
- [x] T034 [P] [US2] Create SetForm component in `src/lib/components/SetForm.svelte`: input fields for set name/description, submit button, validation
- [x] T035 [US2] Create dashboard page `src/routes/dashboard/+page.svelte`: display SetGrid, SetForm for adding new sets, load sets on mount
- [x] T036 [US2] Create dashboard server script `src/routes/dashboard/+page.server.ts`: fetch sets and pass to page component
- [x] T037 [US2] Implement set edit modal in `src/lib/components/SetCard.svelte`: show SetForm in Modal on edit button click

**Checkpoint**: ✅ User Story 2 complete - users can manage flashcard sets with full CRUD operations

---

## Phase 5: User Story 3 - Flashcard Study View (Priority: P2)

**Goal**: Enable users to study flashcards with flip animations and drag gesture recognition for marking progress

**Independent Test**: Enter study view for a set with cards, verify first card displays, click to flip (see question then answer), drag left (verify it's marked remembered and next card appears)

### Implementation for User Story 3

- [x] T038 [P] [US3] Create Flashcard entity queries in `src/lib/db/queries/cards.ts`: getCardsBySet, getCardById, createCard, updateCard, deleteCard, updateReviewStatus
- [x] T039 [P] [US3] Implement GET /api/cards?setId=[id] endpoint in `src/routes/api/cards/+server.ts`: return cards for set ordered by position, verify user owns set
- [x] T040 [P] [US3] Implement POST /api/cards endpoint in `src/routes/api/cards/+server.ts`: create card in set, validate question/answer non-empty, auto-assign position
- [x] T041 [P] [US3] Implement PUT /api/cards/[cardId]/+server.ts endpoint: update card question/answer, verify user ownership
- [x] T042 [P] [US3] Implement DELETE /api/cards/[cardId]/+server.ts endpoint: delete card from set, verify user ownership
- [x] T043 [US3] Create cards Svelte store in `src/lib/stores/cards.ts`: writable store with fetchCards, createCard, updateCard, deleteCard, updateReviewStatus methods
- [x] T044 [P] [US3] Create gesture detection utility in `src/lib/utils/gestures.ts`: pointerdown/pointermove/pointerup handlers, drag delta calculation (50px threshold for left/right)
- [x] T045 [P] [US3] Create FlipCard component in `src/lib/components/FlipCard.svelte`: CSS 3D flip animation using transform rotateY, toggle flipped state on click
- [x] T046 [P] [US3] Create StudyCard component in `src/lib/components/StudyCard.svelte`: display Flashcard with FlipCard, attach gesture handlers, emit cardRemembered/cardForgot events
- [x] T047 [US3] Create study view page `src/routes/study/[setId]/+page.svelte`: fetch cards for set, display current StudyCard, handle cardRemembered/cardForgot events (advance to next card or show completion)
- [x] T048 [US3] Create study view server script `src/routes/study/[setId]/+page.server.ts`: verify user owns set before rendering study view
- [x] T049 [US3] Implement study session tracking in store: maintain current card index, track reviewed count, handle completion state

**Checkpoint**: User Story 3 complete - users can study flashcards with animations and gesture-based progress tracking

---

## Phase 6: User Story 4 - Flashcard Menu Operations (Priority: P2)

**Goal**: Provide in-context access to add, edit, and delete flashcards while studying without leaving study view

**Independent Test**: While in study view, open side menu, add a new card, verify it appears at end of set, edit existing card, delete a card, verify changes persist

### Implementation for User Story 4

- [x] T050 [P] [US4] Create CardForm component in `src/lib/components/CardForm.svelte`: input fields for question/answer, submit button, validation (non-empty fields)
- [x] T051 [P] [US4] Create CardEditor component in `src/lib/components/CardEditor.svelte`: display CardForm in edit or add mode, call store methods on submit
- [x] T052 [P] [US4] Create SideMenu component in `src/lib/components/SideMenu.svelte`: menu buttons for Add Card, Edit Card, Delete Card with icon/text
- [x] T053 [US4] Integrate SideMenu into study view `src/routes/study/[setId]/+page.svelte`: display menu, show/hide CardEditor modal on button clicks
- [x] T054 [US4] Implement Add Card flow: SideMenu → CardEditor → create card via store → append to cards list → reset form
- [x] T055 [US4] Implement Edit Card flow: SideMenu → CardEditor (pre-fill current card) → update card via store → update display
- [x] T056 [US4] Implement Delete Card flow: SideMenu → confirm dialog → delete via store → advance to next card or show message if last card deleted
- [x] T057 [US4] Add position management in `src/lib/db/queries/cards.ts`: reorder cards when one is deleted to maintain sequential position

**Checkpoint**: User Story 4 complete - users can manage flashcards without leaving study view

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validations affecting multiple user stories

- [x] T058 [P] Create environment configuration file `.env.example`: DATABASE_URL, NODE_ENV examples
- [x] T059 [P] Add validation helpers in `src/lib/utils/validation.ts`: username format, set name length, card question/answer non-empty checks
- [x] T060 [P] Add logging utility in `src/lib/utils/logger.ts`: log auth events, CRUD operations, errors (prepend timestamp, level)
- [x] T061 Implement 404 error page `src/routes/+error.svelte`: handle missing routes gracefully
- [ ] T062 [P] Add CSS base styles in `src/routes/+layout.svelte`: reset styles, set font family/sizes, define color variables (optional: already styled)
- [ ] T063 [P] Test responsive design: verify grid displays 2+ columns on desktop, 1 column on mobile (manual test)
- [ ] T064 [P] Verify keyboard accessibility: Tab navigation through buttons/inputs, Enter to submit, Escape to close modals (manual test)
- [ ] T065 Test localStorage persistence: verify session survives page refresh, sets/cards survive browser restart (manual test)
- [ ] T066 Run quickstart.md validation: follow setup → login → create set → add cards → study → verify no errors (manual test)
- [ ] T067 Verify Lighthouse performance score ≥90: run build, test bundle size <200KB gzipped (manual test)
- [x] T068 [P] Create DEVELOPMENT.md: guide for running dev server, debugging, database inspection
- [x] T069 [P] Create ARCHITECTURE.md: overview of components, stores, routes, database schema
- [ ] T070 Add error boundary in `src/routes/+layout.svelte`: catch and display errors gracefully (optional: handled via +error.svelte)

**Checkpoint**: Polish complete - application is production-ready for MVP release

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - Phase 3 & 4 (P1 stories) should be prioritized as MVP
  - Phase 5 & 6 (P2 stories) can follow after P1 stories are stable
- **Polish (Phase 7)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Auth)**: Can start after Foundational phase → Required by all other stories (users must login)
- **User Story 2 (P1 - Sets)**: Can start after User Story 1 complete → Independent; sets require authenticated user
- **User Story 3 (P2 - Study)**: Can start after User Story 2 complete → Requires sets to exist before studying
- **User Story 4 (P2 - Menu)**: Can start after User Story 3 complete → Requires study view before adding menu operations

### Within Each User Story

- Entity queries created before API endpoints
- API endpoints created before Svelte stores
- Stores created before components
- Components displayed in pages/routes
- Tests (if included) would run before implementation, ensuring they fail initially

### Parallel Opportunities

- **Phase 1**: All [P] tasks (T003, T004) can run in parallel - different files
- **Phase 2**: All [P] tasks (T008, T010, T012-T017) can run in parallel - different files, no dependencies
- **Phase 3**: T018, T021 (entity queries + component) can run in parallel; others sequential due to dependency on API endpoint
- **Phase 4**: T026, T027, T028, T029, T030 (entity + all API endpoints) can run in parallel; components follow
- **Phase 5**: T038, T039, T040, T041, T042 (entity + all API endpoints) can run in parallel; components follow
- **Phase 6**: T050, T051, T052 (components) can run in parallel; integration follows
- **Phase 7**: All [P] tasks can run in parallel - documentation, styling, accessibility improvements

---

## Parallel Example: Phase 4 (User Story 2)

```
Parallel Batch 1 (entity + API endpoints):
- T026: Create FlashcardSet queries
- T027: Implement GET /api/sets
- T028: Implement POST /api/sets
- T029: Implement PUT /api/sets/[setId]
- T030: Implement DELETE /api/sets/[setId]

Parallel Batch 2 (store + components):
- T031: Create sets store
- T032: Create SetCard component
- T033: Create SetGrid component
- T034: Create SetForm component

Sequential:
- T035: Create dashboard page (depends on SetGrid + SetForm)
- T036: Create dashboard server script
- T037: Implement edit modal
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. **Setup**: Complete Phase 1 (Project initialization)
2. **Foundational**: Complete Phase 2 (Database, session, base components)
3. **User Story 1**: Complete Phase 3 (Authentication)
4. **User Story 2**: Complete Phase 4 (Set CRUD)
5. **STOP and VALIDATE**: Users can login, create/edit/delete sets
6. **Deploy**: Release MVP with core feature set

### Full Feature Delivery (All 4 User Stories)

1. Complete Phases 1-2 (Setup + Foundational)
2. Add User Stories 1-2 (MVP features)
3. Add User Stories 3-4 (Study + Menu features)
4. Complete Phase 7 (Polish)
5. Deploy: Full flashcard application

### Incremental Delivery Schedule

- **Sprint 1**: Phases 1-2 + User Story 1 (foundation + login)
- **Sprint 2**: User Story 2 (set management)
- **Sprint 3**: User Story 3 (study view)
- **Sprint 4**: User Story 4 (menu operations)
- **Sprint 5**: Phase 7 (polish, testing, documentation)

Each sprint delivers independently testable value that can be deployed.

---

## Task Execution Checklist

**Before Starting**:
- [ ] Verify Node.js v18+ installed
- [ ] Verify Git is configured (email/username set)
- [ ] Verify you have edit access to `/home/dev/project/fastmem`

**After Each Phase**:
- [ ] All tasks in phase marked complete
- [ ] Code compiles without errors
- [ ] No TypeScript strict mode violations
- [ ] Linting passes (eslint)
- [ ] Formatting passes (prettier)
- [ ] Commit changes with clear message

**After Each User Story**:
- [ ] Story is independently testable
- [ ] Manual test checklist from "Independent Test" section passes
- [ ] No console errors or warnings
- [ ] Session/data persists as expected

**Before Deploying**:
- [ ] All Phases 1-7 complete (or stop at desired MVP checkpoint)
- [ ] Lighthouse score ≥90
- [ ] Bundle size <200KB gzipped
- [ ] Quick start guide validated

---

## Notes

- Each task has a specific file path for clarity and to prevent conflicts
- [P] = parallelizable tasks with different files and no dependencies
- [US1-4] = user story labels for traceability and independent delivery
- Entity queries created in `src/lib/db/queries/` for reusability across endpoints and stores
- Components are atomic and reusable (Button, Modal, Form patterns repeated)
- Stores centralize business logic and API calls; components focus on UI
- Routes keep server/client logic separate (SvelteKit convention)
- All timestamps use ISO 8601 format for consistency
