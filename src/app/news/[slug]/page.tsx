import Link from 'next/link';
import { fetchPublicSiteSnapshot } from '@/lib/publicSiteApi';
import { notFound } from 'next/navigation';

export default async function NewsDetail({ params }: { params: { slug: string } }) {
  const snapshot = await fetchPublicSiteSnapshot(300);
  if (snapshot?.__notFound) {
    notFound();
  }
  const posts = snapshot?.collections?.posts || snapshot?.posts || [];
  const safePosts = Array.isArray(posts) ? posts : [];
  const post = safePosts.find((item: any) => item.slug === params.slug) || null;

  if (!post) {
    return (
      <main className="pt-24 px-6 md:px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif text-primary mb-4">Post not found</h1>
          <p className="text-textLight mb-6">
            The article you are looking for is not available.
          </p>
          <Link href="/news" className="text-accent hover:underline">
            Back to News
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 px-6 md:px-10">
      <article className="max-w-3xl mx-auto">
        <Link href="/news" className="text-accent hover:underline text-sm">
          ← Back to News
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-primary mt-4">
          {post.title}
        </h1>
        {post.publishedAt && (
          <p className="mt-2 text-xs uppercase tracking-wide text-textLight">
            {new Date(post.publishedAt).toLocaleDateString()}
          </p>
        )}
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mt-6 mb-8 w-full rounded-2xl object-cover"
          />
        ) : null}
        <div className="prose prose-lg max-w-none text-textLight">
          {post.body}
        </div>
      </article>
    </main>
  );
}
