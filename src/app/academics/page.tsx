import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';

export default async function AcademicsPage() {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) notFound();

  const academics = snapshot?.academics || {};
  const faculties = Array.isArray(academics.faculties) ? academics.faculties : [];
  const sessions = Array.isArray(academics.sessions) ? academics.sessions : [];

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">Academics</h1>
      <p className="text-textLight mb-10">
        Browse faculties, departments, courses, and academic sessions.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <Link href="/academics/faculties" className="rounded-lg border border-neutral p-6 hover:shadow-medium transition-shadow">
          <h2 className="text-2xl font-serif text-primary mb-2">Faculties</h2>
          <p className="text-textLight">{faculties.length} faculties available.</p>
        </Link>
        <Link href="/academics/sessions" className="rounded-lg border border-neutral p-6 hover:shadow-medium transition-shadow">
          <h2 className="text-2xl font-serif text-primary mb-2">Academic Sessions</h2>
          <p className="text-textLight">{sessions.length} sessions available.</p>
        </Link>
      </div>

      {faculties.length ? (
        <section>
          <h3 className="text-2xl font-serif text-primary mb-4">Faculty Directory</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {faculties.map((faculty: any) => (
              <Link
                key={faculty.id}
                href={`/academics/faculties/${faculty.id}`}
                className="rounded-lg border border-neutral p-5 hover:bg-neutral/40 transition-colors"
              >
                <h4 className="text-xl font-serif">{faculty.name}</h4>
                <p className="text-sm text-textLight mt-1">
                  {(faculty.departments || []).length} departments
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <p className="text-textLight">No academic catalog has been published yet.</p>
      )}
    </main>
  );
}
