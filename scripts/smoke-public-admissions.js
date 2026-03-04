/* eslint-disable no-console */
const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_INSTITUTION_ID || '';
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || process.env.NEXT_PUBLIC_INSTITUTION_SLUG || '';
const trackToken = process.env.TRACK_TOKEN || '';

const query = tenantId
  ? `tenantId=${encodeURIComponent(tenantId)}`
  : tenantSlug
    ? `tenantSlug=${encodeURIComponent(tenantSlug)}`
    : '';

const headers = {};
if (tenantId) headers['x-tenant-id'] = tenantId;
if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;

async function check(label, path) {
  const url = `${backend}${path}${path.includes('?') ? '' : query ? `?${query}` : ''}`;
  try {
    const res = await fetch(url, { headers });
    console.log(`${res.ok ? 'PASS' : 'FAIL'} ${label} [${res.status}] ${url}`);
    return res.ok;
  } catch (error) {
    console.log(`FAIL ${label} [ERR] ${url} ${error.message}`);
    return false;
  }
}

(async () => {
  console.log(`backend=${backend} tenantId=${tenantId || '-'} tenantSlug=${tenantSlug || '-'} trackToken=${trackToken ? 'set' : 'missing'}`);

  const siteOk = await check('public-site', '/public/site');
  const catalogOk = await check('public-admissions-programs', '/public/admissions/programs');

  let trackOk = true;
  if (trackToken) {
    trackOk = await check('public-admissions-track', `/public/admissions/track/${encodeURIComponent(trackToken)}`);
  } else {
    console.log('SKIP public-admissions-track (TRACK_TOKEN not set)');
  }

  process.exit(siteOk && catalogOk && trackOk ? 0 : 1);
})();
