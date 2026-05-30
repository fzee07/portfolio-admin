# Portfolio Admin App

A small React (Vite) single-page app for editing your portfolio content. It talks
to the [backend](../backend) admin API and lets you change everything the public
site shows — profile, objectives, skills, contact, experience, projects,
education, certifications, testimonials — with changes saved straight to MongoDB
and live instantly. No commits, no redeploys.

## Stack

React 18 · Vite · React Router · JWT stored in `localStorage`. Monochrome
"control-panel" design (Geist / Geist Mono).

## Local setup

```bash
npm install
cp .env.example .env        # set VITE_API_URL to your backend URL
npm run dev                 # http://localhost:5173
```

`.env`:
```
VITE_API_URL=http://localhost:3000
```
(For production, set this to your deployed backend, e.g. `https://your-api.vercel.app`.)

Sign in with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` you set when seeding the
backend.

## How it works

- **Singletons** (Profile, Objectives, Skills, Contact) load one document, edit
  in place, and `PUT` the whole document on save.
- **Collections** (Experience, Projects, Education, Certifications, Testimonials)
  use a master/detail view — pick an item to edit, or create a new one. Items keep
  their numeric `id`.
- Section-level fields (experience `totalYears` / `summary`, project `categories`)
  live in a shared **meta** document and are edited from the Experience and
  Projects pages respectively.
- Project **metrics** and **links** are free-form key/value editors, so any keys
  your projects use are preserved.

## Build & deploy to Vercel

```bash
npm run build      # outputs dist/
```

1. Push this `admin-app/` folder to a repo and import it in Vercel (framework:
   **Vite**).
2. Set the env var `VITE_API_URL` to your deployed backend URL.
3. Deploy. `vercel.json` rewrites all routes to `index.html` for client-side
   routing.
4. **Important:** add this app's deployed origin to the backend's
   `ALLOWED_ORIGINS` env var so CORS allows it.

The app is marked `noindex` so it won't be picked up by search engines.
