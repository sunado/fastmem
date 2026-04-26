# API Contract: Authentication

**Endpoint**: POST `/api/auth/login`  
**Purpose**: Authenticate user with credentials and establish session

## Request

**Method**: `POST`  
**Content-Type**: `application/json`

**Body**:
```json
{
  "username": "user",
  "password": "user"
}
```

**Validation**:
- `username`: Required, string, 3-50 chars
- `password`: Required, string, non-empty

**Example cURL**:
```bash
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"user"}'
```

## Response (Success)

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "user"
  },
  "session": {
    "username": "user",
    "user_id": 1,
    "created_at": "2026-04-26T14:30:00Z",
    "current_set_id": null,
    "current_card_index": 0,
    "reviewed_count": 0
  }
}
```

**Side Effects**:
- Session stored in browser `localStorage` with key `fastmem_session`
- User redirected to `/dashboard` (client-side navigation via SvelteKit)

---

## Response (Failure)

**Status Code**: `401 Unauthorized`

**Body**:
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Possible Errors**:
- `"Invalid credentials"`: Username not found or password incorrect
- `"Username required"`: Missing username in request
- `"Password required"`: Missing password in request

---

## Implementation Notes

**Server Route**: `src/routes/api/auth/login.ts` (SvelteKit server action or API route)

**MVP Login Logic**:
```typescript
export async function POST({ request }) {
  const { username, password } = await request.json();
  
  // Validate input
  if (!username || !password) {
    return json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
  
  // Check credentials (MVP: simple check)
  if (username === 'user' && password === 'user') {
    const user = { id: 1, username: 'user' };
    const session = {
      username,
      user_id: user.id,
      created_at: new Date().toISOString(),
      current_set_id: null,
      current_card_index: 0,
      reviewed_count: 0
    };
    return json({ success: true, user, session });
  } else {
    return json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }
}
```

**Client-Side Handler** (in login form component):
```typescript
async function handleLogin(e) {
  const { username, password } = formData;
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (res.ok) {
    const { user, session } = await res.json();
    // Store session in localStorage
    localStorage.setItem('fastmem_session', JSON.stringify(session));
    // Update store
    sessionStore.set(session);
    // Navigate to dashboard
    goto('/dashboard');
  } else {
    // Show error message
  }
}
```

---

## Future Enhancements (v2+)

- **Password hashing**: Use bcrypt in production (replace plaintext check)
- **Multi-user**: Query database for user records instead of hardcoded check
- **Logout endpoint**: Clear session and localStorage
- **Token refresh**: JWT-based token expiry and refresh logic
- **Password reset**: Email verification, reset link handling

