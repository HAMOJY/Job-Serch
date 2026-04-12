# Waitlist Signup Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** تحويل `ai-hire-arab.html` إلى مشروع Next.js كامل مع نظام قائمة انتظار يحفظ البيانات في Supabase ويعالج الطلبات في الخلفية عبر Inngest.

**Architecture:** Next.js 14 App Router — الـ API Routes تستقبل بيانات الفورم، تتحقق منها بـ Zod، تحفظها في Supabase بـ `service_role` key (مخفي عن المتصفح)، ثم ترسل event لـ Inngest لمعالجة الخلفية. الـ RLS في Supabase يسمح فقط بالـ INSERT للـ anon، القراءة محجوبة تماماً. الواجهة: مودال يفتح عند الضغط على "ابدأ مجاناً" + فورم inline في قسم CTA.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Supabase (Postgres + RLS), Inngest, Zod, Jest, React Testing Library

---

## File Map

| الملف | المسؤولية |
|------|-----------|
| `app/layout.tsx` | Root layout — fonts, metadata, Canvas3D |
| `app/page.tsx` | الصفحة الرئيسية — يجمع كل الأقسام |
| `app/globals.css` | كل الـ CSS منقول من `ai-hire-arab.html` |
| `app/api/waitlist/route.ts` | POST handler — validation + Supabase insert + Inngest event |
| `app/api/inngest/route.ts` | Inngest webhook handler |
| `lib/supabase.ts` | Supabase clients (anon للمتصفح، admin للـ server) |
| `lib/inngest.ts` | Inngest client |
| `lib/validation.ts` | Zod schema للـ waitlist |
| `inngest/waitlist-welcome.ts` | Background job — جاهز لإضافة email لاحقاً |
| `components/WaitlistForm.tsx` | فورم التسجيل (use client) — يُستخدم في المودال وCTA |
| `components/WaitlistModal.tsx` | المودال (use client) — يفتح عند "ابدأ مجاناً" |
| `components/Nav.tsx` | شريط التنقل (use client — mobile menu + modal state) |
| `components/Hero.tsx` | قسم الهيرو |
| `components/Canvas3D.tsx` | Three.js canvas (use client + useEffect) |
| `components/sections/Problem.tsx` | قسم المشكلة والحل |
| `components/sections/HowItWorks.tsx` | قسم كيف تعمل |
| `components/sections/AIFeatures.tsx` | قسم مميزات الذكاء الاصطناعي |
| `components/sections/ForWho.tsx` | قسم لمن هي |
| `components/sections/Pricing.tsx` | قسم الأسعار |
| `components/sections/Roadmap.tsx` | قسم خارطة الطريق |
| `components/sections/StatsTicker.tsx` | شريط الإحصائيات |
| `components/sections/CTA.tsx` | قسم الدعوة للتسجيل — يحتوي WaitlistForm |
| `components/sections/Footer.tsx` | الفوتر |
| `__tests__/lib/validation.test.ts` | اختبارات Zod schema |
| `__tests__/api/waitlist.test.ts` | اختبارات API Route |
| `__tests__/components/WaitlistForm.test.tsx` | اختبارات فورم التسجيل |

---

## Task 1: تهيئة مشروع Next.js

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.env.local.example`

- [ ] **Step 1: إنشاء المشروع**

```bash
npx create-next-app@latest ai-hire-arab \
  --typescript \
  --app \
  --no-tailwind \
  --no-src-dir \
  --import-alias "@/*"
cd ai-hire-arab
```

- [ ] **Step 2: تثبيت الحزم الأساسية**

```bash
npm install @supabase/supabase-js inngest zod three
npm install -D @types/three
```

- [ ] **Step 3: تثبيت حزم الاختبار**

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
```

- [ ] **Step 4: إنشاء `jest.config.ts`**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 5: إنشاء `jest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: إضافة script الاختبار في `package.json`**

أضف داخل `"scripts"`:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 7: إنشاء `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
INNGEST_EVENT_KEY=your_inngest_event_key_here
INNGEST_SIGNING_KEY=your_inngest_signing_key_here
```

- [ ] **Step 8: إنشاء `.env.local` بقيمك الحقيقية**

انسخ `.env.local.example` إلى `.env.local` وأدخل القيم الحقيقية من:
- Supabase Dashboard → Project Settings → API
- Inngest Dashboard → Manage → Event Keys

- [ ] **Step 9: التحقق أن المشروع يعمل**

```bash
npm run dev
```

Expected: الصفحة الافتراضية تفتح على `http://localhost:3000`

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with testing setup"
```

---

## Task 2: نقل CSS إلى globals.css

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: نقل كل CSS من `ai-hire-arab.html` إلى `app/globals.css`**

افتح `ai-hire-arab.html`، انسخ كل محتوى `<style>...</style>` (من السطر 26 حتى نهاية وسم `</style>`) والصقه في `app/globals.css` بدلاً من محتواه الحالي.

- [ ] **Step 2: إضافة CSS إضافي للمودال والفورم في نهاية `app/globals.css`**

```css
/* ─── WAITLIST MODAL ─── */
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(5, 11, 26, 0.85);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}
.modal-content {
  background: var(--navy3);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%; max-width: 480px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  direction: rtl;
}
.modal-close {
  position: absolute; top: 1rem; left: 1rem;
  background: transparent; border: none;
  color: var(--text-muted); font-size: 1.2rem;
  cursor: pointer; padding: 0.25rem 0.5rem;
  border-radius: 6px; transition: color 0.2s;
}
.modal-close:hover { color: var(--text); }
.modal-header { margin-bottom: 1.5rem; }
.modal-header h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.4rem; }
.modal-header p { color: var(--text-dim); font-size: 0.9rem; }

/* ─── WAITLIST FORM ─── */
.waitlist-form { display: flex; flex-direction: column; gap: 1rem; }
.waitlist-input {
  width: 100%; padding: 0.85rem 1.25rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text);
  font-family: 'Cairo', sans-serif; font-size: 0.95rem;
  direction: rtl; text-align: right; outline: none;
  transition: border 0.3s;
}
.waitlist-input:focus { border-color: var(--gold); }
.waitlist-input::placeholder { color: var(--text-muted); }
.radio-group { display: flex; gap: 1.5rem; }
.radio-label {
  display: flex; align-items: center; gap: 0.5rem;
  cursor: pointer; color: var(--text-dim);
  font-size: 0.95rem; transition: color 0.2s;
}
.radio-label:hover { color: var(--text); }
.radio-label input[type="radio"] { accent-color: var(--gold); width: 16px; height: 16px; }
.form-error {
  color: #FF6B6B; font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255,107,107,0.1);
  border-radius: 8px; border: 1px solid rgba(255,107,107,0.2);
}
.form-success {
  text-align: center; padding: 1.5rem;
}
.form-success .success-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.form-success h3 { color: var(--gold-light); margin-bottom: 0.5rem; font-size: 1.2rem; }
.form-success p { color: var(--text-dim); font-size: 0.9rem; }
```

- [ ] **Step 3: تحديث `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Hire Arab – منصة التوظيف بالذكاء الاصطناعي',
  description: 'AI Hire Arab — أول منصة توظيف عربية تعمل بالذكاء الاصطناعي.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;900&family=Tajawal:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: migrate CSS and layout from HTML to Next.js"
```

---

## Task 3: إعداد Supabase وSQL Migration

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: إنشاء `lib/supabase.ts`**

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// للمتصفح — صلاحيات محدودة (insert فقط بسبب RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// للـ server فقط — لا تستخدمه في client components أبداً
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

- [ ] **Step 2: تشغيل SQL Migration في Supabase Dashboard**

افتح Supabase Dashboard → SQL Editor → New Query، والصق:

```sql
-- إنشاء جدول waitlist
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null unique,
  phone       text not null,
  role        text not null check (role in ('job_seeker', 'recruiter')),
  created_at  timestamptz default now(),
  ip_hash     text,
  source      text default 'landing_page'
);

-- تفعيل RLS
alter table waitlist enable row level security;

-- السماح بـ INSERT فقط للـ anon (بدون قراءة أو تعديل)
create policy "insert_only"
  on waitlist for insert
  to anon
  with check (true);
```

اضغط **Run** وتحقق أن الجدول ظهر في Table Editor.

- [ ] **Step 3: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add Supabase client setup"
```

---

## Task 4: إعداد Inngest

**Files:**
- Create: `lib/inngest.ts`
- Create: `inngest/waitlist-welcome.ts`
- Create: `app/api/inngest/route.ts`

- [ ] **Step 1: إنشاء `lib/inngest.ts`**

```ts
import { Inngest } from 'inngest'

export const inngest = new Inngest({ id: 'ai-hire-arab' })
```

- [ ] **Step 2: إنشاء `inngest/waitlist-welcome.ts`**

```ts
import { inngest } from '@/lib/inngest'

export const waitlistWelcome = inngest.createFunction(
  { id: 'waitlist-welcome' },
  { event: 'waitlist/user.registered' },
  async ({ event, step }) => {
    const { name, email, role } = event.data as {
      name: string
      email: string
      role: 'job_seeker' | 'recruiter'
    }

    await step.run('log-registration', async () => {
      console.log(`[Waitlist] New signup: ${name} <${email}> — ${role}`)
      // TODO: أضف هنا إرسال confirmation email في مرحلة لاحقة (Resend/SendGrid)
    })

    return { processed: true, email }
  }
)
```

- [ ] **Step 3: إنشاء `app/api/inngest/route.ts`**

```ts
import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { waitlistWelcome } from '@/inngest/waitlist-welcome'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [waitlistWelcome],
})
```

- [ ] **Step 4: Commit**

```bash
git add lib/inngest.ts inngest/waitlist-welcome.ts app/api/inngest/route.ts
git commit -m "feat: add Inngest client and waitlist welcome background job"
```

---

## Task 5: Zod Validation Schema (TDD)

**Files:**
- Create: `__tests__/lib/validation.test.ts`
- Create: `lib/validation.ts`

- [ ] **Step 1: كتابة الاختبار الفاشل**

```ts
// __tests__/lib/validation.test.ts
import { waitlistSchema } from '@/lib/validation'

const valid = {
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+966501234567',
  role: 'job_seeker' as const,
}

describe('waitlistSchema', () => {
  it('accepts valid data', () => {
    expect(waitlistSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(waitlistSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects name shorter than 2 chars', () => {
    expect(waitlistSchema.safeParse({ ...valid, name: 'أ' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(waitlistSchema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false)
  })

  it('rejects empty phone', () => {
    expect(waitlistSchema.safeParse({ ...valid, phone: '' }).success).toBe(false)
  })

  it('rejects phone shorter than 8 chars', () => {
    expect(waitlistSchema.safeParse({ ...valid, phone: '123' }).success).toBe(false)
  })

  it('rejects invalid role', () => {
    expect(waitlistSchema.safeParse({ ...valid, role: 'admin' as any }).success).toBe(false)
  })

  it('accepts recruiter role', () => {
    expect(waitlistSchema.safeParse({ ...valid, role: 'recruiter' }).success).toBe(true)
  })
})
```

- [ ] **Step 2: تشغيل الاختبار للتحقق من الفشل**

```bash
npm test -- --testPathPattern="validation"
```

Expected: FAIL — `Cannot find module '@/lib/validation'`

- [ ] **Step 3: كتابة الـ schema**

```ts
// lib/validation.ts
import { z } from 'zod'

export const waitlistSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(8, 'رقم الهاتف غير صحيح'),
  role: z.enum(['job_seeker', 'recruiter'], {
    errorMap: () => ({ message: 'يرجى اختيار نوع الحساب' }),
  }),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
```

- [ ] **Step 4: تشغيل الاختبار للتحقق من النجاح**

```bash
npm test -- --testPathPattern="validation"
```

Expected: PASS — 8 tests passed

- [ ] **Step 5: Commit**

```bash
git add lib/validation.ts __tests__/lib/validation.test.ts
git commit -m "feat: add Zod validation schema for waitlist (TDD)"
```

---

## Task 6: API Route `/api/waitlist` (TDD)

**Files:**
- Create: `__tests__/api/waitlist.test.ts`
- Create: `app/api/waitlist/route.ts`

- [ ] **Step 1: كتابة الاختبار الفاشل**

```ts
// __tests__/api/waitlist.test.ts
import { POST } from '@/app/api/waitlist/route'
import { NextRequest } from 'next/server'

const mockInsert = jest.fn()
const mockInngestSend = jest.fn().mockResolvedValue({})

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: mockInsert,
    })),
  },
}))

jest.mock('@/lib/inngest', () => ({
  inngest: {
    send: mockInngestSend,
  },
}))

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/waitlist', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const valid = {
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+966501234567',
  role: 'job_seeker',
}

describe('POST /api/waitlist', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
  })

  it('returns 200 for valid data', async () => {
    const res = await POST(makeRequest(valid))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('calls supabaseAdmin.from("waitlist").insert with correct data', async () => {
    await POST(makeRequest(valid))
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      role: 'job_seeker',
    })
  })

  it('sends Inngest event after successful insert', async () => {
    await POST(makeRequest(valid))
    expect(mockInngestSend).toHaveBeenCalledWith({
      name: 'waitlist/user.registered',
      data: { name: 'أحمد محمد', email: 'ahmed@example.com', role: 'job_seeker' },
    })
  })

  it('returns 400 for invalid email', async () => {
    const res = await POST(makeRequest({ ...valid, email: 'bad' }))
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeTruthy()
  })

  it('returns 400 for empty name', async () => {
    const res = await POST(makeRequest({ ...valid, name: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 for duplicate email', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate' } })
    const res = await POST(makeRequest(valid))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toBe('هذا البريد الإلكتروني مسجل مسبقاً')
  })

  it('returns 500 for other DB errors', async () => {
    mockInsert.mockResolvedValue({ error: { code: '500', message: 'db error' } })
    const res = await POST(makeRequest(valid))
    expect(res.status).toBe(500)
  })

  it('does not call Inngest if insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate' } })
    await POST(makeRequest(valid))
    expect(mockInngestSend).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: تشغيل الاختبار للتحقق من الفشل**

```bash
npm test -- --testPathPattern="api/waitlist"
```

Expected: FAIL — `Cannot find module '@/app/api/waitlist/route'`

- [ ] **Step 3: كتابة الـ API Route**

```ts
// app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { waitlistSchema } from '@/lib/validation'
import { supabaseAdmin } from '@/lib/supabase'
import { inngest } from '@/lib/inngest'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = waitlistSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, phone, role } = parsed.data

    const { error } = await supabaseAdmin
      .from('waitlist')
      .insert({ name, email, phone, role })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'هذا البريد الإلكتروني مسجل مسبقاً' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'حدث خطأ، يرجى المحاولة مجدداً' },
        { status: 500 }
      )
    }

    await inngest.send({
      name: 'waitlist/user.registered',
      data: { name, email, role },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'حدث خطأ، يرجى المحاولة مجدداً' },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: تشغيل الاختبار للتحقق من النجاح**

```bash
npm test -- --testPathPattern="api/waitlist"
```

Expected: PASS — 8 tests passed

- [ ] **Step 5: Commit**

```bash
git add app/api/waitlist/route.ts __tests__/api/waitlist.test.ts
git commit -m "feat: add waitlist API Route with validation and Inngest (TDD)"
```

---

## Task 7: WaitlistForm Component (TDD)

**Files:**
- Create: `__tests__/components/WaitlistForm.test.tsx`
- Create: `components/WaitlistForm.tsx`

- [ ] **Step 1: كتابة الاختبار الفاشل**

```tsx
// __tests__/components/WaitlistForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WaitlistForm from '@/components/WaitlistForm'

global.fetch = jest.fn()

describe('WaitlistForm', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders all form fields', () => {
    render(<WaitlistForm />)
    expect(screen.getByPlaceholderText('الاسم الكامل')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('البريد الإلكتروني')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('رقم الهاتف')).toBeInTheDocument()
    expect(screen.getByLabelText('باحث عن عمل')).toBeInTheDocument()
    expect(screen.getByLabelText('شركة / مسؤول توظيف')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /سجّل الآن/i })).toBeInTheDocument()
  })

  it('shows success message after successful submission', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    render(<WaitlistForm />)

    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))

    await waitFor(() => {
      expect(screen.getByText('تم التسجيل بنجاح!')).toBeInTheDocument()
    })
  })

  it('calls onSuccess callback after successful submission', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    const onSuccess = jest.fn()
    render(<WaitlistForm onSuccess={onSuccess} />)

    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })

  it('shows error message on duplicate email', async () => {
    ;(fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }),
    })
    render(<WaitlistForm />)

    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))

    await waitFor(() => {
      expect(screen.getByText('هذا البريد الإلكتروني مسجل مسبقاً')).toBeInTheDocument()
    })
  })

  it('disables button while loading', async () => {
    let resolve: (v: any) => void
    ;(fetch as jest.Mock).mockReturnValue(new Promise(r => { resolve = r }))
    render(<WaitlistForm />)

    await userEvent.type(screen.getByPlaceholderText('الاسم الكامل'), 'أحمد محمد')
    await userEvent.type(screen.getByPlaceholderText('البريد الإلكتروني'), 'ahmed@example.com')
    await userEvent.type(screen.getByPlaceholderText('رقم الهاتف'), '+966501234567')
    await userEvent.click(screen.getByLabelText('باحث عن عمل'))
    await userEvent.click(screen.getByRole('button', { name: /سجّل الآن/i }))

    expect(screen.getByRole('button', { name: /جاري التسجيل/i })).toBeDisabled()
  })
})
```

- [ ] **Step 2: تشغيل الاختبار للتحقق من الفشل**

```bash
npm test -- --testPathPattern="WaitlistForm"
```

Expected: FAIL — `Cannot find module '@/components/WaitlistForm'`

- [ ] **Step 3: كتابة المكوّن**

```tsx
// components/WaitlistForm.tsx
'use client'

import { useState } from 'react'
import type { WaitlistInput } from '@/lib/validation'

interface Props {
  onSuccess?: () => void
}

type FormState = WaitlistInput & { role: WaitlistInput['role'] | '' }

export default function WaitlistForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', role: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'حدث خطأ، يرجى المحاولة مجدداً')
        return
      }

      setSuccess(true)
      onSuccess?.()
    } catch {
      setError('حدث خطأ في الاتصال، يرجى المحاولة مجدداً')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="form-success">
        <div className="success-icon">✅</div>
        <h3>تم التسجيل بنجاح!</h3>
        <p>سنتواصل معك قريباً عند إطلاق المنصة.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="waitlist-form" dir="rtl">
      <input
        type="text"
        placeholder="الاسم الكامل"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        required
        className="waitlist-input"
      />
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        required
        className="waitlist-input"
      />
      <input
        type="tel"
        placeholder="رقم الهاتف"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        required
        className="waitlist-input"
      />
      <div className="radio-group">
        <label className="radio-label">
          <input
            type="radio"
            name="role"
            value="job_seeker"
            checked={form.role === 'job_seeker'}
            onChange={() => setForm(f => ({ ...f, role: 'job_seeker' }))}
            aria-label="باحث عن عمل"
          />
          <span>باحث عن عمل</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="role"
            value="recruiter"
            checked={form.role === 'recruiter'}
            onChange={() => setForm(f => ({ ...f, role: 'recruiter' }))}
            aria-label="شركة / مسؤول توظيف"
          />
          <span>شركة / مسؤول توظيف</span>
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {loading ? 'جاري التسجيل...' : 'سجّل الآن مجاناً ←'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: تشغيل الاختبار للتحقق من النجاح**

```bash
npm test -- --testPathPattern="WaitlistForm"
```

Expected: PASS — 4 tests passed

- [ ] **Step 5: Commit**

```bash
git add components/WaitlistForm.tsx __tests__/components/WaitlistForm.test.tsx
git commit -m "feat: add WaitlistForm component with RTL support (TDD)"
```

---

## Task 8: WaitlistModal Component

**Files:**
- Create: `components/WaitlistModal.tsx`

- [ ] **Step 1: إنشاء `components/WaitlistModal.tsx`**

```tsx
// components/WaitlistModal.tsx
'use client'

import { useEffect } from 'react'
import WaitlistForm from './WaitlistForm'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function WaitlistModal({ isOpen, onClose }: Props) {
  // منع تمرير الصفحة عند فتح المودال
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // إغلاق بضغط Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleSuccess() {
    setTimeout(onClose, 3000)
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>
        <div className="modal-header">
          <h2>🚀 انضم إلى قائمة الانتظار</h2>
          <p>كن من أوائل المستفيدين من منصة AI Hire Arab</p>
        </div>
        <WaitlistForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/WaitlistModal.tsx
git commit -m "feat: add WaitlistModal with keyboard support and auto-close"
```

---

## Task 9: نقل أقسام HTML إلى مكوّنات React

**Files:**
- Create: `components/Canvas3D.tsx`
- Create: `components/Nav.tsx`
- Create: `components/Hero.tsx`
- Create: `components/sections/Problem.tsx`
- Create: `components/sections/HowItWorks.tsx`
- Create: `components/sections/AIFeatures.tsx`
- Create: `components/sections/ForWho.tsx`
- Create: `components/sections/Pricing.tsx`
- Create: `components/sections/Roadmap.tsx`
- Create: `components/sections/StatsTicker.tsx`
- Create: `components/sections/CTA.tsx`
- Create: `components/sections/Footer.tsx`

- [ ] **Step 1: إنشاء `components/Canvas3D.tsx`**

```tsx
// components/Canvas3D.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Canvas3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 30

    // نقاط ضوئية عائمة
    const geometry = new THREE.BufferGeometry()
    const count = 200
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const material = new THREE.PointsMaterial({
      color: 0xC9A84C,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
    })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    let frameId: number
    function animate() {
      frameId = requestAnimationFrame(animate)
      points.rotation.y += 0.0005
      points.rotation.x += 0.0002
      renderer.render(scene, camera)
    }
    animate()

    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="canvas3d"
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  )
}
```

- [ ] **Step 2: إنشاء `components/Nav.tsx`**

```tsx
// components/Nav.tsx
'use client'

import { useState, useEffect } from 'react'
import WaitlistModal from './WaitlistModal'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 20) }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav style={scrolled ? { background: 'rgba(5,11,26,0.97)' } : undefined}>
        <div className="nav-logo">
          <div className="logo-icon">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="8" r="3" fill="white" opacity="0.9"/>
              <circle cx="5" cy="19" r="2.5" fill="white" opacity="0.7"/>
              <circle cx="21" cy="19" r="2.5" fill="white" opacity="0.7"/>
              <line x1="13" y1="8" x2="5" y2="19" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <line x1="13" y1="8" x2="21" y2="19" stroke="white" strokeWidth="1.5" opacity="0.6"/>
              <line x1="5" y1="19" x2="21" y2="19" stroke="white" strokeWidth="1.5" opacity="0.6"/>
            </svg>
          </div>
          <span className="logo-text">AI Hire Arab</span>
        </div>

        <ul className="nav-links">
          <li><a href="#how">كيف تعمل</a></li>
          <li><a href="#ai-features">مميزات الذكاء الاصطناعي</a></li>
          <li><a href="#for-who">لمن هي</a></li>
          <li><a href="#pricing">الأسعار</a></li>
          <li><a href="#roadmap">خارطة الطريق</a></li>
        </ul>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="nav-cta" onClick={() => setModalOpen(true)}>
            ابدأ مجاناً
          </button>
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="قائمة التنقل"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      <div className={`mobile-nav${menuOpen ? ' open' : ''}`}>
        <a href="#how" onClick={() => setMenuOpen(false)}>كيف تعمل</a>
        <a href="#ai-features" onClick={() => setMenuOpen(false)}>مميزات الذكاء الاصطناعي</a>
        <a href="#for-who" onClick={() => setMenuOpen(false)}>لمن هي</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>الأسعار</a>
        <a href="#roadmap" onClick={() => setMenuOpen(false)}>خارطة الطريق</a>
        <button
          className="mobile-cta"
          onClick={() => { setMenuOpen(false); setModalOpen(true) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}
        >
          ابدأ مجاناً ←
        </button>
      </div>

      <WaitlistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
```

- [ ] **Step 3: إنشاء `components/Hero.tsx`**

انسخ محتوى `<section id="hero">` من `ai-hire-arab.html` وحوّله إلى مكوّن React.

```tsx
// components/Hero.tsx
'use client'

import { useEffect } from 'react'

export default function Hero() {
  // تشغيل عداد الأرقام عند التحميل
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>('.stat-num[data-count]')
    counters.forEach(el => {
      const target = parseInt(el.dataset.count || '0')
      const suffix = el.dataset.suffix || ''
      let current = 0
      const step = target / 60
      const timer = setInterval(() => {
        current = Math.min(current + step, target)
        el.textContent = Math.floor(current) + suffix
        if (current >= target) clearInterval(timer)
      }, 16)
    })
  }, [])

  return (
    <section id="hero">
      <div className="hero-glow"></div>

      <div className="float-card float-1">
        <div className="float-badge-ai">
          <span className="ai-dot"></span>
          <span style={{ color: 'var(--cyan)', fontWeight: 700 }}>تحليل AI</span>
        </div>
        <div style={{ marginTop: '0.35rem', color: 'var(--text-dim)' }}>نسبة تطابق الوظيفة</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gold-light)' }}>94%</div>
      </div>

      <div className="float-card float-2" style={{ animationDelay: '2s' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.35rem' }}>تم إيجاد وظيفة</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold-dim),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>أح</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>أحمد محمد</div>
            <div style={{ color: 'var(--gold)', fontSize: '0.7rem' }}>مطوّر Full-Stack ✓</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 850 }}>
        <div className="hero-badge">
          <span className="badge-dot"></span>
          منصة التوظيف الذكي العربية #1
        </div>

        <h1 className="hero-title">
          <span className="title-line1">وظيفتك المثالية</span>
          <span className="title-gradient">بقوة الذكاء الاصطناعي</span>
        </h1>

        <p className="hero-sub">
          منصة توظيف عربية ذكية تحلل سيرتك الذاتية، تطابقك مع الوظائف المناسبة،
          وتوفر على الشركات 80% من وقت الفرز — كل ذلك بالعربية بالكامل
        </p>

        <div className="hero-actions">
          <a href="#cta" className="btn-primary">ابدأ مجاناً الآن ←</a>
          <a href="#how" className="btn-secondary">▶ شاهد كيف تعمل</a>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num" data-count="25000" data-suffix="+">0</span>
            <div className="stat-label">باحث عن عمل</div>
          </div>
          <div className="stat-item">
            <span className="stat-num" data-count="500" data-suffix="+">0</span>
            <div className="stat-label">شركة موثوقة</div>
          </div>
          <div className="stat-item">
            <span className="stat-num" data-count="94" data-suffix="%">0</span>
            <div className="stat-label">دقة المطابقة</div>
          </div>
          <div className="stat-item">
            <span className="stat-num" data-count="80" data-suffix="%">0</span>
            <div className="stat-label">توفير في وقت HR</div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: إنشاء باقي أقسام `components/sections/`**

لكل قسم، انسخ محتوى الـ `<section>` المقابل من `ai-hire-arab.html` وحوّله إلى مكوّن React باتباع نفس النمط:
- أضف `'use client'` فقط للأقسام التي تحتوي على تفاعل (tabs, toggle, click handlers)
- حوّل `class` إلى `className`
- حوّل `onclick` إلى `onClick`
- حوّل `for` إلى `htmlFor`
- حوّل attributes بـ `-` إلى camelCase (مثل `stroke-width` → `strokeWidth`)

**الأقسام التي تحتاج `'use client'`:** `AIFeatures.tsx` (tabs), `Pricing.tsx` (toggle), `CTA.tsx` (يحتوي WaitlistForm)

**الأقسام التي لا تحتاج `'use client'`:** `Problem.tsx`, `HowItWorks.tsx`, `ForWho.tsx`, `Roadmap.tsx`, `StatsTicker.tsx`, `Footer.tsx`

**`components/sections/CTA.tsx`** (أهم قسم — يحتوي الفورم):

```tsx
// components/sections/CTA.tsx
import WaitlistForm from '@/components/WaitlistForm'

export default function CTA() {
  return (
    <section id="cta">
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div className="section-label" style={{ justifyContent: 'center' }}>🚀 ابدأ رحلتك</div>
        <h2 className="cta-title">
          جاهز لتجربة التوظيف<br />
          <span style={{ background: 'linear-gradient(135deg,var(--gold-light),var(--cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            بالذكاء الاصطناعي؟
          </span>
        </h2>
        <p className="cta-sub">
          سجّل الآن في قائمة الانتظار وكن من أوائل المستفيدين عند الإطلاق الرسمي
        </p>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <WaitlistForm />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add components/
git commit -m "feat: migrate HTML sections to Next.js components"
```

---

## Task 10: تجميع الصفحة الرئيسية

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: تحديث `app/layout.tsx` لإضافة Canvas3D**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'

const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false })

export const metadata: Metadata = {
  title: 'AI Hire Arab – منصة التوظيف بالذكاء الاصطناعي',
  description: 'AI Hire Arab — أول منصة توظيف عربية تعمل بالذكاء الاصطناعي. تحليل فوري للسيرة الذاتية، مطابقة ذكية مع الوظائف، وتوفير 80% من وقت فريق HR.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;900&family=Tajawal:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Canvas3D />
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: تحديث `app/page.tsx`**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Problem from '@/components/sections/Problem'
import HowItWorks from '@/components/sections/HowItWorks'
import AIFeatures from '@/components/sections/AIFeatures'
import ForWho from '@/components/sections/ForWho'
import Pricing from '@/components/sections/Pricing'
import Roadmap from '@/components/sections/Roadmap'
import StatsTicker from '@/components/sections/StatsTicker'
import CTA from '@/components/sections/CTA'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <AIFeatures />
        <ForWho />
        <Pricing />
        <Roadmap />
        <StatsTicker />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 3: إضافة scroll reveal بـ IntersectionObserver**

أضف هذا الملف:

```tsx
// components/ScrollReveal.tsx
'use client'

import { useEffect } from 'react'

export default function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
```

أضفه في `app/layout.tsx` بعد `<Canvas3D />`:
```tsx
import ScrollReveal from '@/components/ScrollReveal'
// ...
<Canvas3D />
<ScrollReveal />
{children}
```

- [ ] **Step 4: التحقق من ظهور الصفحة كاملة**

```bash
npm run dev
```

افتح `http://localhost:3000` وتحقق من:
- ظهور Canvas3D (نقاط ذهبية دوّارة)
- ظهور الـ Nav مع زر "ابدأ مجاناً"
- ظهور كل الأقسام
- عمل scroll animations

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/page.tsx components/ScrollReveal.tsx
git commit -m "feat: assemble main page with all sections"
```

---

## Task 11: اختبار التكامل النهائي

**Files:** لا يوجد ملفات جديدة

- [ ] **Step 1: تشغيل كل الاختبارات**

```bash
npm test
```

Expected: PASS — جميع الاختبارات تنجح (validation، API Route، WaitlistForm)

- [ ] **Step 2: اختبار المودال يدوياً**

```bash
npm run dev
```

1. افتح `http://localhost:3000`
2. اضغط "ابدأ مجاناً" في الـ Nav → المودال يظهر
3. اضغط Escape → المودال يغلق
4. اضغط خارج المودال → يغلق
5. اضغط ✕ → يغلق

- [ ] **Step 3: اختبار الفورم يدوياً مع Supabase**

1. تأكد أن `.env.local` يحتوي قيم Supabase الحقيقية
2. افتح المودال وأدخل بيانات صحيحة → يجب أن تظهر رسالة "تم التسجيل بنجاح!"
3. افتح Supabase Dashboard → Table Editor → waitlist → تحقق أن السجل ظهر
4. أدخل نفس الـ email مرة ثانية → يجب أن تظهر: "هذا البريد الإلكتروني مسجل مسبقاً"

- [ ] **Step 4: اختبار Inngest يدوياً**

1. شغّل Inngest Dev Server في terminal منفصل:
```bash
npx inngest-cli@latest dev
```
2. سجّل مستخدم جديد عبر الفورم
3. افتح `http://localhost:8288` (Inngest Dev UI)
4. تحقق أن event `waitlist/user.registered` وصل وتمّت معالجته

- [ ] **Step 5: Commit النهائي**

```bash
git add .
git commit -m "feat: complete waitlist signup flow — Next.js + Supabase + Inngest"
```

---

## ملاحظات التنفيذ

- **Three.js canvas**: إذا واجهت مشاكل في التحميل، ضع `dynamic(() => import('@/components/Canvas3D'), { ssr: false })` للتحميل من جانب العميل فقط (مطبّق بالفعل في Task 10).
- **CSS المحوّل**: بعض الـ attributes في الـ SVG تحتاج تحويلاً إلى camelCase (`stroke-width` → `strokeWidth`, `stop-color` → `stopColor`).
- **TypeScript**: إذا ظهرت أخطاء type في مكوّنات الأقسام، استخدم `// @ts-ignore` مؤقتاً ثم أصلحها لاحقاً.
- **Inngest في Production**: أضف INNGEST_EVENT_KEY و INNGEST_SIGNING_KEY في إعدادات البيئة على Vercel/المضيف.
