# API Contract: Flashcards

**Endpoints**: GET/POST `/api/cards`, GET/PUT/DELETE `/api/cards/[cardId]`  
**Purpose**: Manage individual flashcard CRUD operations within sets

## GET /api/cards?setId=[setId] - List Set's Cards

**Method**: `GET`  
**Query Parameters**:
- `setId`: Required, integer ID of the parent set

**Response (Success)**:

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "cards": [
    {
      "id": 1,
      "set_id": 1,
      "question": "What is the Spanish word for 'to be'?",
      "answer": "ser (permanent) / estar (temporary)",
      "position": 0,
      "review_status": "pending",
      "created_at": "2026-04-20T10:00:00Z",
      "updated_at": "2026-04-20T10:00:00Z"
    },
    {
      "id": 2,
      "set_id": 1,
      "question": "Conjugate 'ser' in present tense for 'yo'",
      "answer": "soy",
      "position": 1,
      "review_status": "pending",
      "created_at": "2026-04-20T10:05:00Z",
      "updated_at": "2026-04-20T10:05:00Z"
    }
  ]
}
```

**Implementation**:
```typescript
export async function GET({ url, locals }) {
  if (!locals.session) return json({ success: false }, { status: 401 });
  
  const setId = url.searchParams.get('setId');
  if (!setId) return json({ success: false, error: 'Missing setId' }, { status: 400 });
  
  // Verify user owns this set
  const set = await db.select().from(flashcard_sets)
    .where(and(eq(flashcard_sets.id, parseInt(setId)), eq(flashcard_sets.user_id, locals.session.user_id)));
  
  if (!set.length) return json({ success: false, error: 'Unauthorized' }, { status: 403 });
  
  // Get cards ordered by position
  const cards = await db.select()
    .from(flashcards)
    .where(eq(flashcards.set_id, parseInt(setId)))
    .orderBy(flashcards.position);
  
  return json({ success: true, cards });
}
```

---

## POST /api/cards - Create Card

**Method**: `POST`  
**Content-Type**: `application/json`

**Body**:
```json
{
  "set_id": 1,
  "question": "What is photosynthesis?",
  "answer": "Process by which plants convert light into chemical energy",
  "position": 15
}
```

**Validation**:
- `set_id`: Required, integer, must reference valid set owned by user
- `question`: Required, 1-500 chars, non-empty
- `answer`: Required, 1-1000 chars, non-empty
- `position`: Optional, non-negative integer; defaults to end of set

**Response (Success)**:

**Status Code**: `201 Created`

**Body**:
```json
{
  "success": true,
  "card": {
    "id": 16,
    "set_id": 1,
    "question": "What is photosynthesis?",
    "answer": "Process by which plants convert light into chemical energy",
    "position": 15,
    "review_status": "pending",
    "created_at": "2026-04-26T16:00:00Z",
    "updated_at": "2026-04-26T16:00:00Z"
  }
}
```

**Implementation**:
```typescript
export async function POST({ request, locals }) {
  if (!locals.session) return json({ success: false }, { status: 401 });
  
  const { set_id, question, answer, position } = await request.json();
  
  // Validate inputs
  if (!question || question.length < 1 || question.length > 500) {
    return json({ success: false, error: 'Invalid question' }, { status: 400 });
  }
  if (!answer || answer.length < 1 || answer.length > 1000) {
    return json({ success: false, error: 'Invalid answer' }, { status: 400 });
  }
  
  // Verify set ownership
  const set = await db.select().from(flashcard_sets)
    .where(and(eq(flashcard_sets.id, set_id), eq(flashcard_sets.user_id, locals.session.user_id)));
  
  if (!set.length) return json({ success: false, error: 'Unauthorized' }, { status: 403 });
  
  // Default position to end of set if not provided
  let finalPosition = position;
  if (finalPosition === undefined) {
    const maxPos = await db.select({ max: max(flashcards.position) })
      .from(flashcards)
      .where(eq(flashcards.set_id, set_id));
    finalPosition = (maxPos[0]?.max ?? -1) + 1;
  }
  
  const result = await db.insert(flashcards).values({
    set_id,
    question,
    answer,
    position: finalPosition,
    review_status: 'pending'
  }).returning();
  
  return json({ success: true, card: result[0] }, { status: 201 });
}
```

---

## GET /api/cards/[cardId] - Get Card Details

**Method**: `GET`

**Parameters**:
- `cardId`: Integer, ID of the card

**Response (Success)**:

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "card": {
    "id": 1,
    "set_id": 1,
    "question": "What is the Spanish word for 'to be'?",
    "answer": "ser (permanent) / estar (temporary)",
    "position": 0,
    "review_status": "pending",
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-20T10:00:00Z"
  }
}
```

---

## PUT /api/cards/[cardId] - Update Card

**Method**: `PUT`  
**Content-Type**: `application/json`

**Body**:
```json
{
  "question": "Updated question",
  "answer": "Updated answer",
  "position": 5
}
```

**Response (Success)**:

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "card": {
    "id": 1,
    "set_id": 1,
    "question": "Updated question",
    "answer": "Updated answer",
    "position": 5,
    "review_status": "pending",
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-26T16:30:00Z"
  }
}
```

**Implementation**:
```typescript
export async function PUT({ params, request, locals }) {
  if (!locals.session) return json({ success: false }, { status: 401 });
  
  const { cardId } = params;
  const { question, answer, position } = await request.json();
  
  // Verify user owns the set containing this card
  const card = await db.select()
    .from(flashcards)
    .where(eq(flashcards.id, parseInt(cardId)));
  
  if (!card.length) return json({ success: false, error: 'Not found' }, { status: 404 });
  
  const set = await db.select().from(flashcard_sets)
    .where(and(eq(flashcard_sets.id, card[0].set_id), eq(flashcard_sets.user_id, locals.session.user_id)));
  
  if (!set.length) return json({ success: false, error: 'Unauthorized' }, { status: 403 });
  
  const updated = await db.update(flashcards)
    .set({ 
      question: question ?? card[0].question,
      answer: answer ?? card[0].answer,
      position: position ?? card[0].position,
      updated_at: new Date().toISOString()
    })
    .where(eq(flashcards.id, parseInt(cardId)))
    .returning();
  
  return json({ success: true, card: updated[0] });
}
```

---

## DELETE /api/cards/[cardId] - Delete Card

**Method**: `DELETE`

**Response (Success)**:

**Status Code**: `204 No Content`

**Implementation**:
```typescript
export async function DELETE({ params, locals }) {
  if (!locals.session) return json({ success: false }, { status: 401 });
  
  const { cardId } = params;
  
  // Verify ownership (similar to PUT)
  const card = await db.select().from(flashcards)
    .where(eq(flashcards.id, parseInt(cardId)));
  
  if (!card.length) return json({ success: false, error: 'Not found' }, { status: 404 });
  
  const set = await db.select().from(flashcard_sets)
    .where(and(eq(flashcard_sets.id, card[0].set_id), eq(flashcard_sets.user_id, locals.session.user_id)));
  
  if (!set.length) return json({ success: false, error: 'Unauthorized' }, { status: 403 });
  
  // Delete card
  await db.delete(flashcards).where(eq(flashcards.id, parseInt(cardId)));
  
  return new Response(null, { status: 204 });
}
```

---

## PUT /api/cards/[cardId]/review - Update Review Status

**Method**: `PUT`  
**Content-Type**: `application/json`

**Purpose**: Mark card as remembered or forgot during study session

**Body**:
```json
{
  "review_status": "remembered"
}
```

**Accepted Values**:
- `"remembered"`: User dragged card left
- `"forgot"`: User dragged card right
- `"pending"`: Reset status (for restarting session)

**Response (Success)**:

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "card": {
    "id": 1,
    "set_id": 1,
    "question": "What is the Spanish word for 'to be'?",
    "answer": "ser (permanent) / estar (temporary)",
    "position": 0,
    "review_status": "remembered",
    "created_at": "2026-04-20T10:00:00Z",
    "updated_at": "2026-04-26T16:45:00Z"
  }
}
```

**Note**: Review status resets to `pending` when a new study session begins; not persistent across sessions in v1 (deferred to v3 spaced repetition tracking).

---

## Error Responses

**401 Unauthorized**: No valid session
**403 Forbidden**: User does not own the set
**404 Not Found**: Card does not exist
**400 Bad Request**: Invalid input data

---

## Future Enhancements

- **Reordering**: Endpoint to batch update card positions
- **Bulk operations**: Create/delete multiple cards at once
- **Review history**: Track all reviews per card (timestamps, user response)
- **Statistics**: Endpoint returning card difficulty, review count, success rate

