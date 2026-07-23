import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary px-3">
      <section className="card border-0 shadow-sm text-center p-4 p-md-5" style={{ maxWidth: 560 }}>
        <div className="display-2 fw-bold text-primary" aria-hidden="true">404</div>
        <h1 className="h3 mt-2">Page not found</h1>
        <p className="text-muted mb-4">
          This address is unavailable or has moved to a different Casa Nirvana workspace.
        </p>
        <Link href="/dashboards/analytics" className="btn btn-primary align-self-center">
          Return to dashboard
        </Link>
      </section>
    </main>
  );
}
