import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Bus } from './models.js';
dotenv.config();
const date = (days=0) => { const d = new Date(); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); };
const buses = [
 { busName:'Southern Express',busNumber:'BG-001',from:'Colombo',to:'Galle',departureTime:'06:30 AM',arrivalTime:'09:00 AM',duration:'2h 30m',price:1200,seats:40,busType:'AC Luxury',date:date(0),amenities:['Air conditioning','USB charging','Reclining seats'] },
 { busName:'Coastal Rider',busNumber:'BG-002',from:'Colombo',to:'Galle',departureTime:'09:15 AM',arrivalTime:'11:45 AM',duration:'2h 30m',price:950,seats:40,busType:'Semi Luxury',date:date(0),amenities:['Air conditioning','Luggage space'] },
 { busName:'Hill Country Line',busNumber:'BG-003',from:'Colombo',to:'Kandy',departureTime:'07:00 AM',arrivalTime:'10:30 AM',duration:'3h 30m',price:1500,seats:40,busType:'AC Luxury',date:date(0),amenities:['Air conditioning','USB charging','Wi-Fi'] },
 { busName:'Capital Connect',busNumber:'BG-004',from:'Kandy',to:'Colombo',departureTime:'01:30 PM',arrivalTime:'05:00 PM',duration:'3h 30m',price:1450,seats:40,busType:'AC Luxury',date:date(0),amenities:['Air conditioning','Reclining seats'] },
 { busName:'Eastern Sunrise',busNumber:'BG-005',from:'Colombo',to:'Trincomalee',departureTime:'08:00 PM',arrivalTime:'04:00 AM',duration:'8h',price:2200,seats:40,busType:'Sleeper',date:date(0),amenities:['Sleeper berth','Air conditioning','USB charging'] },
 { busName:'Airport Shuttle',busNumber:'BG-006',from:'Negombo',to:'Colombo',departureTime:'10:00 AM',arrivalTime:'11:30 AM',duration:'1h 30m',price:700,seats:30,busType:'AC Luxury',date:date(0),amenities:['Air conditioning','Luggage space'] },
 { busName:'Jaffna Night Express',busNumber:'BG-007',from:'Colombo',to:'Jaffna',departureTime:'08:30 PM',arrivalTime:'05:30 AM',duration:'9h',price:2800,seats:40,busType:'Sleeper',date:date(1),amenities:['Sleeper berth','Air conditioning','USB charging'] },
 { busName:'Matara Coastal',busNumber:'BG-008',from:'Galle',to:'Matara',departureTime:'11:00 AM',arrivalTime:'12:15 PM',duration:'1h 15m',price:550,seats:30,busType:'Semi Luxury',date:date(0),amenities:['Air conditioning'] },
 { busName:'Cultural Route',busNumber:'BG-009',from:'Kandy',to:'Anuradhapura',departureTime:'06:00 AM',arrivalTime:'10:00 AM',duration:'4h',price:1700,seats:40,busType:'AC Luxury',date:date(1),amenities:['Air conditioning','USB charging'] },
 { busName:'Lake City Express',busNumber:'BG-010',from:'Colombo',to:'Kurunegala',departureTime:'02:00 PM',arrivalTime:'04:00 PM',duration:'2h',price:850,seats:40,busType:'Semi Luxury',date:date(0),amenities:['Air conditioning','Luggage space'] },
 { busName:'Southern Return',busNumber:'BG-011',from:'Galle',to:'Colombo',departureTime:'07:30 AM',arrivalTime:'10:00 AM',duration:'2h 30m',price:1200,seats:40,busType:'AC Luxury',date:date(0),amenities:['Air conditioning','USB charging'] },
 { busName:'Matara Express',busNumber:'BG-012',from:'Matara',to:'Colombo',departureTime:'06:00 AM',arrivalTime:'10:00 AM',duration:'4h',price:1600,seats:40,busType:'AC Luxury',date:date(1),amenities:['Air conditioning','Reclining seats'] },
 { busName:'Airport City Link',busNumber:'BG-013',from:'Colombo',to:'Negombo',departureTime:'09:00 AM',arrivalTime:'10:15 AM',duration:'1h 15m',price:600,seats:30,busType:'Semi Luxury',date:date(0),amenities:['Air conditioning','Luggage space'] },
 { busName:'Kandy Night Rider',busNumber:'BG-014',from:'Kandy',to:'Colombo',departureTime:'07:00 PM',arrivalTime:'10:30 PM',duration:'3h 30m',price:1400,seats:40,busType:'AC Luxury',date:date(1),amenities:['Air conditioning','USB charging','Wi-Fi'] },
 { busName:'Northern Heritage',busNumber:'BG-015',from:'Jaffna',to:'Anuradhapura',departureTime:'06:30 AM',arrivalTime:'10:30 AM',duration:'4h',price:1800,seats:40,busType:'AC Luxury',date:date(0),amenities:['Air conditioning','Reclining seats'] },
 { busName:'Trinco Coastal Express',busNumber:'BG-016',from:'Trincomalee',to:'Colombo',departureTime:'07:00 PM',arrivalTime:'03:00 AM',duration:'8h',price:2200,seats:40,busType:'Sleeper',date:date(1),amenities:['Sleeper berth','Air conditioning','USB charging'] },
 { busName:'Kurunegala Connector',busNumber:'BG-017',from:'Kurunegala',to:'Kandy',departureTime:'08:00 AM',arrivalTime:'10:00 AM',duration:'2h',price:750,seats:30,busType:'Semi Luxury',date:date(0),amenities:['Air conditioning'] },
 { busName:'Anuradhapura Express',busNumber:'BG-018',from:'Colombo',to:'Anuradhapura',departureTime:'06:00 AM',arrivalTime:'10:30 AM',duration:'4h 30m',price:1750,seats:40,busType:'AC Luxury',date:date(1),amenities:['Air conditioning','USB charging'] },
 { busName:'Galle Hill Country',busNumber:'BG-019',from:'Galle',to:'Kandy',departureTime:'05:30 AM',arrivalTime:'11:30 AM',duration:'6h',price:2100,seats:40,busType:'AC Luxury',date:date(0),amenities:['Air conditioning','USB charging','Reclining seats'] },
 { busName:'Negombo Hill Link',busNumber:'BG-020',from:'Negombo',to:'Kandy',departureTime:'07:00 AM',arrivalTime:'11:30 AM',duration:'4h 30m',price:1600,seats:40,busType:'AC Luxury',date:date(1),amenities:['Air conditioning','Luggage space'] }
];
await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/busgo');
for (const b of buses) await Bus.updateOne({busNumber:b.busNumber},{$set:b},{upsert:true});
console.log(`Seeded ${buses.length} sample buses.`);
await mongoose.disconnect();
