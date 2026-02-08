# Specification

## Summary
**Goal:** Remove all call-related functionality from the app and rename the app to “MessageCenter”.

**Planned changes:**
- Remove all call-related types, state, and public methods from the backend Motoko canister so no call APIs remain in the canister interface.
- Remove all call-related UI and data-layer code from the frontend, including the Calls page, /calls route, related React Query hooks, and any navigation entries/icons linking to calls.
- Update user-facing branding to “MessageCenter”, including the in-app header/title and the browser tab title.

**User-visible outcome:** The app no longer shows or supports any Calls feature, and the UI branding consistently displays “MessageCenter”.
