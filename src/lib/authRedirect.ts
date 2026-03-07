const DEFAULT_PRIMARY_PORTAL_URL = 'https://portal.teebotacadion.com';

const normalizeHost = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split(':')[0];

const normalizePortalBase = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch (_err) {
    return '';
  }
};

export const normalizeSafeReturnTo = (value: string) => {
  const raw = String(value || '').trim();
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  try {
    const parsed = new URL(raw, 'https://safe.local');
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!normalized.startsWith('/') || normalized.startsWith('/auth')) return '/';
    return normalized;
  } catch (_err) {
    return '/';
  }
};

export const buildTenantAwareSignInUrl = ({
  currentHost,
  tenantSlug,
  tenantId,
  tenantPortalDomain,
  returnTo,
}: {
  currentHost?: string;
  tenantSlug?: string;
  tenantId?: string;
  tenantPortalDomain?: string;
  returnTo?: string;
}) => {
  const authMode = String(process.env.NEXT_PUBLIC_AUTH_MODE || 'central_portal').toLowerCase();
  const allowSatellite =
    String(process.env.NEXT_PUBLIC_ENABLE_SATELLITE_DOMAINS || '').toLowerCase() === 'true';
  const safeReturnTo = normalizeSafeReturnTo(returnTo || '/');
  const tenant = String(tenantSlug || '').trim() || String(tenantId || '').trim();
  const sourceDomain = normalizeHost(currentHost || '');
  const satelliteOrigin =
    authMode === 'satellite_ready' && allowSatellite
      ? normalizePortalBase(String(tenantPortalDomain || ''))
      : '';
  const portalOrigin =
    satelliteOrigin ||
    normalizePortalBase(
      process.env.NEXT_PUBLIC_PRIMARY_PORTAL_URL ||
        process.env.NEXT_PUBLIC_PORTAL_BASE_URL ||
        process.env.NEXT_PUBLIC_PORTAL_URL ||
        ''
    ) ||
    DEFAULT_PRIMARY_PORTAL_URL;

  const params = new URLSearchParams();
  if (tenant) params.set('tenant', tenant);
  if (sourceDomain) params.set('source_domain', sourceDomain);
  if (safeReturnTo !== '/') params.set('return_to', safeReturnTo);

  const query = params.toString();
  return `${portalOrigin}/auth/sign-in${query ? `?${query}` : ''}`;
};
