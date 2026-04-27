# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**feedback-plugin** — A Google Workspace-integrated product feedback tool for non-technical product managers. PMs set up a project, get an embeddable feedback form (hosted iframe), submissions flow into their Google Sheet, and a dashboard shows auto-prioritized feedback with charts.

Built for a 4-hour build-a-thon demo to a panel. Polish matters.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: NextAuth.js with Google OAuth (scopes: Sheets, Drive)
- **Data**: Google Sheets API v4 — one Sheet per project, auto-created on setup
- **Charts**: Recharts
- **Deploy**: Vercel

## Commands

```bash
bun install          # install dependencies
bun dev              # start dev server on localhost:3000
bun build            # production build
bun lint             # eslint
```

## Architecture

The app has three distinct surfaces:

### 1. Setup Wizard (`/setup`)
Non-tech PM flow: Google OAuth → name project → configure categories & tags → auto-creates a Google Sheet in their Drive → shows copy-able iframe embed code. No manual spreadsheet work.

### 2. Public Form (`/form/[projectId]`)
Hosted iframe embedded on any site. Stateless — reads project config from the Sheet metadata tab on load. Submits via `POST /api/feedback/[projectId]` which appends a row to the Sheet.

### 3. Dashboard (`/dashboard/[projectId]`)
PM's view. Reads all rows from the Sheet and computes a priority score per feedback item:
```
score = (count × 1.0) + (unique_tag_count × 0.5) + (submissions_last_7_days × 0.3)
```
Renders: ranked priority list, bar chart by category, top tags.

## Google Sheets Schema

Each project gets one Sheet with two tabs:

**`config` tab** (row 1 = headers, row 2 = values):
`projectId | projectName | categories (JSON) | tags (JSON) | createdAt`

**`responses` tab** (append-only):
`timestamp | category | tags (comma-separated) | comment | sessionId`

## Key Flows

- **Auth**: NextAuth session holds Google `access_token`. All Sheets API calls use it directly — no service account.
- **Sheet creation**: On setup complete, app calls Drive API to create a new Sheet, writes the config tab, returns `spreadsheetId` stored in NextAuth session (or a lightweight KV if persistence is needed).
- **Embed**: `<iframe src="https://[host]/form/[projectId]" />` — no JS snippet required.

## gstack Skills for This Project

Before building a new feature: `/office-hours` → `/plan-eng-review`
Before writing UI: `/design-consultation` → `/design-html`
Before shipping: `/review` → `/ship`
To QA a flow: `/qa`

## Project Workflow Rules

When working on this project, follow these rules:

1. **Always start new feature or bug work on a new branch**
   - Do not start feature/bug work directly on `main`.
   - Create a dedicated branch before making any code changes.
   - Use clear branch names (for example: `feature/add-dashboard-filters`, `fix/form-validation-error`).

2. **Every commit must include relevant information**
   - Commit messages must explain what changed and why.
   - Keep commits focused and meaningful so reviewers can follow the history.
   - Avoid vague messages like `update` or `fix stuff`.
