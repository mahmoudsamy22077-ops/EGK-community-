# EGK Platform

منصة بطولة EGK (EGK LEAGUE / EGK CUP / EGK championship) — بداية المشروع.

## الحالة الحالية
- ✅ صفحة الدخول (Entry Page) — تسجيل دخول + حساب جديد، بالهوية البصرية النهائية
- ⏳ باقي الصفحات (الرئيسية، البطولات، البروفايل، لوحة الأدمن...) هتتضاف تباعًا

## التشغيل عندك

1. تأكد إن عندك [Node.js](https://nodejs.org) متثبت (نسخة 18 أو أحدث).
2. افتح Terminal في مجلد المشروع وشغل:
   ```bash
   npm install
   npm run dev
   ```
3. افتح اللينك اللي هيظهرلك في الترمينال (عادة `http://localhost:5173`).

## قبل ما يشتغل تسجيل الدخول فعليًا

لازم تظبط Firebase بتاعك:

1. روح [Firebase Console](https://console.firebase.google.com) واعمل مشروع جديد.
2. من Project Settings > General > Your apps، اعمل Web App وهياديك بيانات الـconfig.
3. فعّل **Authentication > Email/Password** من قائمة Build.
4. فعّل **Firestore Database** من قائمة Build.
5. افتح `src/lib/firebase.js` واستبدل القيم الموجودة (`YOUR_API_KEY`... إلخ) ببياناتك الحقيقية.

## هيكل المشروع
```
src/
  components/    مكونات قابلة لإعادة الاستخدام (زي شعار EGK)
  lib/           إعدادات خارجية (Firebase)
  pages/         كل صفحة من صفحات المنصة
  styles/        ملف الألوان والمتغيرات (theme.css)
  App.jsx        الراوتينج الرئيسي
  main.jsx       نقطة تشغيل React
```

## الخطوة الجاية
كل تعديل أو صفحة جديدة هنضيفها هنا تباعًا حسب الاتفاق في المحادثة.
