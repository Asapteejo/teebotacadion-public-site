import { getTenantRequestContext, buildPublicSiteHeaders, sanitizeTenantSlug } from './tenant';

type FacultyNode = {
  id?: string;
  name?: string;
  departments?: Array<{
    id?: string;
    name?: string;
    programs?: Array<{
      id?: string;
      name?: string;
      code?: string;
      degree?: string;
      durationYears?: number;
      requirements?: string[];
    }>;
  }>;
};

export async function fetchPublicAdmissionsCatalog() {
  const context = getTenantRequestContext();
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const tenantQuery = context.isLocal
    ? context.tenantId
      ? `?tenantId=${encodeURIComponent(context.tenantId)}`
      : context.tenantSlug
        ? `?tenantSlug=${encodeURIComponent(context.tenantSlug)}`
        : ''
    : '';
  const fetchOptions =
    process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 300 } };
  const headers = buildPublicSiteHeaders(context);

  let failedEndpoint = '';
  let faculties: FacultyNode[] = [];
  let shortCode = sanitizeTenantSlug(context.tenantSlug || '');

  const primaryUrl = `${base}/public/admissions/programs${tenantQuery}`;
  const primaryRes = await fetch(primaryUrl, { ...fetchOptions, headers });
  if (primaryRes.ok) {
    const payload = await primaryRes.json();
    faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
  } else {
    failedEndpoint = primaryUrl;
  }

  if (!faculties.length) {
    const siteUrl = `${base}/public/site${tenantQuery}`;
    const siteRes = await fetch(siteUrl, { ...fetchOptions, headers });
    if (siteRes.ok) {
      const sitePayload = await siteRes.json();
      shortCode = sanitizeTenantSlug(sitePayload?.settings?.shortCode || sitePayload?.settings?.tenantSlug || shortCode);
    }
  }

  if (!faculties.length && shortCode) {
    const fallbackUrl = `${base}/api/admission/portal/${encodeURIComponent(String(shortCode))}`;
    const fallbackRes = await fetch(fallbackUrl, { ...fetchOptions, headers });
    if (fallbackRes.ok) {
      const payload = await fallbackRes.json();
      faculties = Array.isArray(payload?.faculties) ? payload.faculties : [];
    } else if (!failedEndpoint) {
      failedEndpoint = fallbackUrl;
    }
  }

  return {
    faculties,
    context,
    failedEndpoint,
    backendUrl: base,
    tenantId: context.tenantId || '',
    shortCode: shortCode || '',
  };
}


