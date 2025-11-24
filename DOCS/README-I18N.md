# 🌍 Internationalization Guide (EN / FR / AR)

Your application must support 3 languages on customer pages:

- **English**
- **French**
- **Arabic** (RTL support)

---

## 📦 Tools Used

- `i18next`
- `react-i18next`
- JSON translation files
- RTL toggle with TailwindCSS

---

## 📁 Folder Structure

```
/src/i18n
  /locales
    /en.json
    /fr.json
    /ar.json
  i18n.ts
```

---

## 📝 Adding New Translation Keys

Example:

**en.json**
```
{
  "search": "Search activities",
  "book_now": "Book Now"
}
```

**ar.json**
```
{
  "search": "ابحث عن الأنشطة",
  "book_now": "احجز الآن"
}
```

---

## 🧭 RTL Support

Add class:

```
<html dir="rtl">
```

Or use:

```
document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
```

---

## 🔄 Auto Language Detection

Use browser language detection plugin.

---
