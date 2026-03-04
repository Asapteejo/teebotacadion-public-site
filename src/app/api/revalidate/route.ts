import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];

  if (!paths.length) {
    return NextResponse.json({ message: 'No paths provided' }, { status: 400 });
  }

  try {
    for (const path of paths) {
      // @ts-ignore - available in Next.js app router runtime
      await (global as any).revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true, paths });
  } catch (err) {
    return NextResponse.json({ message: 'Revalidation failed' }, { status: 500 });
  }
}
