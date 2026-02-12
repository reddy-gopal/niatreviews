# NIATReviews — Community Portal (Next.js)

Frontend for prospective students: feed, posts, threaded comments, upvotes, auth.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- React Query, Axios, React Hook Form + Zod
- JWT in localStorage; optional httpOnly cookie later

## Setup

```bash
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_BASE_URL if needed (default http://localhost:8000)

npm install
npm run dev
```

**PowerShell (Windows):** To remove `node_modules` and reinstall:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

*(In CMD you would use `rmdir /s /q node_modules`.)*

Open [http://localhost:3000](http://localhost:3000). Ensure the Django API is running at `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000`).

## Pages

- `/` — Home feed (paginated)
- `/posts/[id]` — Post detail + threaded comments
- `/categories/[slug]` — Filtered feed by category
- `/tags/[slug]` — Filtered feed by tag
- `/login`, `/register` — Auth
- `/create-post` — Create post (auth required)
- `/profile`, `/notifications` — Placeholders (auth required)

## Env

- `NEXT_PUBLIC_API_BASE_URL` — Backend base URL (e.g. `http://localhost:8000`). API paths are under `/api/`.
