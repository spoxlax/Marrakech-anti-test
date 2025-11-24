# ⚙️ Backend Documentation (Microservices + Node.js + GraphQL)

This README explains how the backend is structured using microservices, all self‑hosted and built with free technologies only.

---

## 🧱 Backend Tech Stack

- **Node.js**
- **Express / Fastify**
- **GraphQL (Apollo Server)**
- **MongoDB (self‑hosted)**
- **Mongoose**
- **Redis** (optional caching)
- **Zod / Joi for validation**
- **RabbitMQ / NATS for messaging**
- **JWT Authentication**

---

## 📦 Microservices Overview

Each microservice runs independently:

```
/services
  /auth
  /activities
  /bookings
  /reviews
  /uploads
  /payments
  /analytics (Python optional)
```

### 1️⃣ Authentication Service
Responsible for:

- Signup / login
- Password hashing
- Role-based access (admin, vendor, customer)
- Token issuing (access + refresh)

### 2️⃣ Activities Service
Manages:

- Activity CRUD
- Images
- Duration, price, maximum participants
- Category filtering
- Fuzzy search (via MongoDB text index)

### 3️⃣ Bookings Service
Features:

- Check availability
- Create bookings
- Update booking status
- Export CSV
- Customer info (guest checkout)
- Vendor revenue tracking

### 4️⃣ Reviews Service
Rules:

- Only after booking completion
- One review per booking

### 5️⃣ Upload Service
Self‑hosted image uploads, using:

- Multer  
- Sharp for image optimization  

### 6️⃣ Payment Service (Self‑Hosted)
Supports:

- Cash  
- Bank transfer  
- Proof upload  
- Local payment provider APIs (if available)

### 7️⃣ Python Analytics Service
Optional, generates:

- Revenue statistics
- Vendor performance
- Activity popularity
- Cancellable without affecting core system

---

## 📚 API Gateway

A **Node.js gateway** unifies all microservices under a single URL.

Responsibilities:
- Routing GraphQL operations
- Authentication
- Load balancing
- Logging

---

## 🗃 Recommended Folder Structure

```
/services/auth
  index.ts
  schema.graphql
  resolvers/
  models/
  controllers/
  utils/

... repeated for all services ...
```

---

## 🔐 Backend Security Measures

- Hash passwords using bcrypt
- JWT access + refresh tokens
- Vendor ownership checks on every protected query
- Global rate limiting
- Disable GraphQL introspection in production
- Validate input with Zod/Joi
- Sanitize all user inputs
- Helmet middleware everywhere
- HTTPS required

---

## 🧪 Testing (Free tools)

- Jest  
- Supertest  
- Newman (Postman CLI)

---
