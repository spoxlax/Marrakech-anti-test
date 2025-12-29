# 🔐 Security Best Practices (Self‑Hosted Only)

This file contains all required measures to keep your application secure without paid tools.

---

## 🔒 Core Principles

- Principle of least privilege  
- Enforce vendor isolation  
- Validate all inputs  
- Use HTTPS everywhere  
- Avoid storing JWT in localStorage  
- Sanitize database operations  
- Use secure headers  

---

## 🔑 Authentication & Authorization

- JWT access + refresh tokens  
- HTTP-only cookies (more secure)
- Role-based access:
  - admin  
  - vendor  
  - customer  
- Ownership checks:
  - Vendors can only edit their own activities/bookings

### 📜 Hierarchical Permission System

The system implements a robust permission inheritance model:

1.  **Vertical Inheritance (Admin/Vendor → Employee)**:
    - Employees inherit permissions from their assigned **Profile**.
    - **Intersection Rule**: An employee's effective permissions are the *intersection* of their Profile's permissions and their Parent's (Employer's) effective permissions.
    - If the Employer loses a permission, the Employee automatically loses it too.

2.  **Horizontal Scope (Ownership)**:
    - Permissions grant capability (e.g., `activities:view`), but **Ownership** limits scope.
    - An employee with `activities:view` can only view activities owned by their Employer (`vendorId` match).

3.  **Privilege Escalation Prevention**:
    - A user cannot assign a permission they do not possess.
    - **Checks**: `createProfile`, `updateProfile`, `createEmployee`, and `updateEmployee` resolvers enforce `canAssignPermissions`.
    - **Role Restrictions**: Only Admins and Vendors can create Profiles/Employees. Employees cannot elevate their own privileges.

4.  **Audit Logging**:
    - Critical security actions are logged to the `AuditLog` collection.
    - **Events Logged**:
        - `CREATE_USER` / `UPDATE_USER`
        - `CREATE_PROFILE` / `UPDATE_PROFILE` / `DELETE_PROFILE`
        - `CREATE_EMPLOYEE` / `UPDATE_EMPLOYEE`
        - Privilege escalation attempts (logged as failures).

---

## 🛡 Server Security

- Fail2ban (free)  
- UFW firewall  
- Disable root SSH  
- Allow SSH only via private key  
- NGINX rate limiting  
- PM2 restarts on crash  

---

## 🔐 Database Security

- Enable MongoDB authentication  
- Create a user per microservice  
- Bind MongoDB to `127.0.0.1` (local only)  
- Use TLS certificates  
- Disable unused ports  
- Backup strategy with cronjobs  

---

## 🔒 Input Validation

Use Zod/Joi to validate:

- Price  
- Duration  
- Uploaded filenames  
- Booking dates  
- Customer information  

---

## 🔒 Sanitization

- Prevent XSS  
- Prevent NoSQL injection  
- Escape HTML in user inputs  
- Limit file upload size  

---

## 🔐 Recommended Free Tools

- ClamAV (malware scanner for uploads)
- Lynis (security auditing)
- OpenSSL (certificates)
