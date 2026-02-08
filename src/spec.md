# Specification

## Summary
**Goal:** Update the Inbox/Chats list UI to show each friend’s human-readable identity (displayName/username and avatar) instead of raw Principal IDs.

**Planned changes:**
- Update Inbox/Chats list items to render a friend’s `displayName` (and `username`) when profile data is available, rather than showing the Principal text.
- Add friend profile lookups for chat entries using existing frontend query patterns (e.g., React Query) to fetch `displayName`, `username`, and `profilePicture` without modifying immutable hook/UI files.
- Add graceful UI fallbacks: show a loading placeholder while profiles are fetching, and an “Unknown user” fallback when no profile is found; avoid showing raw Principal IDs as the primary label.
- Keep navigation behavior unchanged: clicking a chat still routes to `/chat/$userId` using the friend’s Principal as the route param.

**User-visible outcome:** On the Inbox page, chat entries show friends’ display names/usernames and avatars (or sensible placeholders), instead of random-looking Principal strings, while chat navigation continues to work as before.
