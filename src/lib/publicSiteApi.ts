import { getTenantRequestContext, buildPublicSiteHeaders } from './tenant';

const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const domainPayloadCache = new Map<string, any>();

export async function fetchPublicSiteSnapshot(revalidateSeconds = 300) {
  const context = getTenantRequestContext();
  const fetchOptions =
    process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: revalidateSeconds } };

  let res;
  if (context.tenantId) {
    const tenantQuery = `?tenantId=${encodeURIComponent(context.tenantId)}`;
    const directSiteUrl = `${backendBase}/public/site${tenantQuery}`;
    res = await fetch(directSiteUrl, {
      ...fetchOptions,
      headers: buildPublicSiteHeaders(context),
    });
  } else {
    const cacheKey = `${context.domain}|${context.tenantSlug || ''}`;
    if (domainPayloadCache.has(cacheKey) && process.env.NODE_ENV !== 'development') {
      return domainPayloadCache.get(cacheKey);
    }
    const domainUrl = `${backendBase}/public/site/catalog-by-domain/${encodeURIComponent(context.domain)}?type=site`;
    res = await fetch(domainUrl, {
      ...fetchOptions,
      headers: buildPublicSiteHeaders(context),
    });
  }

  if (res.status === 404) {
    return { __notFound: true };
  }

  if (!res.ok) {
    return null;
  }

  const payload = await res.json();
  if (!context.tenantId && process.env.NODE_ENV !== 'development') {
    const cacheKey = `${context.domain}|${context.tenantSlug || ''}`;
    domainPayloadCache.set(cacheKey, payload);
  }
  return payload;
}

const findPageFromSnapshot = (snapshot: any, slug: string) => {
  if (!snapshot?.pages) return null;
  return snapshot.pages.find((page: any) => page.slug === slug) || null;
};

const findPostFromSnapshot = (snapshot: any, slug: string) => {
  const posts = snapshot?.collections?.posts || snapshot?.posts || [];
  if (!Array.isArray(posts)) return null;
  return posts.find((post: any) => post.slug === slug) || null;
};

export async function fetchPublicSettings(revalidateSeconds = 3600) {
  const snapshot = await fetchPublicSiteSnapshot(revalidateSeconds);
  if (snapshot?.settings) return snapshot.settings;
  return null;
}

export async function fetchPublicPage(slug: string, revalidateSeconds = 300) {
  const snapshot = await fetchPublicSiteSnapshot(revalidateSeconds);
  return findPageFromSnapshot(snapshot, slug);
}

export async function fetchPublicPosts(revalidateSeconds = 300) {
  const snapshot = await fetchPublicSiteSnapshot(revalidateSeconds);
  const posts = snapshot?.collections?.posts || snapshot?.posts || [];
  return Array.isArray(posts) ? posts : [];
}

export async function fetchPublicPost(slug: string, revalidateSeconds = 300) {
  const snapshot = await fetchPublicSiteSnapshot(revalidateSeconds);
  return findPostFromSnapshot(snapshot, slug);
}
