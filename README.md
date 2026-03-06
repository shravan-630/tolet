# RoomFinder

RoomFinder is now available as a **backend-free static website** built with plain **HTML, CSS, and JavaScript**.
It uses browser `localStorage` for demo authentication, session state, and listings.

## Run locally (no backend required)

```bash
python3 -m http.server 8080
```

Then open: `http://localhost:8080`

## Included features (static mode)

- Owner / Tenant registration and login
- Session persistence and logout
- Owner dashboard
  - Create listings with room type, title, description, address, contact, price, facilities
  - Multiple image uploads (stored as base64 in browser storage)
  - Click-to-pin location map (OpenStreetMap + Leaflet)
  - View and delete own listings
- Tenant dashboard
  - Search + filter by room type, location keywords, max price slider
  - List view and map view toggle
  - Map markers with popup + listing open
- Listing detail page with gallery, facilities badges, coordinates, and map link
- Responsive clean UI and toast notifications

## Notes

- Data is stored in your browser only (`localStorage`).
- Clearing site data will remove accounts/listings.
- This mode is ideal for prototype/demo without Express/PocketBase.
