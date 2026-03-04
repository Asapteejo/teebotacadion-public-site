import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';

export default async function FacultyDetailPage({ params }: { params: { facultyId: string } }) {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) notFound();

  const faculties = Array.isArray(snapshot?.academics?.faculties) ? snapshot.academics.faculties : [];
  const faculty = faculties.find((item: any) => item.id === params.facultyId);
  if (!faculty) notFound();

  const departments = Array.isArray(faculty.departments) ? faculty.departments : [];

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-serif text-primary mb-3">{faculty.name}</h1>
      <p className="text-textLight mb-8">
        {departments.length} departments
      </p>

      {departments.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {departments.map((department: any) => (
            <Link
              key={department.id}
              href={`/academics/departments/${department.id}`}
              className="rounded-lg border border-neutral p-5 hover:bg-neutral/40 transition-colors"
            >
              <h2 className="text-xl font-serif">{department.name}</h2>
              <p className="text-xs text-textLight mt-1">{department.code}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-textLight">No departments available for this faculty.</p>
      )}
    </main>
  );
}
