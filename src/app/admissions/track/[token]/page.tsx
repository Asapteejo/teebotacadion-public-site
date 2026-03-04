import Link from 'next/link';
import { buildPublicSiteHeaders, getTenantRequestContext } from '@/lib/tenant';

type TrackerPageProps = {
  params: { token: string };
};

const normalizeStep = (application: any) => {
  const paymentStatus = String(application?.paymentStatus || '').toUpperCase();
  const appStatus = String(application?.applicationStatus || '').toUpperCase();
  const admissionStatus = String(application?.admissionStatus || '').toUpperCase();

  if (paymentStatus !== 'SUCCESS') return 2;
  if (appStatus === 'ACCEPTED' || admissionStatus === 'APPROVED') return 4;
  if (appStatus === 'REJECTED' || admissionStatus === 'REJECTED') return 4;
  return 3;
};

export default async function AdmissionsTrackPage({ params }: TrackerPageProps) {
  const context = getTenantRequestContext();
  const token = String(params?.token || '').trim();
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
  const tenantQuery = context.isLocal
    ? context.tenantId
      ? `?tenantId=${encodeURIComponent(context.tenantId)}`
      : context.tenantSlug
        ? `?tenantSlug=${encodeURIComponent(context.tenantSlug)}`
        : ''
    : '';
  const url = `${base}/public/admissions/track/${encodeURIComponent(token)}${tenantQuery}`;

  const res = await fetch(url, {
    ...(process.env.NODE_ENV === 'development' ? { cache: 'no-store' as const } : { next: { revalidate: 60 } }),
    headers: buildPublicSiteHeaders(context),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const expired = res.status === 410;
    return (
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-neutral bg-white p-6">
          <h1 className="text-3xl font-serif text-primary mb-3">Application Progress</h1>
          <p className="text-textLight mb-4">{payload?.message || (expired ? 'Tracking link expired' : 'Application not found')}</p>
          <Link href="/admissions" className="text-primary underline">Back to Admissions</Link>
        </div>
      </main>
    );
  }

  const payload = await res.json();
  const application = payload?.application || {};
  const currentStep = normalizeStep(application);
  const steps = ['Submitted', 'Payment', 'Review', 'Decision'];

  return (
    <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-neutral bg-white p-6">
        <h1 className="text-3xl font-serif text-primary mb-2">Application Progress</h1>
        <p className="text-textLight mb-6">
          {application?.firstName || 'Applicant'} {application?.lastName || ''} ({application?.emailMasked || '-'})
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {steps.map((step, idx) => {
            const stepNumber = idx + 1;
            const active = currentStep >= stepNumber;
            return (
              <div
                key={step}
                className={`rounded-lg border px-3 py-3 text-sm ${active ? 'border-primary bg-primary/5 text-primary' : 'border-neutral text-textLight'}`}
              >
                <div className="font-semibold">{step}</div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Applied:</strong> {application?.appliedAt ? new Date(application.appliedAt).toLocaleString() : '-'}</p>
            <p><strong>Last Update:</strong> {application?.updatedAt ? new Date(application.updatedAt).toLocaleString() : '-'}</p>
            <p><strong>Payment Status:</strong> {application?.paymentStatus || '-'}</p>
          </div>
          <div>
            <p><strong>Application Status:</strong> {application?.applicationStatus || '-'}</p>
            <p><strong>Admission Status:</strong> {application?.admissionStatus || '-'}</p>
            <p><strong>Program:</strong> {application?.program?.name || '-'}</p>
          </div>
        </div>

        <div className="mt-6 rounded-md bg-neutral p-4">
          <p className="text-sm text-textDark"><strong>Next step:</strong> {application?.nextStep || 'Wait for update from the school.'}</p>
        </div>
      </div>
    </main>
  );
}
