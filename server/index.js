import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import PocketBase from 'pocketbase';

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const PORT = process.env.PORT || 4000;
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const FACILITIES = [
  'Water',
  'Electricity',
  'WiFi',
  'Parking',
  'Gym',
  'Security',
  'AC',
  'Balcony',
  'Kitchen',
  'Furnished'
];

function listingDto(record) {
  return {
    id: record.id,
    ownerId: record.ownerId,
    roomType: record.roomType,
    title: record.title,
    description: record.description,
    address: record.address,
    location: record.location,
    contactNumber: record.contactNumber,
    price: record.price,
    facilities: record.facilities || [],
    images: record.images || [],
    latitude: record.latitude,
    longitude: record.longitude,
    created: record.created
  };
}

app.get('/api/health', (_, res) => res.json({ ok: true, name: 'RoomFinder API' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, userType } = req.body;
    if (!email || !password || !phone || !name || !['Owner', 'Tenant'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid payload for registration.' });
    }

    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
      phone,
      userType
    });

    res.status(201).json({ id: user.id, email: user.email, userType: user.userType, name: user.name, phone: user.phone });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await pb.collection('users').authWithPassword(email, password);
    res.json({
      token: authData.token,
      user: {
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
        phone: authData.record.phone,
        userType: authData.record.userType
      }
    });
  } catch (error) {
    res.status(401).json({ message: error.message || 'Login failed.' });
  }
});

app.post('/api/auth/logout', (_, res) => {
  pb.authStore.clear();
  res.status(204).send();
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ message: 'No token supplied.' });

  pb.authStore.save(token, null);
  next();
}

app.get('/api/listings', async (req, res) => {
  try {
    const { roomType, q, minPrice, maxPrice } = req.query;
    const filters = [];

    if (roomType) filters.push(`roomType='${roomType}'`);
    if (q) filters.push(`(title~'${q}' || address~'${q}' || location~'${q}')`);
    if (minPrice) filters.push(`price>=${Number(minPrice)}`);
    if (maxPrice) filters.push(`price<=${Number(maxPrice)}`);

    const records = await pb.collection('listings').getFullList({
      sort: '-created',
      filter: filters.join(' && ')
    });

    res.json(records.map(listingDto));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to fetch listings.' });
  }
});

app.post('/api/listings', authMiddleware, upload.array('images', 6), async (req, res) => {
  try {
    const payload = req.body;
    const facilities = JSON.parse(payload.facilities || '[]').filter((f) => FACILITIES.includes(f));

    const data = {
      ownerId: payload.ownerId,
      roomType: payload.roomType,
      title: payload.title,
      description: payload.description,
      address: payload.address,
      location: payload.location,
      contactNumber: payload.contactNumber,
      price: Number(payload.price),
      facilities,
      latitude: Number(payload.latitude),
      longitude: Number(payload.longitude)
    };

    req.files?.forEach((file, index) => {
      data[`images+`] = file;
      data[`imageCaption${index + 1}`] = file.originalname;
    });

    const created = await pb.collection('listings').create(data);
    res.status(201).json(listingDto(created));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to create listing.' });
  }
});

app.put('/api/listings/:id', authMiddleware, async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.latitude) updates.latitude = Number(updates.latitude);
    if (updates.longitude) updates.longitude = Number(updates.longitude);

    const updated = await pb.collection('listings').update(req.params.id, updates);
    res.json(listingDto(updated));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to update listing.' });
  }
});

app.delete('/api/listings/:id', authMiddleware, async (req, res) => {
  try {
    await pb.collection('listings').delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message || 'Unable to delete listing.' });
  }
});

app.listen(PORT, () => {
  console.log(`RoomFinder API running on port ${PORT}`);
});
