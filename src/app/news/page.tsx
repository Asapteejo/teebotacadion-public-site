import Link from 'next/link';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';
import { notFound } from 'next/navigation';

export default async function NewsPage() {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) {
    notFound();
  }
  const posts = snapshot?.collections?.posts || snapshot?.posts || [];
  const safePosts = Array.isArray(posts) ? posts : [];
  const homePage = Array.isArray(snapshot?.pages)
    ? snapshot.pages.find((page: any) => page?.slug === 'home')
    : null;
  const announcement = homePage?.sections?.announcement || null;

  return (
    <main className="pt-24 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">
          News & Updates
        </h1>
        {safePosts.length === 0 ? (
          <div className="rounded-2xl border border-neutral bg-white p-6">
            <p className="text-textLight">No published news yet.</p>
            {announcement?.title ? (
              <div className="mt-4">
                <h2 className="text-2xl font-serif text-primary">{announcement.title}</h2>
                {announcement?.text ? <p className="mt-2 text-textLight">{announcement.text}</p> : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {safePosts.map((post: any) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group border border-neutral rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition"
              >
                {post.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="h-48 w-full rounded-xl object-cover mb-4"
                  />
                ) : null}
                <h2 className="text-2xl font-serif text-primary group-hover:text-accent">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="mt-2 text-textLight line-clamp-3">{post.excerpt}</p>
                )}
                {post.publishedAt && (
                  <p className="mt-4 text-xs uppercase tracking-wide text-textLight">
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
