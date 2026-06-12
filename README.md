# Node Blog API

A RESTful blog API built with Node.js, Express, and PostgreSQL. Supports user authentication, avatar uploads, posts, comments, and likes — with Redis-backed caching and rate limiting.

## Tech Stack

- **Runtime**: Node.js 20 (ESM)
- **Framework**: Express 5
- **Database**: PostgreSQL 16
- **Cache / Rate limiting**: Redis 7 (ioredis + rate-limit-redis)
- **File uploads**: Multer + Cloudinary
- **Auth**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Logging**: Pino + pino-http
- **Testing**: Vitest + Supertest
- **Containerization**: Docker + Docker Compose

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the values in `.env`:

| Variable                  | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `NODE_ENV`                | `development`, `test`, or `production`         |
| `PORT`                    | Port the server listens on (default: 5000)     |
| `DB_HOST`                 | PostgreSQL host                                |
| `DB_PORT`                 | PostgreSQL port                                |
| `DB_NAME`                 | Database name                                  |
| `DB_USER`                 | Database user                                  |
| `DB_PASSWORD`             | Database password                              |
| `JWT_SECRET`              | Secret key for signing JWTs                    |
| `JWT_EXPIRES_IN`          | JWT expiry duration (e.g. `7d`)                |
| `REDIS_HOST`              | Redis host (default: `localhost`)              |
| `REDIS_PORT`              | Redis port (default: `6379`)                   |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name                          |
| `CLOUDINARY_API_KEY`      | Cloudinary API key                             |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret                          |

### 3. Initialize the database

```bash
psql -U <DB_USER> -d <DB_NAME> -f init.sql
```

### 4. Start the development server

```bash
npm run dev
```

The server starts with hot-reload on `http://localhost:3000`.

## Running with Docker

```bash
docker compose up --build
```

This starts three services:
- **app** — the API server on port `5000`
- **db** — PostgreSQL 16 with persistent storage, auto-initialized from `init.sql`
- **redis** — Redis 7 on port `6379`

Configure credentials in `.env.production` before running.

## Running Tests

```bash
npm test
```

Tests use a separate `.env.test` environment and run against a real database.

## API Reference

All routes are prefixed with `/api/v1`.

### Authentication

Protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### Auth

| Method | Path                | Auth | Description                        |
| ------ | ------------------- | ---- | ---------------------------------- |
| `POST` | `/auth/register`    | —    | Register a new user                |
| `POST` | `/auth/login`       | —    | Login and receive a JWT            |
| `GET`  | `/auth/me`          | auth | Get the authenticated user profile |
| `POST` | `/auth/me/avatar`   | auth | Upload a profile avatar image      |

#### `POST /auth/me/avatar`

Accepts `multipart/form-data` with a single `image` field. Max file size: **5 MB**. The previous avatar is automatically deleted from Cloudinary when a new one is uploaded.

### Users

| Method   | Path               | Auth          | Description              |
| -------- | ------------------ | ------------- | ------------------------ |
| `GET`    | `/users`           | admin         | List all users           |
| `POST`   | `/users`           | admin         | Create a user            |
| `GET`    | `/users/activity`  | admin         | Get user activity stats  |
| `GET`    | `/users/:id`       | admin         | Get user by ID           |
| `PATCH`  | `/users/:id`       | owner / admin | Update user              |
| `DELETE` | `/users/:id`       | admin         | Delete user              |

### Posts

| Method   | Path               | Auth          | Description                                  |
| -------- | ------------------ | ------------- | -------------------------------------------- |
| `GET`    | `/posts`           | —             | List posts (paginated, filterable, sortable) |
| `POST`   | `/posts`           | auth          | Create a post                                |
| `GET`    | `/posts/me`        | auth          | Get the authenticated user's posts           |
| `GET`    | `/posts/trending`  | —             | Get trending posts                           |
| `GET`    | `/posts/:id`       | —             | Get post by ID                               |
| `PATCH`  | `/posts/:id`       | owner / admin | Update post                                  |
| `DELETE` | `/posts/:id`       | owner / admin | Delete post                                  |

#### `GET /posts` Query Parameters

| Parameter      | Type             | Description                                                                                                              |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `page`         | number           | Page number (default: `1`)                                                                                               |
| `limit`        | number           | Results per page (default: `5`)                                                                                          |
| `sort_by`      | string           | Field to sort by. Prefix with `-` for descending. Options: `created_at`, `title`, `total_likes`, `updated_at`, `author` |
| `search`       | string           | Search by title or content                                                                                               |
| `is_published` | `true` / `false` | Filter by published status                                                                                               |
| `user_id`      | UUID             | Filter by author                                                                                                         |

### Comments

| Method   | Path                     | Auth          | Description             |
| -------- | ------------------------ | ------------- | ----------------------- |
| `GET`    | `/comments?post_id=<id>` | —             | Get comments for a post |
| `POST`   | `/comments`              | auth          | Add a comment to a post |
| `PATCH`  | `/comments/:id`          | owner / admin | Update a comment        |
| `DELETE` | `/comments/:id`          | owner / admin | Delete a comment        |

### Health

| Method | Path      | Description                     |
| ------ | --------- | ------------------------------- |
| `GET`  | `/health` | Health check — returns `200 OK` |

## Database Schema

| Table      | Description                                                           |
| ---------- | --------------------------------------------------------------------- |
| `users`    | User accounts with roles (`user`, `admin`), avatar URL and public ID |
| `posts`    | Blog posts linked to a user                                           |
| `comments` | Comments on posts linked to a user                                    |
| `likes`    | Many-to-many between users and posts                                  |
