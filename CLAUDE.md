# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

No test suite is configured.

## Environment Variables

Create a `.env` file at the project root. All variables must use the `VITE_` prefix:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

The Supabase client (`src/lib/supabase.js`) also accepts `VITE_SUPABASE_PUBLISHABLE_KEY` as a fallback for the key.

## Architecture

**Zamzara** is a decoration business portfolio app — a React + Vite SPA backed by Supabase.

### Page routing

There is no router library. `App.jsx` manages a `currentPage` state string (`"user"` | `"home"` | `"admin"`) and conditionally renders one of three page components. A debug bar at the top switches between pages — this is intended to be replaced with real navigation before production.

- **User** (`src/pages/User.jsx`) — public-facing view: fetches published posts, supports category filtering and search
- **Home** (`src/pages/Home.jsx`) — nearly identical to User but includes an internal banner; likely a staging/preview variant
- **Admin** (`src/pages/Admin.jsx`) — unauthenticated admin panel for creating posts and updating social media links from the `settings` table

### Data flow

All data comes from Supabase. Components fetch directly — there is no shared state layer or context.

- `posts`: `id`, `title`, `description`, `category`, `image_url`, `location_url`, `published`, `created_at`
- `post_reactions`: `id`, `post_id`, `reaction_type` (`"like"` | `"love"`)
- `post_comments`: `id`, `post_id`, `author_name`, `comment`, `created_at`
- `settings`: single row (`id=1`) with `instagram_url`, `facebook_url`, `tiktok_url`, `whatsapp_url`, `about_button_url`

### Component hierarchy

```
App
├── User / Home
│   ├── Navbar (search bar + ThemeToggle)
│   ├── CategoryMenu (client-side filter state)
│   ├── PostCard (per post)
│   │   ├── ReactionsBar (fetches + inserts to post_reactions)
│   │   └── CommentsBox (fetches + inserts to post_comments)
│   └── Sidebar (hardcoded social links as static data)
└── Admin (standalone, no shared layout)
```

### Filtering

Category and search filtering in User/Home is done entirely client-side after fetching all published posts. The `activeCategory` and `searchText` states live in the page component and are passed down to `CategoryMenu` and `Navbar` respectively.

### Styling

All styles live in `src/styles/global.css` using CSS custom properties (`:root` variables). Dark mode is toggled by adding the `.dark` class to `.app` — dark mode overrides are declared as `.app.dark` selectors in the same file. Fonts are loaded from Google Fonts (Comfortaa, Fredoka, Bubblegum Sans).

### Known limitations

- The Admin page has no authentication — it is accessible to anyone who navigates to it.
- `Sidebar.jsx` has social media URLs hardcoded as static data. The Admin page manages social links in the `settings` table, but Sidebar does not read from it.
- The `top-debug` navigation bar in `App.jsx` is a development artifact.
- Reactions are anonymous and unlimited — any visitor can react multiple times.
- The event categories list is hardcoded in `Admin.jsx`; adding a new category requires editing the component.
