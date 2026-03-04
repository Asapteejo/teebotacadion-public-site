import { headers } from 'next/headers';

const INVALID_TENANT_SLUGS = new Set(['', 'home', 'www', 'localhost', '127.0.0.1']);
export const sanitizeTenantSlug = (value: string) => {
  const normalized = String(value || '').trim().toLowerCase();
  if (INVALID_TENANT_SLUGS.has(normalized)) return '';
  return normalized;
};

export function getTenantRequestContext() {
  const headersList = headers();
  const host =
    headersList.get('x-forwarded-host') ||
    headersList.get('host') ||
    '';
  const domain = host.split(':')[0];
  const isLocal = domain === 'localhost' || domain === '127.0.0.1';
  const tenantSlugRaw =
    process.env.NEXT_PUBLIC_TENANT_SLUG ||
    process.env.NEXT_PUBLIC_INSTITUTION_SLUG ||
    '';
  const tenantSlug = sanitizeTenantSlug(tenantSlugRaw);
  const tenantId =
    process.env.NEXT_PUBLIC_TENANT_ID ||
    process.env.NEXT_PUBLIC_INSTITUTION_ID ||
    '';
  const source = tenantId ? 'tenantId' : tenantSlug ? 'tenantSlug' : 'host';
  if (process.env.NODE_ENV === 'development') {
    // Dev-only visibility for tenant resolution.
    console.log(
      '[PUBLIC_SITE] resolved tenant:',
      JSON.stringify(
        {
          isLocal,
          host: domain,
          tenantId: tenantId || null,
          tenantSlug: tenantSlug || null,
          source,
          backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || null,
        },
        null,
        2
      )
    );
  }

  return { host, domain, isLocal, tenantSlug, tenantId, source };
}

export function buildPublicSiteHeaders(context: ReturnType<typeof getTenantRequestContext>) {
  const headerMap: Record<string, string> = {};

  if (context.isLocal && context.tenantSlug) {
    headerMap['x-tenant-slug'] = context.tenantSlug;
  }
  if (context.isLocal && context.tenantId) {
    headerMap['x-tenant-id'] = context.tenantId;
  }

  return headerMap;
}
