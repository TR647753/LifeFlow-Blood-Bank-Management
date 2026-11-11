# Shared Route Map Update

Added reusable SharedRoutePlanner using Leaflet, OpenStreetMap geocoding and OSRM routing.

- Donor > Blood Camps: embedded camp route planner (original external directions link retained).
- Donor > Blood Requests: existing hospital/camp route remains unchanged.
- Admin > Delivery Route: shared route map with editable pickup and hospital destination.
- Admin > Blood Requests: Plan Route preview.
- Patient > Request History: View Planned Route preview.

Route previews are not live tracking and do not indicate blood was dispatched. Public geocoding/routing services may be unavailable or rate-limited. Enter actual, verified addresses. No database schema, API endpoints, credentials or MongoDB records were modified.

Run `npm install` then `npm run build` in client before deployment. Verify route maps in a browser with your data.
