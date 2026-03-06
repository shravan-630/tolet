import { useEffect, useMemo, useState } from 'react';
import ListingCard from '../components/ListingCard';
import ListingMap from '../components/ListingMap';
import api from '../lib/api';

const roomTypes = ['', 'Bachelor', 'Single', '1BHK', '2BHK'];

export default function TenantDashboard() {
  const [listings, setListings] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({ roomType: '', q: '', maxPrice: 100000 });

  useEffect(() => {
    api.get('/listings').then(({ data }) => setListings(data));
  }, []);

  const filtered = useMemo(
    () =>
      listings.filter((item) =>
        (!filters.roomType || item.roomType === filters.roomType) &&
        (!filters.q || `${item.title} ${item.address} ${item.location}`.toLowerCase().includes(filters.q.toLowerCase())) &&
        Number(item.price) <= filters.maxPrice
      ),
    [listings, filters]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="card mb-5 grid gap-3 p-4 md:grid-cols-4">
        <select className="input" value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}>{roomTypes.map((type) => <option key={type} value={type}>{type || 'All room types'}</option>)}</select>
        <input className="input md:col-span-2" placeholder="Search by location/address" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3">
          <span className="text-xs">Max ৳{filters.maxPrice}</span>
          <input className="w-full" type="range" min="1000" max="100000" step="500" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })} />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <button className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`} onClick={() => setViewMode('grid')}>List view</button>
          <button className={`rounded-lg px-3 py-1.5 text-sm ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`} onClick={() => setViewMode('map')}>Map view</button>
        </div>
      </section>

      {viewMode === 'grid' ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </section>
      ) : (
        <ListingMap listings={filtered} />
      )}
    </main>
  );
}
