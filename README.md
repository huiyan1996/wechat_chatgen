# ChatGen

Nuxt 4 application with MongoDB authentication.

## Features

- Login and register pages
- JWT auth stored in HTTP-only cookies
- Route middleware for guest and authenticated areas
- Default route redirects to `/login` or `/dashboard`
- App layout with topbar for authenticated pages

## Requirements

- Node.js 22+
- MongoDB running locally or a remote connection string

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB URI and JWT secret.

4. Start the development server:

```bash
npm run dev
```

## Routes

| Route | Access |
| --- | --- |
| `/` | Redirects to login or dashboard |
| `/login` | Guest only |
| `/register` | Guest only |
| `/dashboard` | Authenticated only |

## API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Current user
