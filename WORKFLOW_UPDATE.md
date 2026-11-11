# LifeFlow: donor hospital/camp and inventory dispatch workflow

- Admin > Donation Camps: add camp, mark verified authorized and active. Only verified active camps appear to donors. Verify authorization outside the app before using real sites.
- Patient creates request; Admin approves; matching donor accepts; Donor > Blood Requests > View Route: Hospital / Camp. Hospital option requires confirmation that hospital accepts donations. Route is a demonstration and is not an appointment.
- If donor is unavailable, Admin can use existing approved inventory via Blood Requests > Fulfill, then Delivery Route > select request > enter blood bank pickup > Record Dispatch > Mark Delivered. Stock is deducted only by Fulfill, once; no additional deduction on dispatch.
- Existing database records and schema remain compatible; new fields have defaults. No database reset or seed required. Existing `.env` is not bundled.
- Inventory is matched by identical blood group, NOT full clinical compatibility, and there is no laboratory-release flag in this demo. Admin must independently verify screening, testing, component type, compatibility, and release before fulfillment. Do not use this application for real clinical decisions.
- Routes rely on public Nominatim and OSRM services; address geocoding may fail, and estimates are not live traffic.
