import Panel from '@/components/Panel';
import ProgramNavigator from '@/components/ProgramNavigator';
import { headers } from 'next/headers';
import { getTenantRequestContext, buildPublicSiteHeaders } from '@/lib/tenant';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';
import { notFound } from 'next/navigation';

async function getProgram(programId: string) {
  const context = getTenantRequestContext();
  const domain = context.domain;
  const isLocal = context.isLocal;

  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  const tenantQuery = isLocal
    ? context.tenantId
      ? `?tenantId=${encodeURIComponent(context.tenantId)}`
      : context.tenantSlug
        ? `?tenantSlug=${encodeURIComponent(context.tenantSlug)}`
        : ''
    : '';
  const url = isLocal
    ? `${base}/public/site/program-by-domain/${domain}/${programId}${tenantQuery}`
    : `${base}/public/site/program-by-domain/${domain}/${programId}`;

  const fetchOptions =
    process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 3600 } };
  const res = await fetch(url, {
    ...fetchOptions,
    headers: buildPublicSiteHeaders(context),
  });
  if (!res.ok) return null;
  return res.json();
}

async function getCatalog() {
  const context = getTenantRequestContext();
  const domain = context.domain;
  const isLocal = context.isLocal;

  const base = process.env.NEXT_PUBLIC_BACKEND_URL;
  const tenantQuery = isLocal
    ? context.tenantId
      ? `?tenantId=${encodeURIComponent(context.tenantId)}`
      : context.tenantSlug
        ? `?tenantSlug=${encodeURIComponent(context.tenantSlug)}`
        : ''
    : '';
  const url = isLocal
    ? `${base}/public/site/catalog-by-domain/${domain}${tenantQuery}`
    : `${base}/public/site/catalog-by-domain/${domain}`;

  const fetchOptions =
    process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate: 3600 } };
  const res = await fetch(url, {
    ...fetchOptions,
    headers: buildPublicSiteHeaders(context),
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProgramDetail({ params }: { params: { programId: string } }) {
  const snapshot = await fetchPublicSiteSnapshot(3600);
  if (snapshot?.__notFound) {
    notFound();
  }
  const [program, catalog] = await Promise.all([
    getProgram(params.programId),
    getCatalog(),
  ]);

  if (!program) {
    return (
      <main className="pt-20">
        <Panel id="program-not-found" title="Program Not Found">
          <p className="text-lg text-textLight">
            We could not find this program. Please check the catalog.
          </p>
        </Panel>
      </main>
    );
  }

  const curricula = program.curricula || [];
  const flatCourses = program.courses || [];

  return (
    <main className="pt-20">
      <Panel id="program-hero" title={program.name}>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="h-48 w-full md:w-72 rounded-lg overflow-hidden bg-neutral/80 flex items-center justify-center">
            {program.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={program.imageUrl} alt={program.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-textLight">No program image</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg text-textLight">
              {program.degree} • {program.durationYears} years • {program.department?.name} • {program.department?.faculty?.name}
            </p>
            <ProgramNavigator
              catalog={catalog}
              currentProgramId={program.id}
              currentDepartmentId={program.department?.id}
            />
          </div>
        </div>
      </Panel>

      <Panel id="program-curriculum" title="Curriculum Overview">
        {curricula.length > 0 ? (
          <div className="space-y-6">
            {curricula.map((block: any) => (
              <div key={block.id} className="border border-neutral rounded-lg p-5">
                <h3 className="text-xl font-serif text-primary">
                  Level {block.level} • {block.semester}
                </h3>
                <p className="text-sm text-textLight">
                  Min {block.minCredits || 0} • Max {block.maxCredits || 0}
                </p>
                <ul className="mt-3 list-disc pl-6 text-textLight">
                  {(block.requiredCourses || []).map((rc: any) => (
                    <li key={rc.id}>
                      {rc.course?.code} - {rc.course?.title} ({rc.course?.creditUnit} units)
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : flatCourses.length > 0 ? (
          <ul className="list-disc pl-6 text-textLight space-y-2">
            {flatCourses.map((pc: any) => (
              <li key={pc.id}>
                {pc.course?.code} - {pc.course?.title} ({pc.course?.creditUnit} units)
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-textLight">Course list coming soon.</p>
        )}
      </Panel>

    </main>
  );
}
