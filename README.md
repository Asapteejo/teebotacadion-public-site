# TeeBotAcadion ERP — Public Site

Public website for TeeBotAcadion ERP showcasing the platform, admissions information, academics pages, and school-facing marketing content.

## What this app contains
- Marketing landing pages
- Admissions pages (how to apply, requirements, fees)
- Program/faculty/department public listings
- Application tracking pages
- Tenant-aware rendering by domain

## Tech stack
- Next.js
- React
- TypeScript

## Local development
1. Install dependencies:
   npm install
2. Configure environment variables:
   copy `.env.example` to `.env.local` and fill values
3. Start dev server:
   npm run dev

## Environment variables
Use `NEXT_PUBLIC_API_BASE_URL` (preferred) or `NEXT_PUBLIC_BACKEND_URL` (legacy fallback).
See `.env.example` and `docs/PUBLICSITE_VERCEL_ENV.md`.

## Deployment notes
- Hosted on Vercel
- Designed for multi-tenant domain-based public content
- Includes production env guards and smoke checks
