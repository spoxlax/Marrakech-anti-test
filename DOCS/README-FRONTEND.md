# 🎨 Frontend Documentation (React + Vite + TypeScript + TailwindCSS)

This document describes how to structure, build, secure, and optimize the frontend of your tourism booking platform.

---

## 🧱 Frontend Tech Stack

- **React 18**
- **Vite** (fast bundler)
- **TypeScript**
- **TailwindCSS** (UI styling)
- **React Query** (server state management)
- **Zustand** (local state)
- **i18next** (multilingual EN / FR / AR)
- **React Hook Form** + Zod (forms + validation)
- **Heroicons / Lucide Icons**

---

## 📁 Folder Structure

```
/src
  /components
  /layouts
  /pages
  /features
    /activities
    /bookings
    /auth
  /hooks
  /utils
  /store
  /services
  /i18n
  /types
  main.tsx
  App.tsx
```

---

## 🌐 Pages & Components

### **Home Page**
- Search bar
- Explore by category
- Featured experiences
- Why choose our activities
- Popular activities section

### **Listing Page**
- Advanced filtering
- Sort options
- Fuzzy text search

### **Activity Details**
- Photo gallery
- Description
- Duration
- Price calculator
- Availability calendar

### **Booking & Checkout**
- Guest checkout
- Validation with Zod
- Summary section

### **User Dashboard (optional)**

### **Vendor Panel**
Accessible only for logged‑in vendors.

---

## 🌍 Internationalization (EN / FR / AR)

Use:
✔ `i18next`  
✔ `react-i18next`  
✔ Lazy-loaded JSON translations  

Example:

```
/src/i18n/locale/en.json
/src/i18n/locale/fr.json
/src/i18n/locale/ar.json
```

---

## 💬 API Communication

All API requests use **React Query**:

- Caching  
- Background refetch  
- Optimistic updates  

GraphQL client: **Apollo Client**

---

## ⚡ Optimization Techniques

- Vite + Code Splitting
- React.lazy() for page loading
- Tailwind JIT
- Image lazy-loading
- useMemo / useCallback where needed
- Pre-fetching data on hover (React Query)

---

## 🔐 Security (Frontend)

- Escape user-generated content
- Avoid storing JWT in localStorage → Use HTTP-only cookies
- Validate all forms before sending to backend
- Strict CORS with allowed origins
- Minimize user data stored in memory

---

## 🧪 Testing

Free tools recommended:

- Vitest  
- React Testing Library  
- Playwright for E2E  

---

## 🏗 Build & Deploy

To build:

```
npm run build
```

Static files go to `/dist`, to be served behind **NGINX**.

---
