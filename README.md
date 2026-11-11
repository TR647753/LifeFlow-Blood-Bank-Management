# LifeFlow — Blood Bank Management System (MERN)

Modern MERN blood bank app with admin, donor and patient roles, proof uploads, inventory, request tracking, maps and delivery-route planning.

## Prerequisites
- Node.js 20+ and npm
- MongoDB 7+ running locally as a **replica set** (required for atomic stock transactions) or MongoDB Atlas
- VS Code

## Install and run

1. Open `blood-bank-management` in VS Code.
2. Open a terminal in `server`:
   ```bash
   npm install
   cp .env.example .env
   npm run seed
   npm run dev
   ```
   On Windows PowerShell use `Copy-Item .env.example .env` instead of `cp`.
3. Open a second terminal in `client`:
   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```
4. Open http://localhost:5173

### MongoDB transactions (important)
For local MongoDB, configure a single-node replica set (`replSetName: rs0` in mongod.cfg), restart MongoDB, then execute `rs.initiate()` in `mongosh` once. Set `MONGO_URI=mongodb://127.0.0.1:27017/blood_bank?replicaSet=rs0`. Alternatively use a MongoDB Atlas cluster. Without a replica set, recording donations and fulfilling requests will fail intentionally rather than risk inconsistent stock.

### Demo accounts (after `npm run seed`)
- Admin: `admin@bloodbank.test` / `ChangeMe123!` (or values from your server `.env`)
- Donor: `donor1@demo.test` / `Demo12345!` (donor2 through donor5 also exist)
- Patient: `patient1@demo.test` / `Demo12345!` (patient2 through patient5 also exist)

**WARNING:** The seed script deletes existing records. Run only on a development database. Change all demo credentials before any public deployment.

## Functional workflow
- Donors register, await admin approval, then sign in.
- Patients register and submit requests; matching approved/available donors in the same district receive in-app notifications.
- Admin reviews requests, approves, and fulfills them using unexpired stock. Fulfillment deducts batches earliest-expiry-first inside a MongoDB transaction.
- Admin records donations, creating stock and donation history together inside a transaction.
- Admin can upload proof to inventory and donation records; patients can upload proof for requests. Files are JPG/PNG/PDF up to 5 MB, stored in `server/uploads` and linked by relative paths.
- Donor maps use OpenStreetMap tiles and saved latitude/longitude coordinates. The admin delivery planner uses Nominatim geocoding and OSRM routing. Public services require Internet access and may impose usage limits; use a hosted provider or self-host in production.
- Blood availability excludes expired batches immediately at query time; records remain for audit. Dashboard statistics come from MongoDB.

## Security and operational notes
- JWT bearer tokens are held in localStorage for this classroom/demo build. For production use HttpOnly secure cookies, CSRF protection, file scanning, private authenticated proof downloads, access logging, refresh-token revocation, TLS and secret rotation.
- Proof uploads are currently publicly served by filename; do **not** upload real patient medical records or personally identifying documents in this demo. Restrict proof access in production.
- Donor search exposes only limited public fields. Coordinates must be supplied by authorized users/admin; seed includes sample Chennai coordinates.
- The 90-day eligibility interval is illustrative, **not** a medical clearance rule. Qualified medical staff must approve actual eligibility.
- The route planner provides an approximate driving path, not live traffic or verified clinical transport logistics. Blood handling and transport must follow local clinical rules.
- In-app notifications are provided; SMS/email delivery is not configured.
- Admin registration is deliberately disabled; only seed creates the admin account.

## REST endpoints
`/api/auth`, `/api/admin`, `/api/donors`, `/api/patients`, `/api/blood`, `/api/requests`, `/api/donations`, `/api/notifications`, `/api/upload`.

## Troubleshooting
- `ECONNREFUSED 27017`: MongoDB is not running; check Windows Services and MongoDB logs.
- `Transaction numbers are only allowed on a replica set`: enable replica set as above.
- `CORS`: ensure `CLIENT_URL` is the exact Vite origin.
- `401`: sign in again; JWT expired or missing.
- Map route not found: use precise geocodable pickup/hospital addresses and ensure Internet connectivity.

## Structure
- `server/models/index.js`: seven Mongoose models
- `server/routes`: authentication, admin, donor, patient, inventory, requests, donations, notifications, proof uploads
- `server/middleware`: JWT role guard and upload validation
- `client/src/dashboards`: three role dashboards
- `client/src/components`: tables, proof uploads and Leaflet maps
- `client/src/context`: auth state
- `client/src/services`: Axios client
