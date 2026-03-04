TEEBOTACADION Public Site Deployment Checklist (Vercel)

Pre-deploy
- Confirm NEXT_PUBLIC_BACKEND_URL points to backend root (not /api/public)
- Set NEXT_PUBLIC_INSTITUTION_ID for default institution
- Set NEXT_PUBLIC_ERP_URL for portal linkouts

Vercel build settings
- Framework preset: Next.js
- Build command: npm run build
- Output directory: .next

Post-deploy verification
- Homepage loads CMS data from backend
- Domain-based institution resolution works
- Navigation links point to ERP portal
