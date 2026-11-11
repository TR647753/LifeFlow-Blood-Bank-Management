# LifeFlow — MongoDB Compass (Local MongoDB) Setup

This project uses **MongoDB Community Server locally**. MongoDB Compass is the graphical database viewer, not the database server itself. MongoDB Atlas is not required.

## 1. Verify the MongoDB server on Windows

Open **Command Prompt as Administrator**:

```cmd
sc query MongoDB
net start MongoDB
```

If the service does not exist, install MongoDB Community Server and choose the Windows Service option. If it returns error 1067, inspect MongoDB service logs and the configured dbPath before proceeding.

## 2. Connect MongoDB Compass

Open Compass, choose **New Connection**, and enter:

```
mongodb://127.0.0.1:27017
```

Click **Connect**. The project database is named `blood_bank` (see `server/.env.example`). It will appear after the seed script runs successfully.

## 3. Start backend

From the project root, open a PowerShell terminal:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env`: set `JWT_SECRET` to a long, unpredictable secret. Confirm `MONGO_URI=mongodb://127.0.0.1:27017/blood_bank` for local development.

**Transactions requirement:** The inventory/request transaction code requires a MongoDB replica set. A standalone local server does not support multi-document transactions. Configure a single-node replica set (`replSetName: rs0` in `mongod.cfg`), restart MongoDB, and initialize it once in `mongosh` using `rs.initiate()`. Update `MONGO_URI` to `mongodb://127.0.0.1:27017/blood_bank?replicaSet=rs0`. Back up any existing data before changing database service settings. Verify `rs.status()` reports PRIMARY.

Then:

```powershell
npm run seed
npm run dev
```

## 4. Start frontend

Open a **second** PowerShell terminal at the project root:

```powershell
cd client
npm install
Copy-Item .env.example .env
npm run dev
```

Open the URL shown by Vite, normally http://localhost:5173.

## 5. Inspect records in Compass

Refresh the databases list and open `blood_bank`. Collections contain account profiles, inventory, requests, donations, and notifications. Login email addresses are readable; passwords are stored as bcrypt hashes and cannot be recovered as plaintext. Seed credentials are configured in `server/.env` and `server/seed.js`.

## 6. Proof uploads and routes

The proof upload endpoints store files in the backend's uploads folder, while MongoDB stores file references. Treat uploads as sensitive medical records: the demo implementation is not a production-ready secure document vault. The delivery route map uses public OpenStreetMap tiles, Nominatim geocoding and demo OSRM routing, which require internet and are not suitable for guaranteed emergency logistics or live traffic estimates.

## 7. Deployment caveat

This is a **development prototype**. Before real clinical use, complete security/privacy review, authenticated file delivery, malware scanning, audit logging, medical validation, and thorough integration testing.
