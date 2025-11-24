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
