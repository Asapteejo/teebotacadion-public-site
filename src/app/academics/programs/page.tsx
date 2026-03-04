import Link from 'next/link';
import { fetchPublicAdmissionsCatalog } from '@/lib/publicAdmissionsCatalog';

export default async function ProgramsDirectoryPage() {
  const { faculties, failedEndpoint, backendUrl, tenantId } = await fetchPublicAdmissionsCatalog();

  const hasData = Array.isArray(faculties) && faculties.length > 0;

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">Programs & Degrees</h1>
      <p className="text-textLight mb-10">All available programs in this institution, grouped by faculty and department.</p>

      {!hasData ? (
        <section className="rounded-xl border border-neutral p-6 bg-white">
          <h2 className="text-2xl font-serif text-primary">Institution not found</h2>
          <p className="text-textLight mt-2">
            We could not load programs for this school.
          </p>
          {process.env.NODE_ENV !== 'production' ? (
            <p className="text-sm text-red-600 mt-3">
              Institution not found in local mode. Set NEXT_PUBLIC_TENANT_ID or NEXT_PUBLIC_TENANT_SLUG.
              {' '}backendUrl={backendUrl || '-'} tenantId={tenantId || '-'} endpoint={failedEndpoint || '-'}
            </p>
          ) : null}
        </section>
      ) : (
        <div className="space-y-8">
          {faculties.map((faculty: any, fIdx: number) => (
            <section key={faculty.id || `${faculty.name}-${fIdx}`} className="rounded-xl border border-neutral p-6 bg-white">
              <h2 className="text-2xl font-serif text-primary mb-4">{faculty.name || 'Faculty'}</h2>
              <div className="space-y-6">
                {(faculty.departments || []).map((department: any, dIdx: number) => (
                  <div key={department.id || `${department.name}-${dIdx}`}>
                    <h3 className="text-xl font-serif text-primary/90 mb-3">{department.name || 'Department'}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(department.programs || []).map((program: any, pIdx: number) => (
                        <Link
                          key={program.id || `${program.name}-${pIdx}`}
                          href={program.id ? `/academics/programs/${program.id}` : '/academics/programs'}
                          className="rounded-lg border border-neutral p-4 hover:bg-neutral/40 transition-colors"
                        >
                          <h4 className="text-lg font-serif">{program.name || 'Program'}</h4>
                          <p className="text-sm text-textLight mt-1">
                            {program.degree || 'Degree'}{program.durationYears ? ` • ${program.durationYears} years` : ''}
                          </p>
                          {program.code ? (
                            <p className="text-xs text-textLight mt-1">Code: {program.code}</p>
                          ) : null}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
