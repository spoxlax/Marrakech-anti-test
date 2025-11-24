# 🗄 Database Schema & Structure (MongoDB)

This README describes the optimal database structure for a microservice‑based tourism booking platform.

---

## 🧱 Database Technology

- MongoDB (self-hosted)
- Mongoose ODM
- Text indexes for fuzzy search
- Compound indexes for fast filtering

---

## 📚 Collections Overview

### **Users**
```
{
  _id,
  firstName,
  lastName,
  email,
  phone,
  role: "admin" | "vendor" | "customer",
  passwordHash,
  createdAt
}
```

### **Activities**
```
{
  _id,
  vendorId,
  title,
  description,
  images: [string],
  priceAdult,
  priceChild,
  duration,
  maxParticipants,
  categoryId,
  ratingAverage,
  createdAt
}
```

### **Categories**
```
{
  _id,
  name,
  icon
}
```

### **Bookings**
```
{
  _id,
  activityId,
  vendorId,
  customerInfo: {
    firstName,
    lastName,
    phone,
    email
  },
  date,
  persons: { adults, children },
  totalPrice,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  createdAt
}
```

### **Reviews**
```
{
  _id,
  bookingId,
  activityId,
  vendorId,
  rating,
  comment,
  createdAt
}
```

---

## 🔍 Index Recommendations

- `Activities.title` → text index for fuzzy search  
- `Activities.categoryId` → filtering  
- `Bookings.status` → admin/vendor search  
- `Bookings.vendorId` → vendor isolation  
- `Reviews.activityId` → fast review fetch  

---

## 🔐 Database Security (Self‑Hosted)

- Enable MongoDB authentication  
- Create separate users for each microservice  
- Use roles: read / readWrite / admin  
- Disable remote access unless using VPN  
- Encrypt data in transit with TLS  
- Back up daily using `mongodump`  

---
