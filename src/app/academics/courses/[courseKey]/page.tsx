import { notFound } from 'next/navigation';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';

export default async function CourseDetailPage({ params }: { params: { courseKey: string } }) {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) notFound();

  const courses = Array.isArray(snapshot?.academics?.courses) ? snapshot.academics.courses : [];
  const course = courses.find(
    (item: any) => item.id === params.courseKey || String(item.code || '').toLowerCase() === params.courseKey.toLowerCase()
  );

  if (!course) notFound();

  return (
    <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-serif text-primary mb-2">
        {course.code} — {course.title}
      </h1>
      <p className="text-textLight mb-8">
        {course.department?.name || 'Department not set'}
      </p>

      <div className="rounded-lg border border-neutral p-6 bg-white">
        <p className="mb-2"><strong>Level:</strong> {course.level}</p>
        <p className="mb-2"><strong>Semester:</strong> {course.semester}</p>
        <p><strong>Credit Unit:</strong> {course.creditUnit}</p>
      </div>
    </main>
  );
}
