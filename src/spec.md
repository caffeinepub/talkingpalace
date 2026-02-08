# Specification

## Summary
**Goal:** Make room joining reliable (no false “Invalid join code” errors) and allow users to join and participate in rooms as guests without requiring Internet Identity.

**Planned changes:**
- Normalize room join codes in the backend lookup (trim whitespace and handle case-insensitive matching) and keep invalid-code errors in clear English.
- Fix backend room membership checks and message authorization to work for guest participants using the same guest participant identifier that was used when joining.
- Update the frontend Rooms “Join Room” flow to support joining via guest sessions, route unsigned users to Sign In with “Continue as Guest,” and display friendly English toasts for invalid codes and full rooms.

**User-visible outcome:** Users can join rooms successfully even if they paste codes with extra spaces or different letter casing, and they can join/view/send messages as guests without Internet Identity, with clear English feedback when joining fails.
