'use client'; // ← Required for Framer Motion (client-side animations)

import { useEffect, useState, type FormEvent } from 'react';
import Panel from '@/components/Panel';
import CtaButton from '@/components/CtaButton';
import { motion } from 'framer-motion';
import { getClientTenantContext, sanitizeTenantSlug, buildPortalApplyUrl } from '@/lib/tenantClient';
import { useSearchParams } from 'next/navigation';

async function getCmsData(slug: string) {
  try {
    const { backendBase, query, headers } = getClientTenantContext();
    const url = `${backendBase}/public/site${query ? `?${query}` : ''}`;
    const res = await fetch(url, { next: { revalidate: 3600 }, headers });
    if (res.status === 404) return { __notFound: true, sections: {} };
    if (!res.ok) return { sections: {} };
    const snapshot = await res.json();
    const page = snapshot?.pages?.find((p: any) => p.slug === slug);
    if (!page) {
      return { sections: {}, settings: snapshot?.settings || {} };
    }
    return {
      ...page,
      settings: snapshot?.settings || {},
    };
  } catch (error) {
    return { sections: {}, settings: {} };
  }
}

export default function Admissions() {
  const [data, setData] = useState<any>({ sections: {} });
  const [catalog, setCatalog] = useState<any[]>([]);
  const [catalogError, setCatalogError] = useState<string>('');
  const [selectedProgramKey, setSelectedProgramKey] = useState<string>('');
  const [portalConfig, setPortalConfig] = useState<any>(null);
  const [resolvedShortCode, setResolvedShortCode] = useState('');
  const [trackToken, setTrackToken] = useState('');
  const [trackError, setTrackError] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;
    (async () => {
      const nextData = await getCmsData('admissions');
      if (active) setData(nextData || { sections: {} });
    })();
    return () => {
      active = false;
    };
  }, [data?.settings?.shortCode, data?.settings?.tenantSlug]);

  useEffect(() => {
    const tokenFromQuery = searchParams?.get('token') || '';
    if (tokenFromQuery && !trackToken) {
      setTrackToken(tokenFromQuery);
    }
  }, [searchParams, trackToken]);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { backendBase, query, headers, tenantId, tenantSlug } = getClientTenantContext();
        const baseShortCode = sanitizeTenantSlug(data?.settings?.shortCode || data?.settings?.tenantSlug || tenantSlug || '');
        let faculties: any[] = [];
        let fallbackShortCode = baseShortCode;
        let failedEndpoint = '';
        let failedStatus: number | null = null;

        // First try public admissions programs endpoint directly.
        if (!faculties.length) {
          const admissionsRes = await fetch(`${backendBase}/public/admissions/programs${query ? `?${query}` : ''}`, { headers });
          if (admissionsRes.ok) {
            const admissionsPayload = await admissionsRes.json();
            faculties = Array.isArray(admissionsPayload?.faculties) ? admissionsPayload.faculties : [];
          } else {
            failedEndpoint = `${backendBase}/public/admissions/programs${query ? `?${query}` : ''}`;
            failedStatus = admissionsRes.status;
          }
        }

        // Fallback path for local/dev: resolve shortCode from /public/site then hit /api/admission/portal/:shortCode.
        if (!faculties.length && failedEndpoint) {
          const siteRes = await fetch(`${backendBase}/public/site${query ? `?${query}` : ''}`, { headers });
          if (siteRes.ok) {
            const sitePayload = await siteRes.json();
            const derivedShortCode = sanitizeTenantSlug(sitePayload?.settings?.shortCode || sitePayload?.settings?.tenantSlug || '');
            if (derivedShortCode) fallbackShortCode = String(derivedShortCode);
          }
          if (fallbackShortCode) {
            const portalRes = await fetch(`${backendBase}/api/admission/portal/${encodeURIComponent(String(fallbackShortCode))}`, {
              headers,
            });
            if (portalRes.ok) {
              const portalPayload = await portalRes.json();
              faculties = Array.isArray(portalPayload?.faculties) ? portalPayload.faculties : [];
              if (active) setPortalConfig(portalPayload);
            } else if (!failedEndpoint) {
              failedEndpoint = `${backendBase}/api/admission/portal/${encodeURIComponent(String(fallbackShortCode))}`;
              failedStatus = portalRes.status;
            }
          }
        }

        if (fallbackShortCode) {
          const portalInfoRes = await fetch(`${backendBase}/api/admission/portal/${encodeURIComponent(String(fallbackShortCode))}`, {
            headers,
          });
          if (portalInfoRes.ok) {
            const portalInfo = await portalInfoRes.json();
            if (active) setPortalConfig(portalInfo);
          }
        }

        if (!faculties.length) {
          if (active) {
            const devHint =
              process.env.NODE_ENV !== 'production'
                ? ` [dev] backendUrl=${backendBase} tenantId=${tenantId || '-'} failedEndpoint=${failedEndpoint || 'unknown'}`
                  + `${failedStatus ? ` status=${failedStatus}` : ''}`
                : '';
            setCatalogError(`Could not load admission requirements for this school.${devHint}`);
          }
          return;
        }

        if (active) {
          setCatalogError('');
          setCatalog(faculties);
          const firstProgram = faculties
            .flatMap((f: any) => (f.departments || []).flatMap((d: any) => d.programs || []))
            .find(Boolean);
          setSelectedProgramKey(String(firstProgram?.id || firstProgram?.slug || ''));
        }
      } catch (error: any) {
        if (active) {
          const devHint = process.env.NODE_ENV !== 'production' ? ` [dev] ${error?.message || 'unknown error'}` : '';
          setCatalogError(`Could not load admission requirements.${devHint}`);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [data?.settings?.shortCode, data?.settings?.tenantSlug]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { backendBase, query, headers } = getClientTenantContext();
        if (!backendBase) return;
        const res = await fetch(`${backendBase}/public/site/settings${query ? `?${query}` : ''}`, { headers });
        if (!res.ok) return;
        const payload = await res.json();
        const sc = sanitizeTenantSlug(payload?.shortCode || payload?.tenantSlug || '');
        if (active && sc) setResolvedShortCode(sc);
      } catch {
        // keep existing fallback
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const sections = data.sections || {};
  const tenantCtx = getClientTenantContext();
  const portalShortCode = sanitizeTenantSlug(
    resolvedShortCode ||
      data?.settings?.shortCode ||
      data?.settings?.tenantSlug ||
      tenantCtx.tenantSlug ||
      ''
  );
  const applyPortalLink = buildPortalApplyUrl(portalShortCode) || '/admissions';
  const feeAmount = Number(portalConfig?.applicationFee?.amount || 0);
  const processSteps = Array.isArray(sections?.applicationProcess?.steps)
    ? sections.applicationProcess.steps
    : [
        'Choose your preferred program.',
        'Fill the admission application form.',
        'Pay the application fee.',
        'School admin reviews your application.',
        'Continue onboarding via your admission magic link.',
      ];
  const panels = Array.isArray(sections.panels)
    ? sections.panels
    : [
        sections.process?.text
          ? {
              title: sections.process?.title || 'Application Process',
              text: sections.process?.text,
              cta: sections.process?.ctaText || (applyPortalLink ? 'Apply Now' : undefined),
              link: sections.process?.ctaLink || applyPortalLink,
            }
          : null,
        sections.aid?.text
          ? { title: sections.aid?.title || 'Financial Aid', text: sections.aid?.text, cta: sections.aid?.ctaText, link: sections.aid?.ctaLink }
          : null,
      ].filter(Boolean);
  const allProgramRows = catalog.flatMap((faculty: any) =>
    (faculty.departments || []).flatMap((department: any) =>
      (department.programs || []).map((program: any) => ({
        key: String(program.id || program.slug || `${department.name}-${program.name}`),
        id: program.id || '',
        facultyId: faculty.id || '',
        departmentId: department.id || '',
        facultyName: faculty.name,
        departmentName: department.name,
        programName: program.name,
        degree: program.degree,
        durationYears: program.durationYears,
        requirements: Array.isArray(program.requirements) ? program.requirements : [],
      }))
    )
  );
  const selectedProgram = allProgramRows.find((program) => program.key === selectedProgramKey) || null;
  const handleTrackSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = trackToken.trim();
    if (!token) {
      setTrackError('Enter your tracking token.');
      return;
    }
    setTrackError('');
    window.location.href = `/admissions/track/${encodeURIComponent(token)}`;
  };

  return (
    <main className="pt-20">
      {data.__notFound && !catalog.length ? (
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-serif text-primary">Institution not found</h1>
          <p className="mt-4 text-textLight">
            We could not find a school website for this address.
          </p>
        </section>
      ) : null}
      {/* Page Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-4xl md:text-5xl font-serif p-8 text-center text-primary"
      >
        {data.title || sections.hero?.title || 'Admissions'}
      </motion.h1>

      {panels.length ? (
        panels.map((panel: any, index: number) => (
          <motion.div
            key={`${panel.title}-${index}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Panel id={`panel-${index + 1}`} title={panel.title}>
              <p className="text-lg leading-relaxed mb-6">{panel.text}</p>
              {panel.cta && panel.link ? (
                <div className="mt-6 text-center">
                  <CtaButton href={panel.link}>{panel.cta}</CtaButton>
                </div>
              ) : null}
            </Panel>
          </motion.div>
        ))
      ) : (
        <section className="mx-auto max-w-3xl px-6 pb-16 text-center text-textLight">
          Admissions content has not been configured yet.
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="rounded-2xl border border-neutral bg-white p-6 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-serif text-primary">How the application works</h2>
          {feeAmount > 0 ? (
            <p className="mt-2 text-textLight">
              Application Fee: ₦{feeAmount.toLocaleString()}
            </p>
          ) : null}
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-textLight">
            {processSteps.map((step: any, idx: number) => (
              <li key={`process-step-${idx}`}>{typeof step === 'string' ? step : step?.text || step?.title || ''}</li>
            ))}
          </ol>
          {applyPortalLink ? (
            <div className="mt-5">
              <CtaButton href={applyPortalLink}>Start Application</CtaButton>
            </div>
          ) : null}
          <form onSubmit={handleTrackSubmit} className="mt-6 rounded-lg border border-neutral p-4">
            <label className="mb-2 block text-sm font-medium text-textDark">Track Existing Application</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={trackToken}
                onChange={(e) => setTrackToken(e.target.value)}
                placeholder="Enter tracking token"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Track Application
              </button>
            </div>
            {trackError ? <p className="mt-2 text-sm text-red-600">{trackError}</p> : null}
          </form>
        </div>
      </section>

      <section id="requirements" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="rounded-2xl border border-neutral bg-white p-6 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-serif text-primary">Admission Requirements (Program-by-Program)</h2>
          <p className="mt-2 text-textLight">
            Select a program to view exact admission requirements before starting your application.
          </p>

          {catalogError ? (
            <p className="mt-4 text-sm text-red-600">{catalogError}</p>
          ) : null}

          {allProgramRows.length > 0 ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-textDark">Program</label>
                <select
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                  value={selectedProgramKey}
                  onChange={(e) => setSelectedProgramKey(e.target.value)}
                >
                  {allProgramRows.map((program) => (
                    <option key={program.key} value={program.key}>
                      {program.programName} - {program.departmentName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-md bg-neutral p-4">
                <h3 className="text-lg font-semibold text-primary">
                  {selectedProgram?.programName || 'Select a program'}
                </h3>
                {selectedProgram ? (
                  <>
                    <p className="mt-1 text-sm text-textLight">
                      {selectedProgram.degree} | {selectedProgram.durationYears} years | {selectedProgram.facultyName} / {selectedProgram.departmentName}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-textDark">
                      {selectedProgram.requirements.length > 0 ? (
                        selectedProgram.requirements.map((req: string, idx: number) => <li key={`${selectedProgram.key}-${idx}`}>{String(req)}</li>)
                      ) : (
                        <li>No specific requirements configured for this program.</li>
                      )}
                    </ul>
                    {applyPortalLink ? (
                      <div className="mt-4">
                        <CtaButton
                          href={`${applyPortalLink}?programId=${encodeURIComponent(String(selectedProgram.id || ''))}&departmentId=${encodeURIComponent(String(selectedProgram.departmentId || ''))}&facultyId=${encodeURIComponent(String(selectedProgram.facultyId || ''))}`}
                          variant="primary"
                        >
                          Apply for this Program
                        </CtaButton>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-textLight">No programs were found for this institution.</p>
          )}
        </div>
      </section>
    </main>
  );
}
