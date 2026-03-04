import CtaButton from '@/components/CtaButton';
import { buildPublicSiteHeaders, getTenantRequestContext } from '@/lib/tenant';

export default async function AdmissionsFeesPage() {
  const context = getTenantRequestContext();
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const tenantQuery = context.isLocal
    ? context.tenantId
      ? `?tenantId=${encodeURIComponent(context.tenantId)}`
      : context.tenantSlug
        ? `?tenantSlug=${encodeURIComponent(context.tenantSlug)}`
        : ''
    : '';
  const headers = buildPublicSiteHeaders(context);
  const fetchOptions =
    process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 300 } };

  const feesRes = await fetch(
    `${base}/public/admissions/fees${tenantQuery ? `${tenantQuery}&` : '?'}mandatoryOnly=true`,
    { ...fetchOptions, headers }
  );

  let feesPayload: any = null;
  if (feesRes.ok) {
    feesPayload = await feesRes.json();
  }

  const applyUrl = '/admissions';
  const fees = Array.isArray(feesPayload?.fees) ? feesPayload.fees : [];
  const currency = feesPayload?.currency || 'NGN';

  return (
    <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">Enrollment Fees</h1>
      <p className="text-textLight mb-8">
        Fee schedule for admission and enrollment.
      </p>

      {!fees.length ? (
        <section className="rounded-xl border border-neutral bg-white p-6">
          <p className="text-textLight">No enrollment fees have been configured yet.</p>
          {process.env.NODE_ENV !== 'production' ? (
            <p className="text-sm text-red-600 mt-3">
              Institution not found in local mode or no fee types matched admission/enrollment.
            </p>
          ) : null}
        </section>
      ) : (
        <section className="rounded-xl border border-neutral bg-white p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral">
                  <th className="py-2 pr-4">Fee</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee: any) => (
                  <tr key={fee.id} className="border-b border-neutral/60">
                    <td className="py-3 pr-4">{fee.name}</td>
                    <td className="py-3 pr-4">{currency} {Number(fee.amount || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4">{fee.category || '-'}</td>
                    <td className="py-3 pr-4">
                      <div>{fee.description || '-'}</div>
                      {fee.isMandatory ? <span className="inline-block mt-1 rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">Mandatory</span> : null}
                      {fee.category ? <span className="inline-block mt-1 rounded bg-neutral px-2 py-0.5 text-xs">{fee.category}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {applyUrl ? (
            <div className="mt-6">
              <CtaButton href={applyUrl}>Start Application</CtaButton>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
