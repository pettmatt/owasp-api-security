## API endpoints

**POST /api/auth/register**

```json
{ email: "test@example.com", "password": "somepass12"}
```

**POST /api/auth/login**

```json
{ email: "test@example.com", "password": "somepass12"}
```

**POST /api/auth/refresh**

**POST /api/auth/logout**

**GET /api/users/user**

Requires: `Authorization: Bearer <accessToken>`

**GET /api/users/:id**

Requires auth with admin role.

**GET /health**
