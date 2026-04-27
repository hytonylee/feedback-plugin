# feedback-plugin

Google Workspace-integrated product feedback tool for non-technical PMs.

PMs create a project, configure categories/tags/requirements, and get a hosted iframe form. Submissions are written to Google Sheets, then a dashboard computes priority and visualizes what to build next.

## Current workflow

1. PM signs in with Google from `/`.
2. PM runs the setup wizard at `/setup`:
   - project name
   - allowed categories
   - allowed tags
   - form requirements (tags/comment required)
3. App creates a Google Spreadsheet with `config` + `responses` tabs and returns:
   - `projectId` (public identifier)
   - `spreadsheetId` (Google Sheet id)
4. PM shares/embed uses form URL: `/form/[projectId]?sid=[spreadsheetId]`.
5. Dashboard URL `/dashboard/[projectId]?sid=[spreadsheetId]` shows:
   - ranked priorities
   - category chart
   - top tags
6. `/projects` lists all discovered feedback sheets for the signed-in user and gives direct form/dashboard links.

## Routes (implemented)

### Pages

- `/` - marketing + Google sign-in CTA
- `/setup` - authenticated project setup wizard
- `/projects` - authenticated project list with deep links
- `/form/[projectId]` - public embeddable form UI
- `/dashboard/[projectId]` - authenticated analytics dashboard

### API routes

- `POST /api/setup`
  - creates a project sheet and writes config metadata
  - response: `{ projectId, spreadsheetId }`
- `GET /api/project/[projectId]?sid=...`
  - returns parsed project config for form/dashboard
- `POST /api/feedback/[projectId]`
  - appends feedback row to `responses` tab
- `GET /api/projects`
  - returns current user's project summaries from Drive + config tab
- `/api/auth/[...nextauth]`
  - NextAuth handlers

## Data model in Google Sheets

Each project creates one spreadsheet with two tabs:

- `config` tab
  - columns: `projectId | projectName | categories | tags | createdAt | requirements`
  - row 2 stores JSON for `categories`, `tags`, and `requirements`
- `responses` tab
  - columns: `timestamp | category | tags | comment | sessionId`
  - append-only

## Priority logic

Dashboard scoring uses:

`score = (count * 1.0) + (unique_tag_count * 0.5) + (submissions_last_7_days * 0.3)`

## Tech stack

- Next.js 16 (App Router)
- React 19
- NextAuth (Google OAuth)
- Google Sheets API + Google Drive API
- shadcn/ui + Tailwind CSS
- Recharts
- Bun (package manager/scripts)

## Local development

Install dependencies:

```bash
bun install
```

Start dev server:

```bash
bun dev
```

Run checks:

```bash
bun run security:audit
bun lint
bun run preflight
```

Build production bundle:

```bash
bun build
```

## Auth and Google setup

Configure Google OAuth for NextAuth with Sheets + Drive access, then set required auth/env values in your local environment (for example via `.env.local`) before running the app.

OAuth scopes used by the app:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/drive.file`

## Embedding

Use a hosted iframe pointing at:

```html
<iframe src="https://your-domain.com/form/[projectId]?sid=[spreadsheetId]" />
```

No custom script snippet is required.
