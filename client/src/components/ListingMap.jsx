import { GoogleMap, InfoWindow, LoadScript, Marker } from '@react-google-maps/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const mapContainerStyle = { width: '100%', height: '540px' };

export default function ListingMap({ listings }) {
  const [active, setActive] = useState(null);
  const center = listings[0]
    ? { lat: Number(listings[0].latitude), lng: Number(listings[0].longitude) }
    : { lat: 23.8103, lng: 90.4125 };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '[Your API Key]'}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={{ lat: Number(listing.latitude), lng: Number(listing.longitude) }}
            onMouseOver={() => setActive(listing)}
            onClick={() => setActive(listing)}
          />
        ))}
        {active && (
          <InfoWindow
            position={{ lat: Number(active.latitude), lng: Number(active.longitude) }}
            onCloseClick={() => setActive(null)}
          >
            <div className="max-w-52">
              <p className="text-xs text-blue-700">{active.roomType} • ৳{active.price}</p>
              <h4 className="font-semibold">{active.title}</h4>
              <Link className="text-sm text-blue-600" to={`/listing/${active.id}`}>Open listing</Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
