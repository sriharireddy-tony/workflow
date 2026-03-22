# Sample API responses

Base URL: `http://localhost:4000/api`

## POST /auth/register — 201

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tenant": {
      "id": "65f1a1b1c2d3e4f5a6b7c8d9",
      "name": "Acme Corp",
      "code": "ACME"
    },
    "user": {
      "id": "65f1a1b1c2d3e4f5a6b7c8da",
      "email": "owner@acme.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "SUPER_ADMIN"
    }
  }
}
```

## POST /auth/login — 200

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "65f1a1b1c2d3e4f5a6b7c8da",
      "email": "owner@acme.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "SUPER_ADMIN",
      "tenantId": "65f1a1b1c2d3e4f5a6b7c8d9"
    }
  }
}
```

## GET /users — 200 (paginated)

```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1...",
      "tenantId": "65f1...",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "owner@acme.com",
      "role": "SUPER_ADMIN",
      "status": "ACTIVE",
      "createdAt": "2025-03-21T10:00:00.000Z",
      "updatedAt": "2025-03-21T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

## GET /dashboard/project/:projectId/summary — 200

```json
{
  "success": true,
  "data": {
    "projectId": "65f1...",
    "totalTasks": 42,
    "tasksByStatus": {
      "TODO": 10,
      "IN_PROGRESS": 20,
      "IN_REVIEW": 5,
      "DONE": 6,
      "BLOCKED": 1
    },
    "totalMembers": 8
  }
}
```

## Validation error — 400

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "path": "email", "message": "\"email\" must be a valid email" }
  ]
}
```
