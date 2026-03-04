# Public Site Vercel Environment

Required production variables:

- `NEXT_PUBLIC_API_BASE_URL` (preferred, example: `https://api.teebotacadion.com`)
- `NEXT_PUBLIC_BACKEND_URL` (legacy compatibility fallback)

Optional local-only tenant helpers:

- `NEXT_PUBLIC_TENANT_ID`
- `NEXT_PUBLIC_TENANT_SLUG`

## Guardrails

- Production checks fail if neither `NEXT_PUBLIC_API_BASE_URL` nor `NEXT_PUBLIC_BACKEND_URL` is set.
- Production checks fail if API base points to `onrender.com`.
- Run before deploy:

```bash
npm run publicsite:smoke
```

## Tenant cache safety note

Public snapshot caching is tenant-safe because the in-memory key includes hostname:

- Cache key format: `domain|tenantSlug`
- Source: `src/lib/publicSiteApi.ts`

This prevents cached content from one school domain leaking into another school domain.
