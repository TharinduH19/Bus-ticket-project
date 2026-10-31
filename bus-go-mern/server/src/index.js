import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Bus, Booking } from './models.js';

dotenv.config();
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required. Copy server/.env.example to server/.env and set a secret.');
  process.exit(1);
}
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

const signToken = (user) => jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

async function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Please log in to continue.' });
  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(req.auth.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'Account not found.' });
    next();
  } catch { return res.status(401).json({ message: 'Your session expired. Please log in again.' }); }
}
function admin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'Bus Go API' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ message: 'Could not create account.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});
app.get('/api/auth/me', auth, (req, res) => res.json({ user: req.user }));

app.get('/api/buses', async (req, res) => {
  const filter = {};
  if (req.query.from) filter.from = new RegExp(`^${String(req.query.from).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (req.query.to) filter.to = new RegExp(`^${String(req.query.to).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (req.query.date) filter.date = req.query.date;
  const buses = await Bus.find(filter).sort({ departureTime: 1 });
  const results = await Promise.all(buses.map(async bus => {
    const bookings = await Booking.find({ bus: bus._id, travelDate: bus.date, bookingStatus: 'confirmed' }).select('seatNumbers');
    const bookedSeats = bookings.flatMap(b => b.seatNumbers);
    return { ...bus.toObject(), bookedSeats };
  }));
  res.json(results);
});

app.get('/api/buses/:id', async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) return res.status(404).json({ message: 'Bus not found.' });
  const bookings = await Booking.find({ bus: bus._id, travelDate: req.query.date || bus.date, bookingStatus: 'confirmed' }).select('seatNumbers');
  res.json({ ...bus.toObject(), bookedSeats: bookings.flatMap(b => b.seatNumbers) });
});

app.post('/api/bookings', auth, async (req, res) => {
  try {
    const { busId, travelDate, seatNumbers } = req.body;
    if (!busId || !travelDate || !Array.isArray(seatNumbers) || !seatNumbers.length) return res.status(400).json({ message: 'Choose at least one seat.' });
    const seats = [...new Set(seatNumbers.map(Number))];
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found.' });
    if (seats.some(n => !Number.isInteger(n) || n < 1 || n > bus.seats)) return res.status(400).json({ message: 'Invalid seat selection.' });
    const existing = await Booking.find({ bus: busId, travelDate, bookingStatus: 'confirmed', seatNumbers: { $in: seats } });
    if (existing.length) return res.status(409).json({ message: 'One or more selected seats have just been booked. Please select again.' });
    // Development demo payment: a real provider must verify payment server-side before confirmation.
    const booking = await Booking.create({
      user: req.user._id, bus: bus._id, travelDate, seatNumbers: seats,
      totalAmount: bus.price * seats.length, paymentStatus: 'paid',
      bookingStatus: 'confirmed', paymentReference: `DEMO-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
    });
    res.status(201).json(await Booking.findById(booking._id).populate('bus').populate('user', 'name email'));
  } catch (e) { res.status(500).json({ message: 'Booking could not be completed.' }); }
});

app.get('/api/bookings/mine', auth, async (req, res) => {
  res.json(await Booking.find({ user: req.user._id }).populate('bus').sort({ createdAt: -1 }));
});
app.patch('/api/bookings/:id/cancel', auth, async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  if (booking.bookingStatus === 'cancelled') return res.status(400).json({ message: 'This booking is already cancelled.' });
  booking.bookingStatus = 'cancelled';
  booking.paymentStatus = 'refunded'; // demo status only; no actual money is moved
  await booking.save();
  res.json({ message: 'Booking cancelled.', booking });
});

// Admin routes
app.get('/api/admin/summary', auth, admin, async (_req, res) => {
  const [users, buses, bookings, revenue] = await Promise.all([
    User.countDocuments({ role: 'user' }), Bus.countDocuments(), Booking.countDocuments({ bookingStatus: 'confirmed' }),
    Booking.aggregate([{ $match: { bookingStatus: 'confirmed', paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
  ]);
  res.json({ users, buses, bookings, revenue: revenue[0]?.total || 0 });
});
app.get('/api/admin/buses', auth, admin, async (_req, res) => res.json(await Bus.find().sort({ createdAt: -1 })));
app.post('/api/admin/buses', auth, admin, async (req, res) => {
  try {
    const body = req.body;
    const bus = await Bus.create({
      busName: body.busName, busNumber: body.busNumber, from: body.from, to: body.to,
      departureTime: body.departureTime, arrivalTime: body.arrivalTime, duration: body.duration,
      price: Number(body.price), seats: Number(body.seats || 40), busType: body.busType || 'AC Luxury',
      date: body.date, amenities: body.amenities || ['Air conditioning']
    });
    res.status(201).json(bus);
  } catch (e) { res.status(400).json({ message: e.code === 11000 ? 'Bus number already exists.' : 'Please check all bus details.' }); }
});
app.delete('/api/admin/buses/:id', auth, admin, async (req, res) => {
  const active = await Booking.countDocuments({ bus: req.params.id, bookingStatus: 'confirmed' });
  if (active) return res.status(409).json({ message: 'Cannot remove a bus with confirmed bookings.' });
  await Bus.findByIdAndDelete(req.params.id);
  res.json({ message: 'Bus removed.' });
});
app.get('/api/admin/bookings', auth, admin, async (_req, res) => res.json(await Booking.find().populate('bus').populate('user', 'name email').sort({ createdAt: -1 })));

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busgo')
  .then(() => app.listen(port, () => console.log(`Bus Go API running on http://localhost:${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
