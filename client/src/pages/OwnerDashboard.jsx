import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const roomTypes = ['Bachelor', 'Single', '1BHK', '2BHK'];
const facilities = ['Water', 'Electricity', 'WiFi', 'Parking', 'Gym', 'Security', 'AC', 'Balcony', 'Kitchen', 'Furnished'];

export default function OwnerDashboard({ user }) {
  const [listings, setListings] = useState([]);
  const [pin, setPin] = useState({ lat: 23.8103, lng: 90.4125 });
  const [form, setForm] = useState({
    roomType: roomTypes[0],
    title: '',
    description: '',
    address: '',
    location: '',
    contactNumber: user.phone || '',
    price: '',
    facilities: []
  });

  async function loadMine() {
    const { data } = await api.get('/listings');
    setListings(data.filter((item) => item.ownerId === user.id));
  }

  useEffect(() => {
    loadMine();
  }, []);

  async function submitListing(event) {
    event.preventDefault();
    await api.post('/listings', {
      ...form,
      ownerId: user.id,
      latitude: pin.lat,
      longitude: pin.lng
    });
    toast.success('Listing created');
    setForm({ ...form, title: '', description: '', address: '', location: '', price: '', facilities: [] });
    loadMine();
  }

  async function removeListing(id) {
    await api.delete(`/listings/${id}`);
    toast.success('Listing deleted');
    loadMine();
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[2fr,3fr]">
      <form onSubmit={submitListing} className="card space-y-3 p-5">
        <h2 className="text-xl font-bold">Create a room listing</h2>
        <select className="input" value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>{roomTypes.map((t) => <option key={t}>{t}</option>)}</select>
        <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="input" placeholder="Description" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input className="input" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        <input className="input" placeholder="Location details" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        <input className="input" placeholder="Contact number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required />
        <input className="input" type="number" placeholder="Rent amount" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
        <div className="flex flex-wrap gap-2">
          {facilities.map((facility) => (
            <button
              key={facility}
              type="button"
              onClick={() => setForm({ ...form, facilities: form.facilities.includes(facility) ? form.facilities.filter((f) => f !== facility) : [...form.facilities, facility] })}
              className={`rounded-full px-3 py-1 text-xs ${form.facilities.includes(facility) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {facility}
            </button>
          ))}
        </div>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '[Your API Key]'}>
          <GoogleMap mapContainerStyle={{ width: '100%', height: '220px' }} center={pin} zoom={13} onClick={(e) => setPin({ lat: e.latLng.lat(), lng: e.latLng.lng() })}>
            <Marker position={pin} />
          </GoogleMap>
        </LoadScript>
        <button className="btn-primary w-full">Publish listing</button>
      </form>

      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Your listings</h2>
        {listings.map((listing) => (
          <article key={listing.id} className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{listing.title}</h3>
              <span className="badge">{listing.roomType}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{listing.address}</p>
            <p className="text-sm">৳{listing.price} • {listing.contactNumber}</p>
            <button className="mt-3 rounded-lg border border-rose-300 px-3 py-1 text-sm text-rose-600" onClick={() => removeListing(listing.id)}>
              Delete
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
