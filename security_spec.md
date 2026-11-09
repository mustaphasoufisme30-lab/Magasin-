# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Public Storefront Visibility Gate**: Unauthenticated visitors and non-admin users can only `get` or `list` documents in `/products/{productId}` where `resource.data.visible == true`. Hidden products (`visible == false`) are strictly restricted to the verified bootstrapped administrator (`mustaphasoufisme@gmail.com` with `email_verified == true`).
2. **Admin-Only Mutations**: Only the verified administrator (`isAdmin()`) may `create`, `update`, or `delete` documents in `/products/{productId}`.
3. **Identity & Ownership Integrity**: Every product document must record `ownerId == request.auth.uid` on creation, and `ownerId`, `id`, `slug`, and `createdAt` are strictly immutable across all updates.
4. **Temporal Integrity**: `createdAt` and `updatedAt` must equal `request.time` on creation, and `updatedAt` must equal `request.time` on update.
5. **Strict Schema & Volumetric Bounds**: All 21 schema keys are mandatory (`hasAll` and `hasOnly`). Every string and array is strictly bounded in length to prevent Denial of Wallet attacks.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Product Creation**: `auth = null`, attempting `create` on `/products/prod-1`.
2. **Non-Admin Authenticated Write**: `auth = { uid: 'attacker', email: 'other@gmail.com', email_verified: true }`, attempting `create` on `/products/prod-1`.
3. **Unverified Admin Email Spoof**: `auth = { uid: 'spoof', email: 'mustaphasoufisme@gmail.com', email_verified: false }`, attempting `create` on `/products/prod-1`.
4. **Shadow Field Injection on Create**: Admin payload including an undeclared field `isFeaturedHack: true`.
5. **OwnerId Spoofing on Create**: Admin payload where `ownerId: 'someone-else'` instead of `request.auth.uid`.
6. **ID Mismatch Poisoning**: Creating `/products/prod-1` where `data.id == 'prod-2'`.
7. **Path ID Regex Violation**: Creating `/products/invalid id with spaces` violating `^[a-zA-Z0-9_\-]+$`.
8. **String Size Overflow (Denial of Wallet)**: Setting `name` to a 500-character string (exceeding `maxLength: 200`).
9. **Array Size Overflow**: Setting `features` to an array of 50 items (exceeding `size() <= 30`).
10. **Client Timestamp Forgery**: Setting `createdAt` or `updatedAt` to a past/future timestamp instead of `request.time`.
11. **Immutable Field Mutation on Update**: Updating `createdAt` or `ownerId` on an existing product.
12. **Unauthorized Hidden Product Read**: Unauthenticated user attempting `get` on a product where `visible == false`.
