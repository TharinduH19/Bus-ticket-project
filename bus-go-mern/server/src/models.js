import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

const busSchema = new mongoose.Schema({
  busName: { type: String, required: true },
  busNumber: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  duration: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  seats: { type: Number, default: 40 },
  busType: { type: String, default: 'AC Luxury' },
  date: { type: String, required: true },
  amenities: { type: [String], default: ['Air conditioning', 'USB charging'] }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  travelDate: { type: String, required: true },
  seatNumbers: { type: [Number], required: true },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'refunded'], default: 'paid' },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  paymentReference: { type: String, default: '' }
}, { timestamps: true });

bookingSchema.index({ bus: 1, travelDate: 1, seatNumbers: 1, bookingStatus: 1 });

export const User = mongoose.model('User', userSchema);
export const Bus = mongoose.model('Bus', busSchema);
export const Booking = mongoose.model('Booking', bookingSchema);
