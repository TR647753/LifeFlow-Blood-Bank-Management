# LifeFlow consolidated testing guide

## What is implemented in this package
- Donor routes to patient hospital or authorized donation camp, with editable destination search.
- Admin manages camps, blood requests, inventory fulfillment, dispatch and delivery.
- Admin records a donation; donor sees donation history, a notification, and a printable certificate (browser Print -> Save as PDF).
- Certificate is available only after admin records a donation, not when a donor merely accepts a request.

## Test workflow
1. Log in as patient; create a fictional test request with a geocodable hospital address.
2. Log in as admin; approve the request.
3. Log in as eligible donor; accept the request; open View Route and choose hospital or verified camp.
4. Admin -> Donations: record a donation with an approved donor and valid dates.
5. Donor -> Donation History: check the record and click Print / Save PDF. Check Notifications.
6. For donor-unavailable flow: admin approves a different request, checks valid inventory, fulfills, records dispatch, then marks delivered.
7. Refresh each dashboard to verify persistence.

## Important limitations
- No live MongoDB integration tests have been performed in this package.
- This is a demonstration system. Inventory additions do not implement real laboratory screening or clinical release authorization. Do not use it to make actual transfusion decisions.
- Browser printing uses Print -> Save as PDF, not a server-generated signed PDF.
- No automated appointment booking, staff identity verification, or real-time vehicle tracking.
- Keep server/.env private; do not seed or reset the existing database.
