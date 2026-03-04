/* eslint-disable no-console */
const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || process.env.NEXT_PUBLIC_INSTITUTION_ID || '';
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG || process.env.NEXT_PUBLIC_INSTITUTION_SLUG || '';

const query = tenantId
  ? `tenantId=${encodeURIComponent(tenantId)}`
  : tenantSlug
    ? `tenantSlug=${encodeURIComponent(tenantSlug)}`
    : '';

const headers = {};
if (tenantId) headers['x-tenant-id'] = tenantId;
if (tenantSlug) headers['x-tenant-slug'] = tenantSlug;

const run = async (label, path) => {
  try {
    const url = `${backend}${path}${path.includes('?') ? '' : query ? `?${query}` : ''}`;
    const res = await fetch(url, { headers });
    const status = res.status;
    const ok = status >= 200 && status < 300;
    let details = '';
    try {
      const json = await res.json();
      if (json?.institution?.shortCode) details = ` shortCode=${json.institution.shortCode}`;
      if (Array.isArray(json?.faculties)) details += ` faculties=${json.faculties.length}`;
      if (json?.code) details += ` code=${json.code}`;
    } catch {
      details = '';
    }
    console.log(`${ok ? 'PASS' : 'FAIL'} ${label} [${status}]${details}`);
    return ok;
  } catch (error) {
    console.log(`FAIL ${label} [ERR] ${error.message}`);
    return false;
  }
};

const fetchJsonWithStatus = async (path) => {
  const url = `${backend}${path}${path.includes('?') ? '' : query ? `?${query}` : ''}`;
  const res = await fetch(url, { headers });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, ok: res.ok, body, url };
};

(async () => {
  console.log('Public route smoke test');
  console.log(`backend=${backend} tenantId=${tenantId || '-'} tenantSlug=${tenantSlug || '-'}`);

  const siteResponse = await fetchJsonWithStatus('/public/site');
  console.log(`${siteResponse.ok ? 'PASS' : 'FAIL'} public-site-snapshot [${siteResponse.status}]${siteResponse.body?.settings?.shortCode ? ` shortCode=${siteResponse.body.settings.shortCode}` : ''}`);
  const publicAdmissionsResponse = await fetchJsonWithStatus('/public/admissions/programs');
  console.log(`${publicAdmissionsResponse.ok ? 'PASS' : 'FAIL'} public-admissions-programs [${publicAdmissionsResponse.status}]`);
  const howToApplyPageResponse = await fetchJsonWithStatus('/public/site/page/how-to-apply');
  console.log(`${howToApplyPageResponse.ok ? 'PASS' : 'FAIL'} public-how-to-apply-page [${howToApplyPageResponse.status}]`);

  const derivedShortCode = siteResponse.body?.settings?.shortCode || siteResponse.body?.settings?.tenantSlug || tenantSlug;
  if (derivedShortCode) {
    const portalResponse = await fetchJsonWithStatus(`/api/admission/portal/${encodeURIComponent(String(derivedShortCode))}`);
    console.log(`${portalResponse.ok ? 'PASS' : 'FAIL'} admission-portal-fallback [${portalResponse.status}] shortCode=${derivedShortCode}${portalResponse.body?.applicationFee?.amount ? ` fee=${portalResponse.body.applicationFee.amount}` : ''}`);
  } else {
    console.log('SKIP admission-portal-fallback (no shortCode from /public/site and no tenant slug env)');
  }

  await run('public-departments', '/public/site/departments');
  await run('public-faculties', '/public/site/faculties');

  process.exit(siteResponse.ok ? 0 : 1);
})();
