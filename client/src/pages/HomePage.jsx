import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="card overflow-hidden p-8 md:p-14">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-blue-500">Rental Marketplace</p>
        <h1 className="text-4xl font-extrabold text-slate-800 md:text-5xl">Find your next room with confidence.</h1>
        <p className="mt-4 max-w-2xl text-slate-500">
          RoomFinder connects property owners and tenants using rich listings, smart filters, and interactive map search.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className="btn-primary">Get Started</Link>
          <Link to="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2 font-medium">Explore Listings</Link>
        </div>
      </section>
    </main>
  );
}
