import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../lib/api';

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    api.get('/listings').then(({ data }) => setListing(data.find((item) => item.id === id)));
  }, [id]);

  if (!listing) return <main className="mx-auto max-w-4xl px-4 py-10">Loading...</main>;

  const mapHref = `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <article className="card overflow-hidden">
        <div className="grid gap-2 bg-slate-100 p-2 md:grid-cols-3">
          {(listing.images?.length ? listing.images : ['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200']).map((img, index) => (
            <img key={`${img}-${index}`} src={img} alt={listing.title} className="h-56 w-full rounded-lg object-cover" />
          ))}
        </div>
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-3xl font-bold">{listing.title}</h1>
            <span className="badge">{listing.roomType}</span>
          </div>
          <p className="text-slate-600">{listing.description}</p>
          <p><strong>Address:</strong> {listing.address}</p>
          <p><strong>Price:</strong> ৳{listing.price}</p>
          <p><strong>Owner contact:</strong> {listing.contactNumber}</p>
          <p><strong>Coordinates:</strong> {listing.latitude}, {listing.longitude}</p>
          <div className="flex flex-wrap gap-2">{(listing.facilities || []).map((f) => <span key={f} className="rounded-full bg-purple-100 px-3 py-1 text-xs text-purple-700">{f}</span>)}</div>
          <div className="flex gap-3">
            <a href={mapHref} target="_blank" rel="noreferrer" className="btn-primary">View on Map</a>
            <Link to="/dashboard" className="rounded-xl border border-slate-300 px-4 py-2">Back to Search</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
