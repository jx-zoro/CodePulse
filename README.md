# CodePulse

CodePulse is a professional, industry-level web application designed as a developer-focused API testing and performance analysis platform.

> "Test. Measure. Understand. Improve."

## ?? Features
- **API Tester:** Perform complex HTTP requests (GET, POST, PUT, DELETE) with headers, query params, and body payloads.
- **AI Copilot:** Built-in AI to explain errors, analyze response performance, and generate code snippets.
- **Collections & Environments:** Organize requests into Collections and switch environment variables instantly.
- **Security Posture & Mocking:** Analyze requests for security vulnerabilities and intercept calls with dynamic Mock Servers.
- **API Releases:** Define Quality Gates (Tests, Contracts, Security) before deploying your APIs.
- **SDK Generator:** Instantly generate TypeScript, Python, and Go client boilerplate.

## ?? Architecture
CodePulse is built with modern, scalable technologies:
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand.
- **Backend:** Next.js API Routes.
- **Database:** Prisma ORM backed by SQLite (local development).
- **Security:** Built-in SSRF Protection and Rate Limiting.

## ?? Requirements
- Node.js 20+
- npm 10+

## ?? Installation & Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and fill in your details:
   ```bash
   cp .env.example .env
   ```

3. **Database Setup**
   CodePulse uses Prisma with SQLite. Push the initial schema:
   ```bash
   npx prisma db push
   ```

4. **Start the Application**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## ?? Production Build
To create an optimized production build:
```bash
npm run build
npm run start
```

## ?? Security Considerations
- **AI Privacy:** CodePulse includes an `AIRedactionService` that automatically strips Authorization headers, cookies, JWTs, and passwords before sending context to the AI Provider.
- **SSRF:** The proxy route (`/api/proxy`) blocks requests to local and internal IP ranges (e.g., `127.0.0.1`, `10.x.x.x`).

## ?? Documentation
Review `docs/PRODUCTION_CHECKLIST.md` before deploying CodePulse to a live server.
