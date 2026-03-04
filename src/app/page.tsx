// app/page.tsx - Fixed server component version
import AnimatedSections from '@/components/AnimatedSections';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';
import { getTenantRequestContext, buildPublicSiteHeaders } from '@/lib/tenant';
import { notFound } from 'next/navigation';

async function getCatalog() {
  try {
    const context = getTenantRequestContext();
    const tenantQuery = context.isLocal
      ? context.tenantId
        ? `?tenantId=${encodeURIComponent(context.tenantId)}`
        : context.tenantSlug
          ? `?tenantSlug=${encodeURIComponent(context.tenantSlug)}`
          : ''
      : '';
    const fetchOptions =
      process.env.NODE_ENV === 'development'
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 3600 } };
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/public/site/catalog-by-domain/${context.domain}${tenantQuery}`,
      {
        ...fetchOptions,
        headers: buildPublicSiteHeaders(context),
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return [];
  }
}

export default async function Home() {
  const tenantContext = getTenantRequestContext();
  const snapshot = await fetchPublicSiteSnapshot(3600);
  if (snapshot?.__notFound) {
    notFound();
  }
  const [catalog] = await Promise.all([
    getCatalog(),
  ]);
  const cmsData = snapshot?.pages?.find((page: any) => page.slug === 'home') || null;
  const sections = cmsData?.sections || {};
  const collections = snapshot?.collections || {};
  const academics = snapshot?.academics || {};
  const applyUrl = '/admissions';

  const rawTestimonials = Array.isArray(sections.testimonials) && sections.testimonials.length
    ? sections.testimonials
    : Array.isArray(snapshot?.collections?.testimonials)
      ? snapshot.collections.testimonials
      : [];
  const testimonials = rawTestimonials.map((item: any) => ({
    quote: item.quote || item.text || '',
    author: item.author || item.name || '',
    location: item.location || item.role || '',
    avatar: item.avatar || item.photoUrl || '',
  }));

  const alumni = sections.alumni?.items || [];
  const departments = Array.isArray(academics.departments) && academics.departments.length
    ? academics.departments
    : Array.isArray(snapshot?.departmentsFromPortal)
      ? snapshot.departmentsFromPortal
      : Array.isArray(sections.departments) && sections.departments.length
        ? sections.departments
        : Array.isArray(collections.departments)
          ? collections.departments
          : [];
  const staff = Array.isArray(academics.staff) && academics.staff.length
    ? academics.staff
    : Array.isArray(snapshot?.staffFromPortal)
      ? snapshot.staffFromPortal
      : Array.isArray(sections.staff) && sections.staff.length
        ? sections.staff
        : Array.isArray(collections.staff)
          ? collections.staff
          : [];
  const gallery = Array.isArray(sections.gallery) && sections.gallery.length
    ? sections.gallery
    : Array.isArray(collections.gallery)
      ? collections.gallery
      : [];
  const posts = Array.isArray(sections.news) && sections.news.length
    ? sections.news
    : Array.isArray(collections.posts)
      ? collections.posts
      : [];

  const exploreItems = Array.isArray(sections.exploreItems) ? sections.exploreItems : [];

  const featuredPrograms = (() => {
    if (!catalog || catalog.length === 0) return [];
    const programs = [];
    catalog.forEach((faculty) => {
      (faculty.departments || []).forEach((dept) => {
        (dept.programs || []).forEach((prog) => {
          programs.push({
            id: prog.id,
            name: prog.name,
            degree: prog.degree,
            durationYears: prog.durationYears,
            imageUrl: prog.imageUrl,
            departmentName: dept.name,
            facultyName: faculty.name,
          });
        });
      });
    });
    return programs.slice(0, 3).map((prog) => ({
      title: prog.name,
      description: `${prog.degree} - ${prog.durationYears} years - ${prog.departmentName}`,
      link: `/academics/programs/${prog.id}`,
      linkText: 'View Program',
      image: prog.imageUrl || undefined,
    }));
  })();

  return (
    <main className="pt-20">
      {/* Pass all data to client component for animations */}
      <AnimatedSections
        sections={sections}
        testimonials={testimonials}
        alumni={alumni}
        exploreItems={exploreItems}
        applyUrl={applyUrl}
        featuredPrograms={featuredPrograms}
        departments={departments}
        staff={staff}
        gallery={gallery}
        posts={posts}
      />
    </main>
  );
}
