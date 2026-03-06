# RoomFinder

RoomFinder is a full-stack rental marketplace for Owners and Tenants.

## Stack

- **Frontend:** React + TailwindCSS + React Router + Google Maps API
- **Backend:** Express.js API
- **Database/Auth:** PocketBase collections (`users`, `listings`)

## Features

- Owner/Tenant registration and login
- Session token persistence, logout
- Owner dashboard to create/manage room listings
- Tenant dashboard with search, filter, price slider, map/list toggle
- Listing details page with facilities and map actions
- Google Maps pinning for owners + marker map for tenants
- Responsive UI, badges, toast notifications

## Project structure

- `client/`: Vite React app
- `server/`: Express API

## Environment Variables

### `server/.env`

```bash
PORT=4000
CLIENT_URL=http://localhost:5173
POCKETBASE_URL=http://127.0.0.1:8090
```

### `client/.env`

```bash
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_MAPS_API_KEY=[Your API Key]
```

## PocketBase collections

### `users`

- `email`
- `password`
- `name`
- `phone`
- `userType` (Owner | Tenant)

### `listings`

- `ownerId`
- `roomType`
- `title`
- `description`
- `address`
- `location`
- `contactNumber`
- `price`
- `images`
- `facilities`
- `latitude`
- `longitude`

## Run locally

```bash
npm install
npm run dev
```

This runs both client and server via npm workspaces.
