import CtaButton from '@/components/CtaButton';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';
import { buildPublicSiteHeaders, getTenantRequestContext } from '@/lib/tenant';

const DEFAULT_STEPS = [
  'Choose your preferred program.',
  'Fill the admission application form.',
  'Pay the application fee.',
  'School admin reviews your application.',
  'Continue onboarding via your admission magic link.',
];

const extractSteps = (sections: any) => {
  const candidates = [
    sections?.applicationProcess?.steps,
    sections?.processSteps,
    sections?.steps,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) {
      return candidate.map((item) => (typeof item === 'string' ? item : item?.text || item?.title || '')).filter(Boolean);
    }
  }
  return DEFAULT_STEPS;
};

export default async function HowToApplyPage() {
  const context = getTenantRequestContext();
  const snapshot = await fetchPublicSiteSnapshot(300);
  const sectionsFromSnapshot =
    snapshot?.pages?.find((page: any) => String(page?.slug || '').toLowerCase() === 'how-to-apply')?.sections || null;

  let cmsPage: any = null;
  if (!sectionsFromSnapshot) {
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      if (base) {
        const tenantQuery = context.isLocal
          ? context.tenantId
            ? `?tenantId=${encodeURIComponent(context.tenantId)}`
            : context.tenantSlug
              ? `?tenantSlug=${encodeURIComponent(context.tenantSlug)}`
              : ''
          : '';
        const url = `${base}/public/site/page/how-to-apply${tenantQuery}`;
        const res = await fetch(url, {
          ...(process.env.NODE_ENV === 'development' ? { cache: 'no-store' as const } : { next: { revalidate: 300 } }),
          headers: buildPublicSiteHeaders(context),
        });
        if (res.ok) {
          cmsPage = await res.json();
        }
      }
    } catch {
      // Fall through to static defaults when CMS is unavailable.
    }
  }

  const sections = sectionsFromSnapshot || cmsPage?.sections || {};
  const title = cmsPage?.title || sections?.hero?.title || 'How to Apply';
  const intro = sections?.hero?.text || sections?.intro || 'Follow the steps below to apply successfully.';
  const steps = extractSteps(sections);
  const applyUrl = '/admissions';

  return (
    <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">{title}</h1>
      <p className="text-textLight mb-8">{intro}</p>

      <section className="rounded-xl border border-neutral bg-white p-6 mb-8">
        <h2 className="text-2xl font-serif text-primary mb-4">Application Process</h2>
        <ol className="list-decimal pl-6 space-y-2 text-textLight">
          {steps.map((step, idx) => (
            <li key={`step-${idx}`}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-neutral bg-white p-6">
        <h2 className="text-2xl font-serif text-primary mb-3">Start Your Application</h2>
        <CtaButton href={applyUrl}>Start Application</CtaButton>
      </section>
    </main>
  );
}
