# Security Specification: LanzPortofolio Firestore ABAC & RBAC

## 1. Data Invariants
1. **Public vs Admin Partitioning**:
   - The public can READ `/settings/portfolio`, `/projects`, `/skills`, and `/socials`.
   - The public can ONLY CREATE documents in `/messages` with valid sanitized fields (`name`, `email`, `subject`, `message`, `status == 'unread'`). The public CANNOT read, list, update, or delete `/messages`.
   - Only authenticated administrators registered in `/admins/{adminId}` have full read/write access to `/settings`, `/projects`, `/skills`, `/socials`, `/messages`, and `/admins`.
2. **Identity Integrity**:
   - Unauthenticated or non-admin users cannot write or overwrite `/settings`, `/projects`, `/skills`, or `/socials`.
   - Self-assigned admin role is forbidden: only existing admins can create or modify `/admins`.
3. **Payload Boundaries**:
   - All string fields enforce strictly bounded lengths (`name <= 100`, `email <= 150`, `subject <= 200`, `message <= 3000`).
   - Junk oversized strings or shadow properties are rejected.
4. **Document ID Sanitization**:
   - All document IDs accessed via single operations must satisfy `isValidId(id)` (`id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`).

---

## 2. The "Dirty Dozen" Malicious Payloads (Must Return PERMISSION_DENIED)

1. **Unauthenticated Portfolio Overwrite**:
   - `PUT /settings/portfolio` by `auth: null`.
   - Expect: PERMISSION_DENIED.
2. **Public Message Reading (PII Leak)**:
   - `GET /messages/{messageId}` by `auth: null`.
   - Expect: PERMISSION_DENIED.
3. **Public Message Scraping (List Attack)**:
   - `LIST /messages` by `auth: null`.
   - Expect: PERMISSION_DENIED.
4. **Forged Message Status Injection (Status shortcutting)**:
   - `CREATE /messages/{id}` with `{ status: "replied" }` by `auth: null`.
   - Expect: PERMISSION_DENIED (public messages must start with `unread`).
5. **Denial of Wallet Message Buffer Overflow**:
   - `CREATE /messages/{id}` with `message: 100,000 character string`.
   - Expect: PERMISSION_DENIED (max size 3000 chars).
6. **Shadow Field Injection on Message**:
   - `CREATE /messages/{id}` with `{ name: "A", email: "a@a.com", subject: "S", message: "M", status: "unread", ghostField: true }`.
   - Expect: PERMISSION_DENIED.
7. **Unverified Admin Spoofing**:
   - Request from an authenticated user who is not registered in `/admins/{adminId}` attempting to modify `/settings/portfolio`.
   - Expect: PERMISSION_DENIED.
8. **Malicious Project Deletion**:
   - `DELETE /projects/{id}` by non-admin authenticated user.
   - Expect: PERMISSION_DENIED.
9. **Self-Promotion to Admin**:
   - `CREATE /admins/{myUid}` with `{ email: "attacker@hack.com", role: "superadmin" }` by non-admin user.
   - Expect: PERMISSION_DENIED.
10. **ID Poisoning Attack**:
    - Single doc operation on `/projects/../../malicious` or containing special characters.
    - Expect: PERMISSION_DENIED.
11. **Skill Mutation by Public**:
    - `UPDATE /skills/{id}` by unauthenticated visitor.
    - Expect: PERMISSION_DENIED.
12. **Social Channel Deletion by Non-Admin**:
    - `DELETE /socials/{id}` by unauthenticated visitor.
    - Expect: PERMISSION_DENIED.
