import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// User table
export const users = sqliteTable('users', {
	id: integer('id').primaryKey().autoIncrement(true),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

// FlashcardSet table
export const flashcardSets = sqliteTable('flashcard_sets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

// Flashcard table
export const flashcards = sqliteTable('flashcards', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	setId: integer('set_id').notNull().references(() => flashcardSets.id, { onDelete: 'cascade' }),
	question: text('question').notNull(),
	answer: text('answer').notNull(),
	position: integer('position').notNull().default(0),
	remembered: integer('remembered', { mode: 'boolean' }).notNull().default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date())
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type FlashcardSet = typeof flashcardSets.$inferSelect;
export type NewFlashcardSet = typeof flashcardSets.$inferInsert;
export type Flashcard = typeof flashcards.$inferSelect;
export type NewFlashcard = typeof flashcards.$inferInsert;