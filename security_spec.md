# Security Specification & Threat Model

## 1. Data Invariants

- **Invariant 1 (User Profile Isolation)**: An operator profile at `/users/{userId}` can only be accessed or modified by the authenticated user whose `request.auth.uid == userId`. Users cannot elevate their clearance role or modify another operator's identity.
- **Invariant 2 (Ownership & Path Binding)**: A tracked subject at `/users/{userId}/tracked_subjects/{subjectId}` cannot exist without `userId == request.auth.uid`, and the path `{userId}` must strictly match the inner `userId` payload attribute.
- **Invariant 3 (Immortal Creation Audit)**: `createdAt` timestamp must be strictly synchronized to server time `request.time` upon creation and must remain immutable across all subsequent updates (`incoming().createdAt == existing().createdAt`).
- **Invariant 4 (Schema Whitelist & Strict Keys)**: No ghost fields or shadow properties are permitted. Payloads must contain strictly allowable keys via `hasOnly()`.
- **Invariant 5 (Verified Email Requirement)**: All write mutations require authenticated tokens with `request.auth.token.email_verified == true`.
- **Invariant 6 (Report Append-Only / Immutable Invariant)**: Incident reports at `/users/{userId}/incident_reports/{reportId}` are permanent audit logs. Once created, they are immutable (`allow update: if false;`).

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Cross-User Profile Impersonation**
   - Attempt: User `attacker-123` attempts to write into `/users/victim-456`.
   - Result: Expected `PERMISSION_DENIED`.
2. **Payload 2: Role Escalation via Shadow Field**
   - Attempt: Operator injects `role: "admin"` or `isAdmin: true` into their user profile.
   - Result: Expected `PERMISSION_DENIED`.
3. **Payload 3: Unverified Email Write Attack**
   - Attempt: Authenticated token with `email_verified: false` attempts to write records.
   - Result: Expected `PERMISSION_DENIED`.
4. **Payload 4: Path Variable Poisoning (Junk/Oversized ID)**
   - Attempt: Target creation using a 2KB junk character string as `{subjectId}`.
   - Result: Expected `PERMISSION_DENIED` via `isValidId()`.
5. **Payload 5: Subject Record With Mismatched UID**
   - Attempt: User `auth-001` writes to `/users/auth-001/tracked_subjects/sub-1` with `{ userId: "auth-002" }`.
   - Result: Expected `PERMISSION_DENIED`.
6. **Payload 6: Client Timestamp Manipulation on Creation**
   - Attempt: Client supplies arbitrary spoofed past or future `createdAt` value instead of `request.time`.
   - Result: Expected `PERMISSION_DENIED`.
7. **Payload 7: Immortal Field Mutability Attack**
   - Attempt: Client sends an update altering `createdAt` or original `id`.
   - Result: Expected `PERMISSION_DENIED`.
8. **Payload 8: Ghost Field Injection (The Shadow Update)**
   - Attempt: Client update adds unrecognized property `{ backdoor: true, status: "intercepted" }`.
   - Result: Expected `PERMISSION_DENIED` via `hasOnly()`.
9. **Payload 9: Oversized String Buffer Attack (Denial of Wallet)**
   - Attempt: Client sends 100KB string in `label` or `description`.
   - Result: Expected `PERMISSION_DENIED` via `.size() <= max` bounds.
10. **Payload 10: Unauthorized Blanket Query / Data Scraping**
    - Attempt: Unauthenticated or non-owner query to list `/users/{userId}/incident_reports`.
    - Result: Expected `PERMISSION_DENIED`.
11. **Payload 11: Tampering with Locked Incident Report**
    - Attempt: Client attempts an `update` on an existing `/users/{userId}/incident_reports/{reportId}` audit record.
    - Result: Expected `PERMISSION_DENIED`.
12. **Payload 12: Cross-Tenant Delete**
    - Attempt: User `attacker-789` attempts to delete victim's tracked subject document.
    - Result: Expected `PERMISSION_DENIED`.

---

## 3. Test Runner Definition

The test suite in `firestore.rules.test.ts` validates these 12 invariants using `@firebase/rules-unit-testing`.
