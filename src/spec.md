# Specification

## Summary
**Goal:** Add manual per-contact birthday gift planning and “sent” tracking for authenticated users.

**Planned changes:**
- Add backend storage and canister methods to create, list, update, and delete gift plans scoped to the authenticated caller principal.
- Define a gift plan type containing: id, contactId, giftName, optional note/message, optional vendorUrl, status, createdAt, updatedAt.
- Add a new “Gifts” tab in the authenticated UI to view gift plans and create/edit/delete plans linked to existing contacts.
- Integrate gift plan fetching and mutations via React Query, including cache invalidation after create/update/delete and consistent loading/error states.
- Add a manual status workflow (e.g., Planned → Ordered → Sent) and a one-click action in the list to mark a plan as “Sent,” clearly presented as tracking only.

**User-visible outcome:** Users can open a new “Gifts” tab to plan gifts for their birthday contacts, update gift details and status, quickly mark a gift as sent, and manage (edit/delete) their own gift plans with the UI staying in sync automatically.
