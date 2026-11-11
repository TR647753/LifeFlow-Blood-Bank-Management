# Camp notification and registration update

Admin creates a camp with name, address, city and future date. Mark it authorized only after confirming organizer approval. Active, authorized upcoming camps are visible in Donor > Blood Camps. Eligible approved donor accounts receive an in-app notification when such a camp is created or becomes authorized/active; refresh Notifications to view it. Donors may register or cancel, and open directions to the camp. Registrations are stored in the new CampRegistration MongoDB collection. No seed or database reset is required.

Tests: (1) Admin creates unverified camp: not shown to donors; (2) Admin verifies camp: approved donors get notification; (3) donor registers, refreshes, sees Registered; (4) cancel and re-register; (5) expired/inactive camps not offered; (6) donor opens directions. Registration is not proof of donation. This update does not send SMS/email/push alerts and does not implement camp capacity or staff check-in.
