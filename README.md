# NIAT Reviews — Frontend

Next.js frontend for **NIAT Q&A**: a platform where prospective students ask questions and **verified NIAT seniors** answer. Real experiences, real answers.

---

## Purpose

- **Prospective students** — Search and browse Q&A, read answers from verified seniors, ask new questions (auth required for asking).
- **Verified seniors** — Dashboard to see and answer questions, community feed, profile, and notifications.
- **Everyone** — Home hero with search, FAQ preview, explore categories/tags, read posts and threaded comments, view public profiles.

The app connects to a Django REST API for auth, Q&A, community (posts, comments, votes), notifications, and senior onboarding.

---

## How it works

1. **Auth** — Login and registration use **phone + OTP** (no password for login). User enters mobile number → receives SMS code → enters code to sign in or complete registration. JWT (access + refresh) is stored in `localStorage`; an Axios interceptor attaches the token and refreshes on 401.
2. **Home** — Guest or student: hero (“Real NIAT experiences. Real answers.”), search console, FAQ preview. Logged-in seniors are redirected to `/dashboard`.
3. **Q&A** — `/questions` lists questions; `/questions/[slug]` shows a question with answers and follow-up threads; `/ask` (auth required) to post a question.
4. **Community** — Posts (with categories/tags), post detail with comments and upvotes, create/edit post, trending, explore by category/tag.
5. **Profile & settings** — Profile view, edit profile, change/delete account; verified seniors have onboarding (review submission) and dashboard.
6. **Magic login** — Seniors can use a one-time link (`/auth/magic?token=...`) that exchanges the token for JWT and redirects to setup or dashboard.

---

## Tech stack

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 14 (App Router), React 18 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS; design tokens in `globals.css` (`--primary`, `--niat-section`, etc.) |
| **Data** | TanStack Query (React Query), Axios |
| **Forms** | React Hook Form, Zod |
| **Auth** | JWT in `localStorage`; refresh on 401; redirect to `/login` when unauthenticated |
| **Font** | Plus Jakarta Sans (`next/font/google`) |

---

## Project structure

```
src/
├── app/                    # App Router routes
│   ├── layout.tsx          # Root layout, font, providers, AppChrome
│   ├── page.tsx            # Home (hero, search, FAQ)
│   ├── login/              # Phone + OTP login
│   ├── register/           # Phone + OTP registration
│   ├── forgot-password/    # Reset password via phone OTP
│   ├── questions/          # Q&A list, [slug] detail
│   ├── ask/                # Ask a question (auth)
│   ├── dashboard/          # Senior dashboard
│   ├── search/             # Full-text search
│   ├── trending/           # Trending content
│   ├── community/          # Community entry
│   ├── categories/, tags/  # Explore by category/tag
│   ├── posts/              # Post list, [slug] detail/edit, comments
│   ├── create-post/        # Create post (auth)
│   ├── profile/, settings/ # User profile and account settings
│   ├── notifications/     # In-app notifications
│   ├── users/[username]/   # Public profile
│   ├── auth/               # magic (magic login), setup (password set)
│   └── onboarding/review/  # Senior onboarding review
├── components/             # Shared UI (AppChrome, Navbar, PostCard, Q&A, etc.)
├── context/                # AuthContext (role, setRoleFromProfile)
├── hooks/                  # Data hooks (posts, comments, search, notifications, etc.)
├── lib/
│   ├── api.ts              # Axios instance, all API calls (auth, OTP, Q&A, posts, etc.)
│   ├── auth.ts             # get/set/clear tokens, isAuthenticated
│   └── utils.ts            # API_BASE, cn()
└── types/                  # Shared TypeScript types
```

---

## Main pages

| Path | Description |
|------|-------------|
| `/` | Home: hero, search console, FAQ preview. Seniors → redirect to dashboard. |
| `/login` | Phone + OTP login (“Welcome back”). |
| `/register` | Phone + OTP verification then username/password/email. |
| `/forgot-password` | Reset password via phone OTP. |
| `/questions` | Q&A question list. |
| `/questions/[slug]` | Question detail, answers, follow-up threads. |
| `/ask` | Ask a question (auth required). |
| `/dashboard` | Senior dashboard (verified seniors). |
| `/search` | Full-text search (questions, posts, etc.). |
| `/trending` | Trending content. |
| `/community` | Community feed entry. |
| `/categories`, `/categories/[slug]` | Categories list and category feed. |
| `/tags`, `/tags/[slug]` | Tags list and tag feed. |
| `/posts/[slug]` | Post detail, comments, upvotes. |
| `/create-post` | Create post (auth). |
| `/profile`, `/profile/settings` | Profile and account settings. |
| `/notifications` | Notifications list. |
| `/users/[username]` | Public user profile. |
| `/auth/magic` | Magic login callback (token in query). |
| `/auth/setup` | Set password (e.g. after magic login). |
| `/onboarding/review` | Senior onboarding review submission. |

---

## Auth flow (phone + OTP)

- **Login:** Enter phone → “Send OTP” (backend checks phone is registered) → Enter 4-digit code → “Log in” → `POST /api/auth/login/phone/` with `{ phone, code }` → JWT returned → tokens stored, profile fetched, redirect.
- **Register:** Enter phone → “Send OTP” (backend checks phone is not already registered) → Verify OTP → Fill username, password, optional email → Submit → `POST /api/auth/register/` → then auto-login with username/password.
- **Forgot password:** Phone → Send OTP → Verify OTP → New password → `POST /api/auth/forgot-password/reset/`.

All API calls use the same Axios instance; 401 triggers token refresh or redirect to `/login`.

---

## Environment

| Variable | Description |
|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL (e.g. `http://localhost:8000`). API requests go to `{API_BASE}/api/`. Leave empty when using a unified proxy. |

---

## Setup and run

```bash
# Copy env and set backend URL if needed
cp .env.local.example .env.local
# Edit NEXT_PUBLIC_API_BASE_URL (default empty; use http://localhost:8000 for local Django)

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Ensure the Django backend is running at `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000`).

**Windows (PowerShell)** — clean reinstall:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

**Build for production:**

```bash
npm run build
npm start
```

---

## Design tokens (colors)

Defined in `src/app/globals.css` under `:root`:

- **Primary:** `#991b1b` (maroon) — buttons, links, focus.
- **Section/navbar:** `#fbf2f3`, `#fff8eb` — cards, nav.
- **Text:** `#1e293b`; secondary `rgba(30, 41, 59, 0.7)`; borders `rgba(30, 41, 59, 0.1)`.
- **Hero gradient:** `--hero-from` / `--hero-to`.
- **Accents:** yellow/orange for highlights.

Tailwind uses these via `tailwind.config.ts` (e.g. `primary`, `niat-section`, `niat-text`).

---

## Related

- **Backend** — Django API; see repo root `docs/IMPLEMENTATION.md` and `backend/docs/` for API and auth details.
- **Seniors frontend** — Separate Next.js app (e.g. port 3002) for senior registration/verification flows.
