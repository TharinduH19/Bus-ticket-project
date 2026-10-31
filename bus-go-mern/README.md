# Bus Go — MERN Bus Ticket Booking App

A full-stack bus ticket booking starter built with MongoDB, Express, React, and Node.js.

## Features
- Register and log in before booking
- JWT authentication and role-based admin access
- Search bus routes by origin, destination, and date
- Seat selection and booking confirmation
- Demo payment flow (no real money is charged)
- User dashboard with bookings and cancellation
- Admin dashboard for routes, buses, bookings, and basic stats
- Dark mode toggle (saved in browser local storage)
- Responsive layout for desktop and mobile
- Seed data for Sri Lankan routes

## Requirements
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Install dependencies

Open two terminals in the project folder.

### Server
```bash
cd server
npm install
```

Copy `.env.example` to `.env` and replace `JWT_SECRET` with a unique random secret of at least 32 characters:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/busgo
JWT_SECRET=replace_this_with_a_unique_random_secret_at_least_32_characters
CLIENT_URL=http://localhost:5173
```

### Client
```bash
cd client
npm install
```

## 2. Seed demo buses and create admin
With MongoDB running, in the server folder:
```bash
npm run seed
npm run create-admin
```

Default demo admin:
- Email: `admin@busgo.local`
- Password: `BusGoAdmin123!`

Change the password after first login. Sign in with the admin account to open the Admin dashboard; there you can review bookings and manage bus routes. The seed command adds sample routes and buses.

## 3. Run the app
Server terminal:
```bash
cd server
npm run dev
```

Client terminal:
```bash
cd client
npm run dev
```

Open http://localhost:5173

The Vite dev server proxies `/api` requests to the backend on port 5000, so the frontend also works when you start Vite on a different port. Keep the backend and MongoDB running while using the frontend.

## Demo payment notice
The checkout page simulates a payment for development/testing only. It does not connect to a bank or payment gateway and does not charge money. For real payments, integrate a provider such as PayHere or Stripe on the server side and verify payment callbacks before confirming bookings.

## Security notes
- Set a strong unique `JWT_SECRET`.
- Never commit `.env`.
- The included admin creation script creates a local admin account for development. Remove or secure it before production.
- This is a starter project; production deployment should add rate limiting, email verification, robust payment-provider verification, audit logs, and stronger booking concurrency controls.
