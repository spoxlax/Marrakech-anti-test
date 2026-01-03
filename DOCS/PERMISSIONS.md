# Permission System & Architecture Documentation

## Overview
The Antigravity-kech system uses a hierarchical Role-Based Access Control (RBAC) system combined with resource ownership logic. This document outlines the permission inheritance rules, session management, and sidebar rendering logic.

## 1. Permission Inheritance Rules

### Vertical Inheritance (Role-Based)
- **Admin**: Has implicit `*` (superuser) permission. Can access all resources and perform all actions.
- **Vendor**: Has implicit ownership of their own resources. Can manage their own team and profiles.
- **Employee**: Inherits permissions assigned to their profile.
  - **Constraint**: An employee can only exercise permissions that their **creating admin/vendor** also possesses.
  - **Scope**: Restricted to the resources owned by their vendor/admin.

### Horizontal Scope (Ownership-Based)
- **Vendors**: Can only view/edit activities and bookings where `vendorId` matches their own `ownerId`.
- **Employees**: Can only view/edit activities and bookings where `vendorId` matches their `ownerId` (the vendor they work for).
- **Customers**: Can only view their own bookings (`customerId` match).

### Effective Permission Calculation
The system calculates effective permissions at runtime:
1. **Role Check**: If `admin`, grant all.
2. **Ownership Check**: If resource belongs to another vendor, deny (unless admin).
3. **Profile Check**: If `employee`, check if `user.permissions` includes the required action (e.g., `activities:view`).

## 2. Guest Session Management

### Architecture
To support seamless guest booking and conversion:
1. **Guest Token**: A unique `guestToken` is generated when a guest creates a booking.
   - Stored in `Booking` collection.
   - Returned to frontend in `createBooking` mutation.
2. **Storage**: The frontend stores `guestToken` in `localStorage`.
3. **Association**:
   - Upon registration (`/register`), the `guestToken` is sent to `associateGuestBookings` mutation.
   - The backend links all bookings with that token (or matching email) to the new `userId`.
   - The `guestToken` is cleared from the booking to prevent reuse.

### Edge Cases
- **Session Expiry**: `guestToken` persists in `localStorage`. If cleared, email fallback is used.
- **Cross-Device**: Token is device-specific. Cross-device association relies on email matching.

## 3. Sidebar Rendering Logic

### Component Visibility
Sidebar items in `HostingLayout` are filtered based on permissions:
- `mainNavItems`: Filtered by specific permissions (e.g., `activities:view`).
- `managementNavItems`: Filtered by specific permissions (e.g., `employees:view`, `settings:view`).

### Diagnostic Tools
In development mode, the sidebar logs the following to the console:
- User Identity (Role, ID).
- Raw Permissions Array.
- Evaluation results for key permissions (`activities:view`, etc.).

### Troubleshooting
If a user cannot see a sidebar item:
1. Check console logs for "Sidebar Permission Diagnostics".
2. Verify the user's `permissions` array includes the required permission string.
3. Verify the user's `role` is correct.

## 4. Security Measures

- **Privilege Escalation Prevention**: `canAssignPermissions` helper ensures users cannot assign permissions they don't have.
- **Audit Logging**: Critical actions (login, permission change, sensitive data access) are logged to `AuditLog` collection.
- **Input Validation**: All mutations validate input ownership (e.g., `vendorId` matches `user.ownerId`).
