# Waitlist Signup Flow — Design Spec
**Date:** 2026-04-12
**Status:** Approved
**Feature:** قائمة الانتظار (Waitlist) — المرحلة الأولى من منصة AI Hire Arab

---

## 1. الهدف

بناء نظام تسجيل في قائمة الانتظار لمنصة AI Hire Arab، يشمل:
- تحويل الـ `ai-hire-arab.html` الحالي إلى مشروع Next.js كامل
- فورم تسجيل يجمع: الاسم + البريد الإلكتروني + رقم الهاتف + الدور
- حفظ البيانات في Supabase مع RLS صارم
- معالجة الطلبات في الخلفية عبر Inngest
- واجهة: مودال + فورم inline في قسم CTA

---

## 2. التقنيات

| التقنية | الاستخدام |
|--------|-----------|
| Next.js 14 (App Router) | الإطار الرئيسي + API Routes |
| Supabase (Postgres) | قاعدة البيانات + RLS |
| Inngest | Background Jobs / Queues |
| Zod | Server-side validation |
| TypeScript | لغة البرمجة |

---

## 3. هيكل المشروع

```
ai-hire-arab/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       └── waitlist/
│           └── route.ts
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── WaitlistModal.tsx
│   ├── WaitlistForm.tsx
│   └── sections/
│       ├── Problem.tsx
│       ├── HowItWorks.tsx
│       ├── AIFeatures.tsx
│       ├── ForWho.tsx
│       ├── Pricing.tsx
│       ├── Roadmap.tsx
│       ├── StatsTicker.tsx
│       └── CTA.tsx
├── lib/
│   ├── supabase.ts
│   └── inngest.ts
├── inngest/
│   └── waitlist-welcome.ts
└── .env.local
```

---

## 4. قاعدة البيانات

### جدول `waitlist`

```sql
create table waitlist (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  phone       text not null,
  role        text not null check (role in ('job_seeker', 'recruiter')),
  created_at  timestamptz default now(),
  ip_hash     text,
  source      text default 'landing_page'
);
```

### سياسات RLS

```sql
alter table waitlist enable row level security;

-- INSERT فقط للـ anon (بدون قراءة أو تعديل أو حذف)
create policy "insert_only"
  on waitlist for insert
  to anon
  with check (true);

-- القراءة والتعديل: فقط عبر service_role (الـ backend)
```

**المبدأ:** الـ `anon` key لا يستطيع قراءة أي بيانات. الـ `service_role` key محجوز للـ API Routes فقط ولا يُكشف للمتصفح أبداً.

---

## 5. تدفق البيانات

```
المستخدم يملأ الفورم
        ↓
WaitlistForm.tsx — client-side validation
        ↓
POST /api/waitlist
  ├── Zod validation (server-side)
  ├── التحقق من عدم تكرار الـ email
  ├── INSERT في Supabase (service_role key)
  ├── إرسال event لـ Inngest: "waitlist/user.registered"
  └── return { success: true }
        ↓
Inngest Job: waitlist-welcome
  └── جاهز لإضافة: email، Slack، إلخ (حالياً: console.log)
        ↓
WaitlistForm.tsx
  ├── رسالة نجاح بالعربية
  └── إغلاق المودال بعد 3 ثوانٍ
```

### معالجة الأخطاء

| الخطأ | الرسالة للمستخدم |
|-------|----------------|
| Email مكرر | "هذا البريد الإلكتروني مسجل مسبقاً" |
| حقل فارغ | "هذا الحقل مطلوب" |
| خطأ في الشبكة | "حدث خطأ، يرجى المحاولة مجدداً" |
| Inngest يفشل | لا يؤثر على المستخدم (INSERT تم بنجاح) |

---

## 6. واجهة المستخدم

### المودال
- يفتح عند الضغط على أي زر "ابدأ مجاناً" في الـ Nav
- يحتوي على `WaitlistForm`
- يُغلق بالضغط على ✕ أو خارج المودال أو بعد النجاح

### الفورم (مشترك بين المودال وقسم CTA)
```
الاسم الكامل *         → input[type=text]
البريد الإلكتروني *   → input[type=email]
رقم الهاتف *          → input[type=tel]
أنا...                → radio: باحث عن عمل | شركة / مسؤول توظيف
```

### حالة النجاح
```
✅ تم التسجيل بنجاح!
سنتواصل معك قريباً عند إطلاق المنصة.
```

### التصميم
- يتبع نظام الألوان الحالي: `--navy`, `--gold`, `--cyan`, `--blue`
- خط Cairo، اتجاه RTL
- أزرار بـ gradient ذهبي
- نفس أسلوب الـ CSS المستخدم في `ai-hire-arab.html`

---

## 7. متغيرات البيئة

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # سري — لا يُكشف للمتصفح
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

---

## 8. ما هو خارج نطاق هذه المرحلة

- إرسال confirmation email (مرحلة لاحقة مع Resend/SendGrid)
- لوحة تحكم لعرض المسجلين
- ميزة تحليل الـ CV (Feature A — مرحلة منفصلة)
- لوحة الوظائف (Feature B — مرحلة منفصلة)
