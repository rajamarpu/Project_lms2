# Course Compass LMS

A complete full-stack learning management system featuring:
- **Student frontend**: React, TypeScript, TailwindCSS, Vite
- **Admin portal**: React, Vite
- **Backend**: Node.js, Express, Prisma, PostgreSQL

## Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- PostgreSQL access for the backend database

## Environment variables
Create or verify the backend environment file at [LMS/backend/.env](backend/.env):

```env
PORT=5000
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY="your_gemini_key"
```

## Installation
From the project root, install dependencies for the root workspace, backend, student frontend, and admin portal:

```bash
cd "c:/Users/PC/OneDrive/Desktop/UptoSkills LMS/LMS"
npm run install:all
```

## Run locally
Start the complete stack from the project root:

```bash
cd "c:/Users/PC/OneDrive/Desktop/UptoSkills LMS/LMS"
npm run dev
```

This starts:
- **Backend API**: http://127.0.0.1:5000/
- **Admin portal**: http://localhost:5173/
- **Student frontend**: http://localhost:8083/

## Useful URLs
- Student app: http://localhost:8083/
- Admin login: http://localhost:5173/admin-login
- Admin dashboard: http://localhost:5173/dashboard/admin
- Backend health: http://127.0.0.1:5000/health

## Admin login credentials
For the local development database, a default admin account is created by the backend helper script:

- Email: shubham3@gmail.com
- Password: shubham123

## Troubleshooting
If one of the apps does not start:

```bash
cd "c:/Users/PC/OneDrive/Desktop/UptoSkills LMS/LMS"
npm run install:all
npm run dev
```

If the backend cannot connect to the database, verify the values in [LMS/backend/.env](backend/.env) and ensure the configured PostgreSQL instance is reachable.
