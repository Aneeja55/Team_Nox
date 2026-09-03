# meSSET — Digital Mess Card

meSSET is a digital mess-card system for recording student lunch/snack attendance using a canteen QR code.

## Current architecture

- **Frontend:** `frontend2` (Next.js 15)
- **Backend:** `Backend` (Node.js + Express)
- **Database:** MongoDB / MongoDB Atlas
- **QR scanning:** `html5-qrcode`
- **Authentication:** JWT + bcrypt
- **Local timezone:** `Asia/Kolkata`

The older `frontend` directory is retained as the original React/Vite prototype. **Use `frontend2` for the working application.**

## Features

### Student
- Student login
- Lunch and snack session selection
- Server-side time-window validation
- Camera-based QR scanning
- One successful scan per meal per day
- Duplicate scan detection with beep feedback
- Meal history
- Calendar view
- Logout

### Admin
- Separate admin login
- Live attendance dashboard
- Student account creation/edit/delete
- Canteen QR generation and download
- Protected admin API routes

## Run locally

### 1. Backend

```bash
cd Backend
npm install
```

Create `.env` from `.env.example`:

```env
MONGO_URI=...
JWT_SECRET=...
QR_CODE=...
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
TIMEZONE=Asia/Kolkata
```

Start:

```bash
npm run dev
```

For the first admin account, set these temporary variables in your environment:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-strong-password
```

Then run:

```bash
npm run seed:admin
```

### 2. Frontend

```bash
cd frontend2
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Important security note

The original repository contained a MongoDB connection string in `Backend/.env`. That secret must be considered compromised if it was ever pushed to GitHub. Rotate the MongoDB database password and replace the JWT secret before deploying this version.

Do not commit `.env` or `.env.local`.

## Scan windows

- Lunch: **11:00 AM – 2:00 PM**
- Snacks: **3:30 PM – 5:00 PM**

These are enforced by the backend in `Asia/Kolkata`, so the rule remains correct even when the backend is hosted on a server using UTC.

## Deployment

Deploy the backend and frontend separately.

Backend environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `QR_CODE`
- `PORT`
- `CLIENT_ORIGIN`
- `TIMEZONE=Asia/Kolkata`

Frontend:

- `NEXT_PUBLIC_API_URL=https://<your-backend-domain>`

Make sure the backend CORS `CLIENT_ORIGIN` exactly matches the deployed frontend origin.

## API overview

- `POST /api/auth/login`
- `POST /api/auth/admin/login`
- `GET /api/auth/user/protected`
- `GET /api/auth/admin/protected`
- `GET /api/users/me`
- `GET /api/scan/availability?type=lunch|snack`
- `POST /api/scan`
- `GET /api/scan/history`
- `GET /api/scan/admin/dashboard`
- `GET /api/scan/admin/qr`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:userId`
- `DELETE /api/users/:userId`

## Notes on the data model

Successful scans are unique per student + meal + local calendar day. Duplicate attempts are retained as `status: "duplicate"` so the UI can show the intended red calendar indicator without granting another meal.

Existing old scan documents without `scanDay` are still checked by date range during the transition.
