const INVALID_TENANT_SLUGS = new Set(['', 'home', 'www', 'localhost', '127.0.0.1']);

export function sanitizeTenantSlug(value: string) {
  const normalized = String(value || '').trim().toLowerCase();
  if (INVALID_TENANT_SLUGS.has(normalized)) return '';
  return normalized;
}

export function getClientTenantContext() {
  const host = typeof window !== 'undefined' ? window.location.hostname.split(':')[0].toLowerCase() : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_INSTITUTION_ID || '';
  const tenantSlug = sanitizeTenantSlug(process.env.NEXT_PUBLIC_TENANT_SLUG || process.env.NEXT_PUBLIC_INSTITUTION_SLUG || '');
  const backendBase =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (isLocal ? 'http://localhost:4000' : '');
  const source = tenantId ? 'tenantId' : tenantSlug ? 'tenantSlug' : 'host';
  const query = isLocal
    ? tenantId
      ? `tenantId=${encodeURIComponent(tenantId)}`
      : tenantSlug
        ? `tenantSlug=${encodeURIComponent(tenantSlug)}`
        : ''
    : '';
  const headers: Record<string, string> = {};
  if (isLocal && tenantId) headers['x-tenant-id'] = tenantId;
  if (isLocal && tenantSlug) headers['x-tenant-slug'] = tenantSlug;
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    const key = '__PUBLIC_SITE_TENANT_LOGGED__';
    if (!(window as any)[key]) {
      (window as any)[key] = true;
      // Dev-only quick signal for tenant source.
      console.log(
        '[PUBLIC_SITE] resolved tenant:',
        JSON.stringify(
          {
            tenantId: tenantId || null,
            tenantSlug: tenantSlug || null,
            source,
          },
          null,
          2
        )
      );
    }
  }
  return { host, isLocal, tenantId, tenantSlug, backendBase, query, headers, source };
}

export function buildPortalApplyUrl(shortCode?: string) {
  const localPortalBase =
    typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5173'
      : '';
  const portalBase = process.env.NEXT_PUBLIC_ERP_URL || process.env.NEXT_PUBLIC_PORTAL_BASE_URL || process.env.NEXT_PUBLIC_PORTAL_URL || localPortalBase;
  const normalizedBase = String(portalBase || '').replace(/\/+$/, '');
  const resolvedSlug = sanitizeTenantSlug(String(shortCode || ''));
  if (!normalizedBase || !resolvedSlug) return '';
  return `${normalizedBase}/apply/${encodeURIComponent(resolvedSlug)}`;
}

