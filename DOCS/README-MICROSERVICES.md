# 🧩 Microservices Architecture Documentation

This file explains how the microservice architecture is designed and how services communicate.

---

## 🧱 Why Microservices?

- Easier to scale
- Each feature deploys independently
- Technology-agnostic (Python service allowed)
- Better maintainability
- High isolation for third‑party vendors
- Easy to replace/improve services later

---

## ⚙️ Services List

- Auth Service  
- Activities Service  
- Booking Service  
- Review Service  
- File Upload Service  
- Payment Service  
- Python Analytics Service  
- API Gateway  

Each service:
- Has its own database collection(s)
- Has its own GraphQL schema
- Can restart independently
- Runs on its own Linux process (PM2)

---

## 🔗 Communication Model

Messaging:

- Services use **RabbitMQ (free, self-hosted)**  
or  
- Lightweight **NATS** (also free)

API Gateway:

- Unified GraphQL endpoint  
- Authentication  
- Rate limiting  
- Logging  

Services expose:

- GraphQL resolvers
- Health checks

---

## 🛠 Deployment Strategy

For each service:

```
pm2 start npm --name activities-service -- run start
```

All services run behind **NGINX reverse proxy**.

---
