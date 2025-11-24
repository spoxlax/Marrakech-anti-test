# 🧑‍💼 Third‑Party (Vendor) Portal Documentation

Vendors (third-party companies) can list their activities under strict security.

---

## 👤 Vendor Permissions

Vendors can:

✔ Add activities  
✔ Edit activities  
✔ Delete activities  
✔ View bookings linked to their activities  
✔ Update booking status  

Vendors **cannot**:

✘ View other vendors’ listings  
✘ Edit activities owned by others  
✘ See global revenue (admin-only)  
✘ Manage categories  

---

## 🛡 Security Rules

Every request must pass:
- JWT authentication  
- Vendor ownership middleware  

Example logic:

```
if (activity.vendorId !== req.user.id) {
    throw new Error("Unauthorized");
}
```

---

## 🌐 Vendor Dashboard

Displays:

- Total bookings today  
- Total revenue  
- Pending bookings  
- Activity statistics  

---

## 📄 Vendor Activity Form Fields

- Title  
- Description  
- Duration  
- Max participants  
- Price adult/child  
- Category  
- Images  

---

## 📞 Vendor Notifications

Supports:
- Email  
- SMS (optional, self-hosted gateway)  

