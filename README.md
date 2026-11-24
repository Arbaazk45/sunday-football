# Sunday Football – Team Manager

Frontend-only Angular 21 app for managing Sunday football availability and generating balanced teams. Data and demo authentication are stored in **LocalStorage** (not production-secure).

## Quick start

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Demo admin account

- **Email:** `admin@sunday.local`
- **Password:** `Admin123!`

Register additional players from the registration page. New users appear on the Players list automatically.

## Features

- Login & registration (reactive forms + validation)
- Player list and profiles (admin CRUD)
- Sunday availability (Available / Not Available / Not Sure)
- Team generator with balancing algorithm (skill, position, experience, age)
- WhatsApp share & copy-message reminders
- User and admin dashboards
- Match history (browser storage)

## Tech stack

Angular 21, TypeScript, SCSS, Signals, Reactive Forms, Router, LocalStorage — no third-party UI libraries.

## Build

```bash
npm run build
```