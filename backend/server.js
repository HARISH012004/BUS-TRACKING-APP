const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 5000;
const defaultOrigins = 'http://localhost:5173,http://127.0.0.1:5173';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || defaultOrigins)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

const users = [
  { id: 'u1', name: 'Priya', role: 'passenger', phone: '9876543210' },
  { id: 'u2', name: 'Arun', role: 'driver', phone: '9123456780' },
  { id: 'u3', name: 'Admin Team', role: 'admin', phone: '9000012345' },
];

const routes = [
  {
    id: 'r1',
    code: 'CHN-MDU',
    from: 'Chennai',
    to: 'Madurai',
    distanceKm: 463,
    durationMinutes: 540,
    price: 780,
    seatsAvailable: 18,
    departure: '2026-11-16T18:30:00',
    busName: 'TN Express',
    type: 'Sleeper AC'
  },
  {
    id: 'r2',
    code: 'CHN-COI',
    from: 'Chennai',
    to: 'Coimbatore',
    distanceKm: 512,
    durationMinutes: 550,
    price: 820,
    seatsAvailable: 12,
    departure: '2026-11-16T19:00:00',
    busName: 'Kovai Star',
    type: 'Semi Sleeper'
  },
  {
    id: 'r3',
    code: 'MDU-CHN',
    from: 'Madurai',
    to: 'Chennai',
    distanceKm: 463,
    durationMinutes: 530,
    price: 760,
    seatsAvailable: 22,
    departure: '2026-11-17T07:00:00',
    busName: 'Maduraa Royal',
    type: 'Volvo AC'
  }
];

const trips = [
  {
    id: 't1',
    routeId: 'r1',
    busId: 'b1',
    driverId: 'd1',
    status: 'in_transit',
    currentLat: 13.0827,
    currentLng: 80.2707,
    speedKmh: 64,
    lastUpdated: '2026-11-16T08:30:00Z'
  },
  {
    id: 't2',
    routeId: 'r2',
    busId: 'b2',
    driverId: 'd2',
    status: 'scheduled',
    currentLat: 12.9716,
    currentLng: 80.2209,
    speedKmh: 0,
    lastUpdated: '2026-11-16T08:00:00Z'
  }
];

const bookings = [
  {
    id: 'bk1',
    passengerId: 'u1',
    routeId: 'r1',
    tripId: 't1',
    seats: ['A1', 'A2'],
    amount: 1560,
    status: 'confirmed'
  }
];

const gpsHistory = [
  {
    tripId: 't1',
    lat: 13.0827,
    lng: 80.2707,
    speedKmh: 64,
    timestamp: '2026-11-16T08:30:00Z'
  },
  {
    tripId: 't1',
    lat: 13.1208,
    lng: 80.2382,
    speedKmh: 68,
    timestamp: '2026-11-16T08:35:00Z'
  }
];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'BusTrack API', timestamp: new Date().toISOString() });
});

app.post('/auth/login', (req, res) => {
  const { phone, role } = req.body || {};

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  const user = users.find((item) => item.phone === phone || item.role === role) || users[0];
  const token = crypto.randomUUID();

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      phone: user.phone,
    },
    message: 'Login successful'
  });
});

app.get('/routes', (req, res) => {
  res.json(routes);
});

app.get('/trips', (req, res) => {
  res.json(trips);
});

app.get('/trips/:id/live', (req, res) => {
  const trip = trips.find((item) => item.id === req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const route = routes.find((item) => item.id === trip.routeId);

  res.json({
    trip,
    route,
    latestPoint: gpsHistory.filter((item) => item.tripId === trip.id).slice(-1)[0] || null,
  });
});

app.post('/trips/:id/gps', (req, res) => {
  const trip = trips.find((item) => item.id === req.params.id);
  if (!trip) return res.status(404).json({ message: 'Trip not found' });

  const { lat, lng, speedKmh } = req.body || {};
  const point = {
    tripId: trip.id,
    lat,
    lng,
    speedKmh: speedKmh || 0,
    timestamp: new Date().toISOString(),
  };

  gpsHistory.push(point);
  trip.currentLat = Number(lat);
  trip.currentLng = Number(lng);
  trip.speedKmh = Number(speedKmh || 0);
  trip.lastUpdated = point.timestamp;

  res.json({ message: 'GPS updated', point });
});

app.get('/bookings', (req, res) => {
  res.json(bookings);
});

app.post('/bookings', (req, res) => {
  const { passengerId, routeId, tripId, seats, amount } = req.body || {};

  if (!passengerId || !routeId || !tripId || !seats || !Array.isArray(seats)) {
    return res.status(400).json({ message: 'Invalid booking payload' });
  }

  const booking = {
    id: 'bk' + crypto.randomUUID().slice(0, 6),
    passengerId,
    routeId,
    tripId,
    seats,
    amount: amount || 0,
    status: 'confirmed',
  };

  bookings.push(booking);
  return res.status(201).json({ message: 'Booking confirmed', booking });
});

app.get('/dashboard/admin', (req, res) => {
  const summary = {
    totalRoutes: routes.length,
    activeTrips: trips.filter((item) => item.status === 'in_transit').length,
    bookingsToday: bookings.length,
    revenue: bookings.reduce((sum, item) => sum + item.amount, 0),
  };

  res.json(summary);
});

app.listen(port, () => {
  console.log(`BusTrack API running on http://localhost:${port}`);
});
