import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';

export default async function DepartmentDetailPage({ params }: { params: { departmentId: string } }) {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) notFound();

  const academics = snapshot?.academics || {};
  const departments = Array.isArray(academics.departments) ? academics.departments : [];
  const courses = Array.isArray(academics.courses) ? academics.courses : [];

  const department = departments.find((item: any) => item.id === params.departmentId);
  if (!department) notFound();

  const departmentCourses = courses.filter((course: any) => course.departmentId === department.id);

  return (
    <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-serif text-primary mb-2">{department.name}</h1>
      <p className="text-textLight mb-8">
        Faculty: {department?.faculty?.name || 'N/A'}
      </p>

      {departmentCourses.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {departmentCourses.map((course: any) => (
            <Link
              key={course.id}
              href={`/academics/courses/${course.id}`}
              className="rounded-lg border border-neutral p-5 hover:shadow-soft transition-shadow"
            >
              <h2 className="text-xl font-serif">{course.code} — {course.title}</h2>
              <p className="text-xs text-textLight mt-1">
                Level {course.level} · {course.creditUnit} CU · {course.semester}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-textLight">No courses available for this department.</p>
      )}
    </main>
  );
}
