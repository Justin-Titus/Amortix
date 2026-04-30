# Amortix

Amortix is an AI-powered debt and loan management application built with **Next.js**, **TypeScript**, and **Tailwind CSS v4**.

It helps users track loan balances, model amortization schedules, compare repayment strategies, and get personalized AI guidance for smarter debt decisions.

## Features

- User authentication with email credentials and Google OAuth
- Dedicated sign-out confirmation flow
- Loan dashboard with add/edit/delete workflow
- Loan health and interest leak analysis
- Repayment strategy comparison and modeling
- EMI calendar and affordability insights
- AI-driven chat advisor with contextual loan guidance
- Responsive landing page and auth experience

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma + PostgreSQL adapter
- next-auth
- @tanstack/react-query
- Zustand
- Framer Motion
- Recharts
- AI SDK integration

## Project Structure

- `app/` — routes for landing, auth, dashboard, and API
- `components/` — UI components and reusable modules
- `lib/` — auth config, API helpers, Prisma client, calculations, and prompts
- `prisma/` — database schema
- `public/` — static assets, logos, and images

## Getting Started

### Install dependencies

```bash
pnpm install
```

### Environment

Create a `.env` file with the following keys:

```env
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
DATABASE_URL=postgresql://user:password@host:port/dbname
PGSSLMODE=no-verify
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

> If you are not using Google OAuth, you can omit the GitHub provider config and only use credentials-based sign-in.

### Run locally

```bash
pnpm dev
```

Open `http://localhost:3000`

### Build for production

```bash
pnpm build
pnpm start
```

## Authentication Routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/signout`

## Dashboard Routes

- `/dashboard`
- `/loans`
- `/loans/add`
- `/loans/[id]`
- `/loans/[id]/edit`
- `/calendar`
- `/strategy`
- `/chat`
- `/insights`
- `/glossary`
- `/profile`

## API Routes

- `app/api/auth/[...nextauth]` — NextAuth handler
- `app/api/auth/signout` — sign-out redirect and logout route
- `app/api/auth/verify` — email verification route
- `app/api/chat` — AI chat endpoint

## Notes

- The app uses middleware in `proxy.ts` to guard protected dashboard routes.
- The auth UI is built around a shared `AuthSplitLayout`.
- The dashboard includes loan analysis, strategy comparison, and AI assistance.

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Install dependencies: `pnpm install`
4. Make your changes
5. Validate with `pnpm build`
6. Open a pull request

## License

No license is currently specified. Add one if you want to publish this project.
