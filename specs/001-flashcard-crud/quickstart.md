# Quickstart: Flashcard CRUD & Study System

**Created**: 2026-04-26  
**Purpose**: Setup, development, testing, and deployment instructions

## Prerequisites

- **Node.js**: Version 18+ (check with `node --version`)
- **npm**: Version 8+ (included with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended (includes SvelteKit extensions)

## Installation

### 1. Clone Repository & Install Dependencies

```bash
cd /path/to/fastmem
npm install
```

This installs:
- `svelte`, `@sveltejs/kit`, `vite` (framework)
- `drizzle-orm`, `better-sqlite3` (database)
- `vitest`, `svelte/testing` (testing)
- `typescript`, `eslint`, `prettier` (tooling)

**Expected output**:
```
added 200+ packages in 30s
```

### 2. Initialize Database

On first run, the database schema is created automatically when the app starts. To manually initialize:

```bash
npm run db:migrate
```

This creates `data/flashcards.db` (SQLite file) and initializes tables.

**Tables created**:
- `users` (default user: username=`user`, password=`user`)
- `flashcard_sets`
- `flashcards`

## Development

### 3. Start Development Server

```bash
npm run dev
```

**Expected output**:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 in your browser.

### 4. Login

- **Username**: `user`
- **Password**: `user`

You're now on the dashboard (grid view of flashcard sets).

### 5. Create a Flashcard Set

1. Click "Add New Set" button
2. Enter set name: `"Biology Chapter 3"`
3. Click "Create"
4. Set appears in grid

### 6. Add Flashcards

1. Click on the set to enter study view
2. Click "Add Card" in the side menu
3. Enter:
   - **Question**: `"What is photosynthesis?"`
   - **Answer**: `"Process by which plants convert light into chemical energy"`
4. Click "Save"
5. Repeat to add more cards

### 7. Study Cards

1. Ensure set has at least one card
2. Click the card to flip (shows question first, then answer)
3. Drag card:
   - **Left**: Mark as "Remembered"
   - **Right**: Mark as "Forgot"
4. Next card appears automatically
5. Complete set to return to dashboard

### Development Workflow

**File Watching**: Vite automatically recompiles on file changes

**Code Changes**:
- Modify component in `src/lib/components/`
- Modify route in `src/routes/`
- Modify store in `src/lib/stores/`
- Browser hot-reloads (preserves page state)

**Database Changes**:
- Modify schema in `src/lib/db/schema.ts`
- Run `npm run db:migrate` to apply changes
- Database file reset: `rm data/flashcards.db && npm run db:migrate`

## Testing

### Unit Tests

Test stores and utilities:

```bash
npm run test:unit
```

**Test files** in `tests/unit/`:
- `stores/*.test.ts` (store behavior)
- `utils/*.test.ts` (helpers, validation)

**Example test**:
```typescript
import { describe, it, expect } from 'vitest';
import { authStore } from '$lib/stores/auth';

describe('authStore', () => {
  it('initializes with null user', () => {
    let user;
    authStore.subscribe(value => user = value);
    expect(user).toBeNull();
  });
});
```

### Component Tests

Test UI components:

```bash
npm run test:components
```

**Test files** in `tests/components/`:
- `LoginForm.test.ts`
- `SetGrid.test.ts`
- `StudyCard.test.ts`

**Example test**:
```typescript
import { render, screen } from 'svelte/testing';
import LoginForm from '$lib/components/LoginForm.svelte';

it('renders login form', () => {
  render(LoginForm);
  expect(screen.getByLabelText('Username')).toBeDefined();
  expect(screen.getByLabelText('Password')).toBeDefined();
});
```

### Run All Tests

```bash
npm run test
```

**Coverage Report**:
```bash
npm run test:coverage
```

Generates HTML report in `coverage/` directory.

### Integration Tests (Optional)

End-to-end workflows with Playwright (optional in v1):

```bash
npm run test:e2e
```

## Build for Production

### 8. Build Static Site

```bash
npm run build
```

**Output**: `build/` directory with static files (HTML, CSS, JS)

**Bundle size check**:
```bash
npm run build -- --analyze
```

Opens bundle analyzer (verify <200KB gzipped).

### 9. Preview Production Build

```bash
npm run preview
```

Runs production bundle locally on http://localhost:4173

### 10. Run Lighthouse Audit

```bash
npm run lighthouse
```

Opens Lighthouse report in browser. Target scores:
- **Performance**: ≥90
- **Accessibility**: ≥90
- **Best Practices**: ≥90
- **SEO**: ≥90 (optional)

## Project Structure

```
src/
├── routes/               # SvelteKit pages
│   ├── +page.svelte     # Login page
│   └── dashboard/+page.svelte
├── lib/
│   ├── components/      # Reusable Svelte components
│   ├── stores/          # Svelte stores (state management)
│   ├── db/              # Database layer (Drizzle)
│   ├── utils/           # Helpers (auth, gestures, validation)
│   └── types/           # TypeScript interfaces
├── app.html             # HTML shell
└── app.css              # Global styles

tests/
├── unit/                # Store and utility tests
├── components/          # Component tests
└── integration/         # End-to-end tests

data/
└── flashcards.db        # SQLite database (git-ignored)

Configuration:
├── svelte.config.js     # SvelteKit config
├── vite.config.ts       # Vite build config
├── tsconfig.json        # TypeScript config
├── drizzle.config.ts    # Database config
├── .eslintrc.json       # Linter config
└── package.json         # Dependencies and scripts
```

## Troubleshooting

### Port 5173 Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Database Corrupted

```bash
rm data/flashcards.db
npm run dev
```

Database recreated on next app start.

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests Failing

```bash
# Run tests with verbose output
npm run test -- --reporter=verbose
```

## Common Tasks

### Add New Component

1. Create `src/lib/components/MyComponent.svelte`
2. Export TypeScript props:
   ```svelte
   <script lang="ts">
     export let title: string;
   </script>
   ```
3. Import and use in pages/other components:
   ```svelte
   <script>
     import MyComponent from '$lib/components/MyComponent.svelte';
   </script>
   <MyComponent title="Hello" />
   ```

### Add New Route

1. Create directory in `src/routes/my-route/`
2. Create `+page.svelte` (or `+page.server.ts` for API)
3. Accessible at `/my-route`

### Add Database Column

1. Modify schema in `src/lib/db/schema.ts`
2. Create migration file in `src/lib/db/migrations/`
3. Run `npm run db:migrate`

### Modify Styles

- Component styles: Edit `<style>` block in `.svelte` file (scoped)
- Global styles: Edit `src/app.css` (use sparingly)
- No CSS framework (Tailwind, Bootstrap) to keep bundle small

## Performance Tips

- **Code-splitting**: SvelteKit automatically splits code per route
- **Lazy loading**: Use dynamic imports for heavy components
- **CSS-only animations**: Avoid JavaScript animation libraries
- **Bundle analysis**: Run `npm run build -- --analyze` frequently

## Next Steps

1. **Create first flashcard set** (see Development → Step 5)
2. **Run tests** (`npm run test`) to verify setup
3. **Read Constitution** (`FastMem Constitution v1.0.0`) for architecture principles
4. **Start implementing** features from `plan.md`

## Documentation Links

- **Architecture**: See [plan.md](plan.md) for project structure and design decisions
- **Data Model**: See [data-model.md](data-model.md) for entity definitions
- **API Contracts**: See [contracts/](contracts/) for endpoint specifications
- **Feature Spec**: See [spec.md](spec.md) for user stories and requirements
- **Research**: See [research.md](research.md) for technology decisions

## Support

For issues, questions, or contributions:
1. Check this Quickstart guide
2. Review relevant documentation linked above
3. Check test files for usage examples
4. Review component source code for patterns

