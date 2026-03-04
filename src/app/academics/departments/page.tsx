import Link from 'next/link';
import { fetchPublicAdmissionsCatalog } from '@/lib/publicAdmissionsCatalog';

export default async function DepartmentsDirectoryPage() {
  const { faculties, failedEndpoint, backendUrl, tenantId } = await fetchPublicAdmissionsCatalog();

  const departmentRows = (faculties || []).flatMap((faculty: any) =>
    (faculty.departments || []).map((department: any) => ({
      id: department.id || '',
      name: department.name || 'Department',
      facultyName: faculty.name || 'Faculty',
      programsCount: Array.isArray(department.programs) ? department.programs.length : 0,
      programs: department.programs || [],
    }))
  );

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">Departments</h1>
      <p className="text-textLight mb-10">All departments available for this institution.</p>

      {departmentRows.length === 0 ? (
        <section className="rounded-xl border border-neutral p-6 bg-white">
          <h2 className="text-2xl font-serif text-primary">Institution not found</h2>
          <p className="text-textLight mt-2">
            We could not load departments for this school.
          </p>
          {process.env.NODE_ENV !== 'production' ? (
            <p className="text-sm text-red-600 mt-3">
              Institution not found in local mode. Set NEXT_PUBLIC_TENANT_ID or NEXT_PUBLIC_TENANT_SLUG.
              {' '}backendUrl={backendUrl || '-'} tenantId={tenantId || '-'} endpoint={failedEndpoint || '-'}
            </p>
          ) : null}
        </section>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departmentRows.map((department, index) => (
            <div key={department.id || `${department.name}-${index}`} className="rounded-lg border border-neutral p-5 bg-white">
              <h2 className="text-xl font-serif text-primary">{department.name}</h2>
              <p className="text-sm text-textLight mt-1">Faculty: {department.facultyName}</p>
              <p className="text-sm text-textLight mt-1">Programs: {department.programsCount}</p>
              {department.id ? (
                <Link href={`/academics/departments/${department.id}`} className="inline-block mt-3 text-sm text-primary underline">
                  View department
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

