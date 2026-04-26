# API Contract: Flashcard Sets

**Endpoints**: GET/POST `/api/sets`, GET/PUT/DELETE `/api/sets/[setId]`  
**Purpose**: Manage flashcard set CRUD operations

## GET /api/sets - List User's Sets

**Method**: `GET`  
**Headers**: Requires valid session (check `localStorage.fastmem_session`)

**Query Parameters**: None

**Response (Success)**:

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "sets": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Spanish Verbs",
      "description": "Common Spanish verbs conjugation",
      "card_count": 15,
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-26T14:00:00Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "name": "Biology Chapter 3",
      "description": null,
      "card_count": 23,
      "created_at": "2026-04-22T11:30:00Z",
      "updated_at": "2026-04-22T11:30:00Z"
    }
  ]
}
```

**Implementation**:
```typescript
export async function GET({ locals }) {
  // Check session
  if (!locals.session) return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  
  // Query sets for user
  const sets = await db.select()
    .from(flashcard_sets)
    .where(eq(flashcard_sets.user_id, locals.session.user_id));
  
  // Count cards per set
  const enriched = await Promise.all(sets.map(async (set) => ({
    ...set,
    card_count: await db.select({ count: count() })
      .from(flashcards)
      .where(eq(flashcards.set_id, set.id))
  })));
  
  return json({ success: true, sets: enriched });
}
```

---

## POST /api/sets - Create Set

**Method**: `POST`  
**Content-Type**: `application/json`

**Body**:
```json
{
  "name": "New Set",
  "description": "Optional description"
}
```

**Validation**:
- `name`: Required, 1-100 chars, non-empty
- `description`: Optional, max 500 chars

**Response (Success)**:

**Status Code**: `201 Created`

**Body**:
```json
{
  "success": true,
  "set": {
    "id": 3,
    "user_id": 1,
    "name": "New Set",
    "description": "Optional description",
    "card_count": 0,
    "created_at": "2026-04-26T15:00:00Z",
    "updated_at": "2026-04-26T15:00:00Z"
  }
}
```

**Implementation**:
```typescript
export async function POST({ request, locals }) {
  if (!locals.session) return json({ success: false }, { status: 401 });
  
  const { name, description } = await request.json();
  
  if (!name || name.length < 1 || name.length > 100) {
    return json({ success: false, error: 'Invalid name' }, { status: 400 });
  }
  
  const result = await db.insert(flashcard_sets).values({
    user_id: locals.session.user_id,
    name,
    description
  }).returning();
  
  return json({ success: true, set: { ...result[0], card_count: 0 } }, { status: 201 });
}
```

---

## GET /api/sets/[setId] - Get Set Details

**Method**: `GET`

**Parameters**:
- `setId`: Integer, ID of the set

**Response (Success)**:

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "set": {
    "id": 1,
    "user_id": 1,
    "name": "Spanish Verbs",
    "description": "Common Spanish verbs",
    "card_count": 15,
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-26T14:00:00Z"
  }
}
```

---

## PUT /api/sets/[setId] - Update Set

**Method**: `PUT`  
**Content-Type**: `application/json`

**Body**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response (Success)**:

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "set": {
    "id": 1,
    "user_id": 1,
    "name": "Updated Name",
    "description": "Updated description",
    "card_count": 15,
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-26T15:30:00Z"
  }
}
```

**Implementation**:
```typescript
export async function PUT({ params, request, locals }) {
  if (!locals.session) return json({ success: false }, { status: 401 });
  
  const { setId } = params;
  const { name, description } = await request.json();
  
  // Verify ownership
  const set = await db.select().from(flashcard_sets)
    .where(and(eq(flashcard_sets.id, parseInt(setId)), eq(flashcard_sets.user_id, locals.session.user_id)));
  
  if (!set.length) return json({ success: false, error: 'Not found' }, { status: 404 });
  
  const updated = await db.update(flashcard_sets)
    .set({ name, description, updated_at: new Date().toISOString() })
    .where(eq(flashcard_sets.id, parseInt(setId)))
    .returning();
  
  return json({ success: true, set: updated[0] });
}
```

---

## DELETE /api/sets/[setId] - Delete Set

**Method**: `DELETE`

**Response (Success)**:

**Status Code**: `204 No Content` (or `200 OK` with success message)

**Body**: (empty or `{ "success": true }`)

**Implementation**:
```typescript
export async function DELETE({ params, locals }) {
  if (!locals.session) return json({ success: false }, { status: 401 });
  
  const { setId } = params;
  
  // Verify ownership
  const set = await db.select().from(flashcard_sets)
    .where(and(eq(flashcard_sets.id, parseInt(setId)), eq(flashcard_sets.user_id, locals.session.user_id)));
  
  if (!set.length) return json({ success: false, error: 'Not found' }, { status: 404 });
  
  // Delete associated cards first (or use CASCADE on foreign key)
  await db.delete(flashcards).where(eq(flashcards.set_id, parseInt(setId)));
  
  // Delete set
  await db.delete(flashcard_sets).where(eq(flashcard_sets.id, parseInt(setId)));
  
  return new Response(null, { status: 204 });
}
```

---

## Error Responses

**401 Unauthorized** (No valid session):
```json
{ "success": false, "error": "Unauthorized" }
```

**404 Not Found** (Set does not exist):
```json
{ "success": false, "error": "Set not found" }
```

**400 Bad Request** (Invalid input):
```json
{ "success": false, "error": "Invalid request data" }
```

---

## Future Enhancements

- **Pagination**: Add `limit` and `offset` query params for large set lists
- **Search**: Filter sets by name prefix
- **Soft delete**: Add `deleted_at` timestamp instead of hard delete
- **Set sharing**: Public/private flags, share codes for collaboration

