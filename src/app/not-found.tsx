export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 h-16 w-16 rounded-full bg-neutral/60" />
        <h1 className="text-3xl font-serif text-primary">
          Institution not found
        </h1>
        <p className="mt-4 text-base text-textLight">
          We could not find a school website for this address. Please check the
          URL or contact your school administrator.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primaryDark"
            href="/"
          >
            Go to homepage
          </a>
          <a
            className="rounded-md border border-neutral px-6 py-3 text-sm font-semibold text-primary transition hover:bg-neutral/60"
            href="mailto:info@school.example"
          >
            Contact support
          </a>
        </div>
      </div>
    </main>
  );
}
