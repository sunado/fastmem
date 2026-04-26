<!--
# Sync Impact Report

## Version Change
Initial Constitution: 1.0.0

## Modified Principles
- Initial setup: 5 core principles established

## Added Sections
- Technology Stack & Architecture
- Development Standards
- Core Principles (5 principles)

## Templates Requiring Updates
- ✅ Constitution created at 1.0.0
- ⚠ plan-template.md - review for alignment with principles
- ⚠ spec-template.md - review for UI/UX requirements
- ⚠ tasks-template.md - review for component-based categorization

## Follow-up TODOs
- None at this time
-->

# FastMem Constitution

## Core Principles

### I. Component-First Architecture

Every feature is built as a reusable Svelte component. Components must be:
- Self-contained with clear props and event handlers
- Independently styled with scoped CSS
- Testable in isolation with proper mocking
- Documented with usage examples

Monolithic pages are prohibited; instead, compose from smaller components to maximize reusability across flashcard sets, cards, and UI layouts.

### II. User-Centric Interaction Design

The interface prioritizes smooth, responsive user interactions:
- Card flip animations must be fluid and performant (60 FPS target)
- Drag gestures for card sorting (left = remembered, right = forgotten) MUST be intuitive with clear visual feedback
- Touch and mouse input equally supported
- Loading states and error messages clearly visible
- Accessibility requirements: keyboard navigation, ARIA labels, sufficient color contrast

Interactive features are core to the learning experience and must never feel sluggish.

### III. Progressive Enhancement

The application builds core functionality first, then enhances with advanced features:
- Phase 1 (MVP): Static flashcard sets, manual card navigation, basic styling
- Phase 2: Drag interactions, flip animations, local storage persistence
- Phase 3: Spaced repetition algorithm, statistics tracking, export/import
- Phase 4: Collaboration, cloud sync, multi-device support

Each phase must not break existing functionality; features added incrementally with backward compatibility.

### IV. Data Persistence & State Management

All user progress MUST be persisted:
- Local storage as default (browser IndexedDB or localStorage API)
- Clear distinction between session state and persistent data
- Data export capability for user autonomy
- Conflict resolution strategy documented if multi-device sync is introduced

State mutations must be predictable and auditable; Svelte stores are the single source of truth.

### V. Performance & Accessibility Standards

The application must prioritize performance and inclusivity:
- Lighthouse score ≥90 for performance, accessibility, and best practices
- Bundle size < 200KB gzipped (measured at build time)
- All interactive elements keyboard accessible (Tab, Enter, Escape)
- Semantic HTML required; no divs as buttons
- WCAG 2.1 AA compliance minimum for color contrast and text sizing

Build-time optimizations via Vite are mandatory; code-splitting for large feature sets.

## Technology Stack & Architecture

**Frontend Framework**: SvelteKit (latest stable)
**Build Tool**: Vite
**Styling**: Scoped CSS with optional Tailwind CSS
**State Management**: Svelte stores (writable, readable, derived)
**Testing**: Vitest + Svelte Testing Library (component tests required)
**Deployment**: Static site generation (SvelteKit adapter-static) or Node.js adapter for future backend integration

**Project Structure**:
```
src/
├── lib/
│   ├── components/     # Reusable Svelte components
│   ├── stores/         # Svelte stores (cards, sets, progress)
│   ├── utils/          # Helper functions, gesture handling
│   └── types/          # TypeScript interfaces (Card, Set, etc.)
├── routes/             # SvelteKit page routes
└── app.css             # Global styles
```

## Development Standards

**Code Quality**:
- TypeScript enforced (strict mode)
- ESLint + Prettier for consistency
- No console.log in production; use proper logging or remove
- Comments required for non-obvious logic

**Testing Requirements**:
- Unit tests for stores and utility functions (≥80% coverage)
- Component tests for all interactive components (flip, drag)
- Integration tests for user workflows (create set → add cards → practice)
- No feature merge without passing tests

**Git Workflow**:
- Feature branches from main with naming: `feature/<name>`
- All commits reference related issues or features
- Squash commits before merge to keep history clean
- Semantic commit messages: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`

**Documentation**:
- README.md with setup, development, and build instructions
- Inline JSDoc for exported functions and components
- ARCHITECTURE.md explaining state flow and component hierarchy
- DEVELOPMENT.md with contributing guidelines

## Governance

This constitution supersedes all other practices and guidelines. Amendments require:
1. Documented rationale and impact analysis
2. Discussion and consensus from the development team
3. Version bump (semantic versioning) with changelog entry
4. Migration plan if principles affect existing code

**Compliance Verification**:
- Pull request reviews must verify alignment with Core Principles
- Architecture decisions must justify against Constitution
- Performance benchmarks measured against stated standards
- Accessibility audits required for new interactive features

Version bump rules:
- **MAJOR**: Principle removal or redefinition (e.g., change in primary framework)
- **MINOR**: New principle or section added; material expansion of guidance
- **PATCH**: Clarifications, wording improvements, corrected examples

This Constitution serves as the source of truth for project governance and all engineering practices should be derived from these principles.

**Version**: 1.0.0 | **Ratified**: 2026-04-26 | **Last Amended**: 2026-04-26
