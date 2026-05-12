# FloraGuard — AI Plant Disease Detector

A production-ready web application for detecting plant diseases from photos using YOLOv4 + Gemini AI.

> **⚠️ One-time setup step (do this first):**  
> Delete the placeholder conflict file before running `npm run dev` or `npm run build`:  
> ```bash
> git rm src/app/\(marketing\)/page.tsx
> # Windows PowerShell: Remove-Item "src/app/(marketing)/page.tsx"
> ```
> This removes a routing conflict between `app/page.tsx` and `app/(marketing)/page.tsx`  
> (both map to `/` in Next.js App Router). `app/page.tsx` is the canonical home page.

## File Structure

```
floraguard/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Public pages: home, about, product, pricing, contact, privacy, terms
│   │   ├── (app)/                # Protected user pages: /try, /history, /profile
│   │   ├── admin/                # Admin pages: dashboard, users, scans, sales, settings
│   │   ├── auth/                 # OTP login page
│   │   └── api/                  # Route handlers (auth, scans, detect, recommendations, admin/*)
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives (Button, Input, Modal, Toast, etc.)
│   │   ├── layout/               # Navbar, Footer, AdminSidebar
│   │   ├── marketing/            # SalesModal
│   │   └── scan/                 # UploadWidget, DetectionCanvas, DetectionsList, GeminiOutput
│   ├── lib/                      # Auth (JWT), Supabase clients, Twilio, Gemini, rate-limit, utils
│   ├── middleware.ts              # Security headers + route protection
│   └── types/                    # Shared TypeScript types
├── supabase/
│   └── schema.sql                # Tables + RLS policies — run in Supabase SQL Editor
├── ml-server/
│   ├── main.py                   # FastAPI inference server
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
└── scripts/
    └── seed-admin.ts             # Creates the default admin user
```

---

## 1. Web App — Local Setup

### Prerequisites
- Node.js 20+

### Steps

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local and fill in all values (see comments in the file)
```

Edit `.env.local`:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # Keep SECRET — never expose to browser
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=...
GEMINI_API_KEY=...                   # Optional — uses mock if absent
ML_SERVER_URL=http://localhost:8000
JWT_SECRET=<run: openssl rand -hex 32>
DEFAULT_ADMIN_EMAIL=admin@floraguard.local
DEFAULT_ADMIN_PASSWORD=FloraGuard@123
```

```bash
npm run dev
# → http://localhost:3000
```

---

## 2. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL Editor, paste and run `supabase/schema.sql`
3. In **Storage**, create a **private** bucket named `scans`
4. Copy your **Project URL**, **anon key**, and **service role key** into `.env.local`

---

## 3. Twilio Verify Setup

1. Sign up at [twilio.com](https://www.twilio.com)
2. Go to **Verify → Services** → Create a new service
3. Copy the **Service SID** (`VA…`) into `TWILIO_VERIFY_SERVICE_SID`
4. Copy your **Account SID** and **Auth Token** into the env file

---

## 4. Seed the Admin User

After setting up Supabase, run:

```bash
npm run seed
```

This creates `admin@floraguard.local` / `FloraGuard@123` in the `profiles` table.  
**Change the password before deploying to production.**

---

## 5. Running the ML Server

```bash
cd ml-server
python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Test it:
```bash
curl -X POST http://localhost:8000/detect \
  -F "image=@test_leaf.jpg"
```

### Plugging In Your Real YOLOv4 MobileNetV2 Model

See `ml-server/README.md` for detailed instructions on replacing the mock inference with real YOLOv4 MobileNetV2 weights. Look for the two `# TODO:` comments in `ml-server/main.py`.

---

## 6. Configuring ML_SERVER_URL

- **Local:** `ML_SERVER_URL=http://localhost:8000`
- **Production:** `ML_SERVER_URL=https://your-ml-server.example.com`

The Next.js API route `/api/detect` proxies requests to this URL server-side (the browser never calls the ML server directly).

---

## 7. Gemini API

- Get a key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
- Set `GEMINI_API_KEY=your-key` in `.env.local`
- Without a key the app uses rich mock recommendations — fully functional for testing

To enable real streaming, uncomment the Gemini block in `src/lib/gemini.ts` and wire the `ReadableStream` response in `src/components/scan/gemini-output.tsx`.

---

## 8. Deployment Tips

### Web App → Vercel

```bash
npx vercel --prod
```

Set all `.env.local` variables in Vercel Dashboard → Project → Environment Variables.

### ML Server → Docker on any VM

```bash
cd ml-server
docker build -t floraguard-ml .
docker run -d -p 8000:8000 --restart=always floraguard-ml
```

Put NGINX + SSL in front and update `ML_SERVER_URL` in Vercel env vars.

### Supabase → Managed (no extra deployment)

Just ensure your production project has `schema.sql` applied and the `scans` bucket created.

---

## Architecture

```
Browser
  │
  ├── Next.js App (Vercel)
  │     ├── /api/auth/*         Twilio OTP + admin login → JWT httpOnly cookie
  │     ├── /api/scans/upload   Supabase Storage upload
  │     ├── /api/detect         Proxies to FastAPI ML server
  │     └── /api/recommendations  Gemini AI
  │
  ├── Supabase (PostgreSQL + private Storage)
  ├── Twilio Verify (OTP SMS)
  ├── Google Gemini (AI recommendations)
  └── FastAPI ML Server (YOLOv4 MobileNetV2)
```

---

## Security

- Sessions: JWT in `httpOnly` cookie, signed with `JWT_SECRET`
- Security headers applied globally via `src/middleware.ts` (CSP, XFO, etc.)
- Service role key stays server-side only
- OTP send: 5 requests / 10 min per IP
- Upload/detect: 20 requests / hour per user
- All inputs validated with Zod on client + server
- Admin routes double-checked in middleware and route handlers
