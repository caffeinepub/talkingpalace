# Specification

## Summary
**Goal:** Add an alternative guest sign-in flow alongside Internet Identity, and introduce joinable code-based chat rooms with polling-based message updates and a 50-participant cap.

**Planned changes:**
- Update the sign-in screen to offer both “Sign In with Internet Identity” and “Continue as Guest” with username + display name inputs.
- Persist a guest session locally so guest users can access the authenticated app shell, and ensure signing out clears both guest and Internet Identity session state.
- Add backend support for stable guest identities (not based on the anonymous Principal) while preserving existing Internet Identity profile and 1:1 chat behavior.
- Add a new Rooms section (separate from existing 1:1 chats) with UI to create a room (show join code) and join a room by code (with invalid-code errors).
- Implement room messaging with periodic polling for updates (no WebSockets), including sender identity, timestamps, and suitable “fetch latest/since” querying.
- Enforce a maximum of 50 participants per room with consistent backend rejection and clear frontend error messaging when full.
- Add Rooms navigation entry in the app shell to support: Rooms list → Create/Join → Room chat, without modifying declared immutable frontend paths.

**User-visible outcome:** Users can sign in either with Internet Identity or as a guest, then create rooms that generate a join code, join rooms by code (up to 50 participants), and chat in rooms where messages refresh automatically via polling.
