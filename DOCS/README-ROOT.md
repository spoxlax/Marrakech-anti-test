# 🌍 Tourism Activities WebApp — Project Overview (Self‑Hosted Edition)

This project is a **self‑hosted, Airbnb‑style web application** dedicated to offering tourist activities such as:

- Quad tours  
- Camel tours  
- Buggy tours  
- Camping  
- Lunch experiences  
- And more…

The application includes **3 portals**:
1. **Customer Portal** → Browse activities, book without signing up, multilingual (EN/FR/AR)
2. **Admin Portal** → Full control over all listings, bookings, categories, and third‑party vendors
3. **Third‑Party Portal** → Vendors can manage *only* their own activities & bookings

The entire platform follows **microservice architecture**, is **optimized**, **secure**, and uses **free, self-hosted technologies only**.

---

## 🚀 Technologies Used

### **Frontend**
- React + Vite  
- TypeScript  
- TailwindCSS  
- Zustand (state management)  
- React Query (API fetching & caching)  
- i18next (internationalization)

### **Backend (Microservices Architecture)**
- Node.js (Express/Fastify per service)
- GraphQL + Apollo Server
- Python microservice optional for analytics
- JWT authentication + RBAC
- Validation using Zod or Joi

### **Database**
- MongoDB (self‑hosted)
- Mongoose ORM
- Redis (optional but recommended for cache & sessions)

### **Infrastructure (All Self‑Hosted & Free)**
- NGINX as reverse proxy
- PM2 for process management
- Git + local CI scripts

---

## 📁 Microservices Included

### 1️⃣ Authentication Service  
Manages users (customer, admin, third‑party), JWT auth, permission levels.

### 2️⃣ Activities Service  
CRUD for activities, categories, filters, pricing, duration, images, etc.

### 3️⃣ Booking Service  
Handles availability, booking steps, payment status, reviews, and booking search.

### 4️⃣ Review Service  
Stores review details, only allowed after booking completion.

### 5️⃣ File Upload Service  
Secure image upload for activities.

### 6️⃣ Payment Service (Self‑Hosted)  
Supports:
- Cash payment
- Bank transfer proof upload
- Local payment provider APIs (if available)

### Optional: Python Analytics Service  
Generates revenue reports, trends, vendor stats.

---

## 🌐 Frontend Pages Overview

### **Home Page**
- Activity search bar  
- Categories  
- Featured activities  
- Why choose us section  
- Top requested activities  

### **Listing Page**
- Search by activity name (fuzzy/approximate search)
- Filter by:
  - Price  
  - Rating  
  - Category  
- Sorting options  
- Pagination  

### **Activity Details Page**
- Image gallery (primary image first)
- Description & duration
- Max participants
- Pricing (adult/child)
- Calendar availability (from backend)
- Dynamic price calculation
- Reviews section  

### **Payment Page**
- Customer info without signup:
  - First Name (required)
  - Last Name (required)
  - Phone number (required)
  - Email (optional)
- Booking summary  

---

## 🎛 Admin Panel Features
- Dashboard:
  - Total bookings
  - Total revenue
  - Pending/confirmed bookings
  - Recent bookings
- Activity management
- Category management
- Booking management
- CSV export
- Vendor (third‑party) management

---

## 🔐 Third‑Party Panel
Has:
- Dashboard  
- Activity CRUD  
- Booking overview  
- Profile settings  

**But restricted only to their own data.**

---

## 📦 Folder Structure (Suggested)

```
/app
  /frontend
  /services
    /auth
    /activities
    /bookings
    /reviews
    /uploads
    /payments
    /analytics (python)
  /gateway
  /database
  /docs
```

---

## 🛡 Core Security Principles

- RBAC (Role Based Access Control)
- JWT access + refresh tokens
- Rate limiting per microservice
- Input validation using Zod/Joi
- HTTPS everywhere (self‑signed if needed)
- Strict CORS rules
- Vendor isolation (ownership checks)
- Database indexes optimized for performance

---

This README gives an overview. Refer to the other READMEs for detailed instructions.
