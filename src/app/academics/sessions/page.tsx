import { notFound } from 'next/navigation';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';

export default async function AcademicSessionsPage() {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) notFound();

  const sessions = Array.isArray(snapshot?.academics?.sessions) ? snapshot.academics.sessions : [];

  return (
    <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-serif text-primary mb-8">Academic Sessions</h1>
      {sessions.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {sessions.map((session: any) => (
            <article key={session.id} className="rounded-lg border border-neutral p-5 bg-white">
              <h2 className="text-2xl font-serif">{session.name}</h2>
              <p className="text-sm text-textLight mt-2">
                {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
              </p>
              {session.isActive ? (
                <p className="text-xs mt-3 inline-block rounded-full bg-green-100 text-green-700 px-2 py-1">Active</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-textLight">No academic sessions available.</p>
      )}
    </main>
  );
}
