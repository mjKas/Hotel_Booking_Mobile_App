# Backend issues found while fixing the mobile app

Checked against the deployed API at `https://royalcresthotel.online/api`
(`/openapi.json`, version 2.0) and the backend source in
`hotel-backend/hotelmanagement`. Note that the local backend checkout is
**older than the deployed one**: it has no `/auth/biometric/*` or
`/users/{id}/biometric` routes, so the deployed source should be the one that
gets these fixes.

The mobile app works around nothing below by faking data. Where it changed
behaviour, it is only to ask the server for fresh data or to explain a server
failure clearly.

---

## 1. Every Redis cache hit returns HTTP 500 (affects all cached GETs)

**Symptom.** `GET /rooms/`, `/rooms/{id}`, `/rooms/available`, `/room-types/`,
`/users/`, `/users/{id}`, `/reports/*` alternate between `200` and `500`:

```
GET /api/rooms/   -> 200  x-fastapi-cache: MISS
GET /api/rooms/   -> 500  text/plain "Internal Server Error"   (the HIT)
GET /api/rooms/   -H "Cache-Control: no-cache"  -> 200 every time
```

**Cause (very likely).** `app/main.py` creates the Redis client with
`decode_responses=True` and hands it to `fastapi_cache`'s `RedisBackend`.
fastapi-cache stores and reads encoded **bytes**; with `decode_responses=True`
Redis returns `str`, and decoding the cached value fails on every hit.

**Fix.**

```python
# app/main.py
redis = aioredis.from_url(settings.redis_url)   # no decode_responses=True
FastAPICache.init(RedisBackend(redis), prefix="hotel-cache")
```

(`get_redis()` in `dependencies.py` is only used for the booking lock and can
keep its own settings.)

**Mobile side.** The app now sends `Cache-Control: no-cache` on every GET,
which makes fastapi-cache skip the cache, so it always gets a 200.

## 2. `Cache-Control: max-age=3600` on mutable admin data

**Symptom.** After deleting a room or editing a user, the list on the phone
still showed the old data until the app was restarted.

**Cause.** `@cache(expire=3600)` also sends `Cache-Control: max-age=3600` and an
`ETag` to the client. iOS (NSURLCache) and Android (OkHttp) honour that header
and replay the cached list for up to an hour without contacting the server, so
the server-side `FastAPICache.clear(...)` after a write never reaches the phone.

**Fix (backend).** Do not cache per-user or admin data at the HTTP layer:
either drop `@cache` from `/users/*`, or send `Cache-Control: no-cache` /
`private, no-store` for those routes. Room lists can keep a short server-side
cache, but should still send `no-cache` (revalidate) rather than `max-age=3600`.

**Mobile side.** `src/api/apiClient.ts` sends `Cache-Control: no-cache` and
uses `cache: 'no-store'` on GETs, and every mutation hook patches the cached
list immediately (`src/hooks/queries.ts`).

## 3. `POST /rooms/` returns 500 (Add Room)

The request the app sends matches `RoomWriteRequest` exactly
(`room_number`, `floor`, `status`, `room_type_id`, `nightly_rate`,
`description`, authenticated as an admin), and the same handler logic works
for `PUT /rooms/{id}`. So the failure is inside the insert itself.

**Evidence.**

- `app/seed.py` inserts every seeded row with an **explicit id**
  (`Room(id=room_id, ...)`, `User(id=...)`, `Booking(id=...)`, ...).
- `requirements.txt` ships `psycopg`, i.e. the deployment uses PostgreSQL.
- On PostgreSQL, explicit ids do **not** advance the `SERIAL`/identity
  sequence, so the next `INSERT` gets id 1, 2, 3... and fails with
  `duplicate key value violates unique constraint "app_rooms_pkey"`. The
  unhandled `IntegrityError` becomes a 500.
- The live room list contains ids 1-13 only: **no room has ever been created
  successfully since seeding**, although rooms have been edited and deleted.
- Bookings show the same pattern having eventually "fixed itself": each failed
  insert still consumes a sequence value, so after enough failures the
  sequence passed the seeded ids (references now reach `AG-00024`).

Please confirm in the server log; the traceback should name `app_rooms_pkey`.

**Fix.**

1. One-off, on the production database:

   ```sql
   SELECT setval(pg_get_serial_sequence('app_rooms', 'id'),         COALESCE((SELECT MAX(id) FROM app_rooms), 1));
   SELECT setval(pg_get_serial_sequence('app_room_types', 'id'),    COALESCE((SELECT MAX(id) FROM app_room_types), 1));
   SELECT setval(pg_get_serial_sequence('app_users', 'id'),         COALESCE((SELECT MAX(id) FROM app_users), 1));
   SELECT setval(pg_get_serial_sequence('app_bookings', 'id'),      COALESCE((SELECT MAX(id) FROM app_bookings), 1));
   SELECT setval(pg_get_serial_sequence('app_payments', 'id'),      COALESCE((SELECT MAX(id) FROM app_payments), 1));
   ```

2. In `seed_database()`, run the same `setval` statements after
   `db.commit()` when the dialect is PostgreSQL (or stop passing explicit ids).
3. Optionally catch `IntegrityError` in `create_room` and return a 409, so a
   real duplicate never surfaces as a 500.

**Mobile side.** No workaround (none is possible from the client). The form
now shows "The server could not complete this request (error 500)" instead
of the bare "Internal Server Error", and the technical response is logged in
development builds.

## 4. Email address cannot be changed (no API support)

`ProfileUpdateRequest` (`PATCH /auth/me`) accepts only `full_name` and `phone`,
and `UserUpdateRequest` (`PUT /users/{id}`) only `full_name`, `phone`, `role`,
`status`, and `RequestModel` uses `extra="forbid"`, so sending `email` is
rejected with `422 Extra inputs are not permitted`. There is no way for the app
to save a new address. The app now shows the email as read-only with an
explanation instead of pretending.

**Backend change needed.**

- Add `email: EmailStr | None = None` to `ProfileUpdateRequest` and
  `UserUpdateRequest`.
- Normalise (`strip().lower()`), check uniqueness case-insensitively and
  return `409` with `field_errors.email` on a clash (same as `create_user`).
- For self-service changes, require `current_password` in the same request.
- Revoke the account's biometric credentials (biometric login is keyed on the
  email) and preferably the refresh sessions, so other devices sign in again.
- Return the updated `UserResponse`; the app already stores whatever comes back.

Once that exists, the mobile change is small: send `email` from
`authService.updateProfile` / `userService.update` and make the field editable.

## 5. Biometric enrolment for non-admin accounts

The mobile app previously offered biometrics only to administrators, and an
old code comment claimed the server "rejects anyone else". The deployed
backend source is not in this repository, so this cannot be confirmed either
way. The app is now role-agnostic: guests are offered enrolment after sign-up
and sign-in, and can manage it from **Security** in the drawer.

If `POST /auth/biometric/enroll` checks `role == "ADMIN"` (or uses
`require_admin`), switch it to `get_current_user`. The same applies to
`GET /auth/biometric/devices`, `DELETE /auth/biometric/devices/{id}` and
`DELETE /auth/biometric`. The app reports a 403 from enrolment as "The server
did not allow biometric sign-in for this account" rather than failing
silently. `/users/{id}/biometric` (admin reset) should stay admin-only but
work for accounts of any role.

## 6. Smaller observations

- `GET /users/` is cached with `_admin` (a `User` ORM object) and `db` in the
  key arguments, so cache keys depend on object `repr`s. Another reason not to
  cache that route.
- `create_booking` sends the confirmation email synchronously inside an async
  handler (already noted as a TODO in the code).
