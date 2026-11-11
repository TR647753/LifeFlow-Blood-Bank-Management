# Direct map navigation update

View Route now opens `/route` as a separate map page rather than embedding a map below the dashboard.

- Donor Blood Requests: hospital/camp choice map
- Donor Blood Camps: camp route map
- Admin Blood Requests: hospital route map
- Admin Delivery Route: bank pickup to hospital route map
- Patient Request History: planned route map (not live vehicle tracking)

The route page receives details through React Router navigation state. Use the dashboard button again after a full page refresh on the route page.

No database migration, reseed, or .env changes are required.
