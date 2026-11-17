# BusTrack

BusTrack is a full-stack intercity bus mobility platform for Tamil Nadu with three user roles:

- Passenger
- Driver
- Admin

## Stack

- Backend: Node.js + Express
- Frontend: React + Vite
- Android: Kotlin + Jetpack Compose (project scaffold)
- Database: PostgreSQL + PostGIS (recommended in production)
- Real-time: WebSockets + Redis (recommended in production)

## Project structure

```text
.
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── web/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── android/
│   └── app/
├── README.md
└── .gitignore
```

## Run backend

```bash
cd backend
npm install
npm start
```

API available at http://localhost:5000

## Run web app

```bash
cd web
npm install
npm run dev
```

Open http://localhost:5173

## Notes

This repository contains a working MVP backend and web dashboard, plus an Android app scaffold for the next stage of development. Production deployment should use PostgreSQL, Redis, a proper GPS feed, payment gateway, and notification service.

## Core features

- Route search and booking
- Live bus tracking with simulated GPS
- Driver trip management
- Admin fleet dashboard
- Real-time analytics summary
- Service-ready modular design
