import { Link } from 'react-router-dom';

export default function ListingCard({ listing }) {
  return (
    <article className="card p-4 transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=900'}
        alt={listing.title}
        className="h-40 w-full rounded-xl object-cover"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="badge">{listing.roomType}</span>
        <span className="text-lg font-semibold text-blue-700">৳{listing.price}</span>
      </div>
      <h3 className="mt-2 text-lg font-semibold">{listing.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-500">{listing.description}</p>
      <p className="mt-2 text-sm text-slate-600">📍 {listing.address}</p>
      <p className="text-sm text-slate-600">📞 {listing.contactNumber}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(listing.facilities || []).slice(0, 4).map((facility) => (
          <span key={facility} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
            {facility}
          </span>
        ))}
      </div>
      <Link to={`/listing/${listing.id}`} className="mt-4 inline-block text-sm font-medium text-blue-600">View details →</Link>
    </article>
  );
}
