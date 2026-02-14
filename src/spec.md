# Specification

## Summary
**Goal:** Remove the in-app domain configuration experience so the UI no longer prompts users to select/apply a domain slug or shows an applied domain URL.

**Planned changes:**
- Remove the domain-setup UI entry points from the Upcoming dashboard (e.g., stop rendering `DomainSlugSuggestionsCard` or equivalent).
- Remove/clean up domain-related frontend code paths (components/hooks/utilities) so the app no longer triggers domain suggestion/configuration calls during normal navigation and builds without unused import/lint issues.
- Ensure core authenticated/unauthenticated flows (login, profile setup, tabs, contacts, gifts, upcoming birthdays) continue to work without errors after removing the domain UI.

**User-visible outcome:** Users will no longer see any in-app prompts or success messages related to domains/domain slugs/public URLs, and the rest of the app will function as before.
