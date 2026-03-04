import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';

export default async function FacultiesPage() {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) notFound();

  const faculties = Array.isArray(snapshot?.academics?.faculties) ? snapshot.academics.faculties : [];

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-serif text-primary mb-8">Faculties</h1>
      {faculties.length ? (
        <div className="grid md:grid-cols-2 gap-5">
          {faculties.map((faculty: any) => (
            <Link
              key={faculty.id}
              href={`/academics/faculties/${faculty.id}`}
              className="rounded-lg border border-neutral p-6 hover:shadow-medium transition-shadow"
            >
              <h2 className="text-2xl font-serif mb-2">{faculty.name}</h2>
              <p className="text-textLight text-sm">
                {(faculty.departments || []).length} departments
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-textLight">No faculties published yet.</p>
      )}
    </main>
  );
}
