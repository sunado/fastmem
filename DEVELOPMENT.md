# FastMem Development Guide

## Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- SQLite (included with better-sqlite3)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Initialize the database**:
   ```bash
   npm run db:init
   ```
   
   This creates the SQLite database and seeds a default user (username: `user`, password: `user`).

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Available Commands

- **`npm run dev`** - Start the development server with hot module reload
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview the production build locally
- **`npm run db:init`** - Initialize database and seed default user
- **`npm run lint`** - Run ESLint to check code quality
- **`npm run format`** - Format code with Prettier

## Default Credentials

For development/testing:
- **Username**: `user`
- **Password**: `user`

These credentials are seeded into the database on first initialization.

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the project structure, components, and data flow.

## Database

The application uses SQLite with Drizzle ORM. The database file is stored at `data/fastmem.db`.

### Key Tables

- **users** - User accounts with hashed passwords
- **flashcard_sets** - Collections of flashcards
- **flashcards** - Individual cards with question/answer pairs

To inspect the database:
```bash
sqlite3 data/fastmem.db
```

## Development Workflow

1. **Component Development**:
   - Create new components in `src/lib/components/`
   - Use scoped styles (CSS in component files)
   - Keep components small and reusable

2. **Store Updates**:
   - Update stores in `src/lib/stores/` for state management
   - Stores handle API communication and local state
   - Use TypeScript for type safety

3. **API Routes**:
   - Add new endpoints in `src/routes/api/`
   - Follow RESTful conventions (GET, POST, PUT, DELETE)
   - Include proper error handling and validation

4. **Database Queries**:
   - Add query functions in `src/lib/db/queries/`
   - Use Drizzle ORM for type-safe database operations
   - Always verify user ownership for sensitive operations

## Debugging

### Browser DevTools
- Open DevTools (F12) to inspect components and network requests
- Check localStorage for session data: `fastmem_session`

### Server Logs
- Logs appear in the terminal running `npm run dev`
- Use the logging utility for application-wide logging

### Database Inspection
```bash
sqlite3 data/fastmem.db
sqlite> .tables
sqlite> SELECT * FROM flashcard_sets;
```

## Performance

- Monitor bundle size: `npm run build` shows gzipped size
- Target: <200KB gzipped
- Use Chrome DevTools Lighthouse for performance audits

## Code Style

The project uses:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety

Run checks:
```bash
npm run lint       # Check code style
npm run format     # Auto-format code
```

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will increment to the next available port.

### Database Locked
If you get a "database is locked" error:
1. Close the dev server
2. Delete `data/fastmem.db`
3. Run `npm run db:init` to reinitialize

### Session Issues
If you can't log in:
1. Clear browser cache and localStorage
2. Open DevTools → Application → Local Storage → Clear fastmem_session
3. Restart the dev server

## Useful Resources

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Svelte Documentation](https://svelte.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
