# Course Compass LMS

A complete Full-Stack Learning Management System featuring:
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express, Prisma (PostgreSQL)
- **Admin**: Standalone React/Vite portal

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (or an external Supabase connection)

### Environment Variables
Before running the application, ensure your `.env` files are correctly configured.

#### `backend/.env`
Create a `.env` in the `backend/` directory. For Supabase, use the shared pooler connection string from **Project Settings -> Database** and keep `?sslmode=require&uselibpqcompat=true` on the URL:
```env
PORT=5001
DATABASE_URL="postgresql://postgres.okzgkdlftosnlkzozhls:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require&uselibpqcompat=true"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Optional admin seed credentials:
```env
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
```

After setting `DATABASE_URL`, apply migrations and create the admin account:
```bash
cd backend
npx prisma migrate deploy
node createAdmin.js
```

For deployed frontends, set `VITE_API_URL` to your backend API URL, for example:
```env
VITE_API_URL=https://your-backend.example.com/api
VITE_BACKEND_URL=https://your-backend.example.com
```

### Installation
From the root directory, install all dependencies for the frontend, backend, and admin portal:
```bash
npm run install:all
```

### Running Locally
From the root directory, start the backend API in one terminal:
```bash
npm run backend
```

Then start the learner frontend in another terminal:
```bash
npm run dev
```

- **Frontend**: http://localhost:3000
- **Backend APIs**: http://localhost:5001/api-docs
- **Admin Portal**: run `npm run admin`, then open http://localhost:3001

To launch the entire stack concurrently (Frontend, Backend, and Admin), run:
```bash
npm run dev:all
```

## MYPROJECT feature parity

The persisted feature set imported from `MYPROJECT/DEMO PROJECT` includes:

- Community topics, posts, reporting, and admin moderation
- Scheduled live learning sessions
- Configurable AI tutor personalities and persisted chat rooms
- Standalone question practice with answer validation
- Assessment retake grants
- Admin Feature Hub for tutor, live-session, practice-question, and moderation operations

These features use migration `20260621170000_myproject_feature_parity`. AI tutor responses require `GEMINI_API_KEY`; without it, messages remain persisted but the API returns an explicit provider-configuration error. OAuth, transactional email, and payment capture still require real provider credentials and callback/webhook configuration and are not simulated.
