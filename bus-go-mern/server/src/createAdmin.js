import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models.js';
dotenv.config();
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busgo');
const email = 'admin@busgo.local';
const password = 'BusGoAdmin123!';
let user = await User.findOne({ email });
if (user) {
  user.role = 'admin';
  user.password = await bcrypt.hash(password, 12);
  await user.save();
} else {
  user = await User.create({ name: 'Bus Go Admin', email, password: await bcrypt.hash(password, 12), role: 'admin' });
}
console.log('Admin account ready:');
console.log(`Email: ${email}`);
console.log(`Password: ${password}`);
await mongoose.disconnect();
