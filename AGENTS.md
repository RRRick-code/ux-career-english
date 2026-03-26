# AGENTS.md

## Project Overview

This project helps a UX/UI/Product Designer prepare English for North American job search, interviews, and workplace communication.

Its core output is a structured, reusable English content library, including vocabulary, phrases, sentence patterns, mock answers, and communication scripts.

The same content should also support a simple GitHub Pages web app for reading, search, and practice.

## User Profile

The user is a staff-level UX/UI designer with 12 years of experience at top Chinese tech companies, combining management, design, and technical depth. The profile is especially strong in consumer product design, platform-scale work, leadership, and business impact.

Use `USER_PROFILE.md` as the detailed source of truth whenever output should reflect the user's real background.

## Tech Stack

- Frontend: React + TypeScript
- Build tool: Vite
- Routing: React Router with HashRouter
- Styling: CSS Modules and CSS variables
- Data flow: app-ready JSON content files consumed directly by React
- Local state: browser localStorage
- Deployment: GitHub Actions + GitHub Pages

## UI Rules

- Use only shadcn/ui components with `style: "new-york"` and `baseColor: "neutral"`.
- Use light mode only; do not design or implement dark mode.
- Keep the interface simple and clear; avoid over-design.

## Working Rules

- Use North American workplace English as the default reference scope; keep Vancouver/Canada as the user's job target context, not the only source boundary.
- Prioritize spoken, interview-ready, and workplace-usable English over academic or overly formal language.
- Follow `DATA_ARCHITECTURE.md` for direct-consumption content storage and file organization.
