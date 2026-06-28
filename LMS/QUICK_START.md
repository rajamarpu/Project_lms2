# Quick Start Guide - UptoSkills LMS

## Prerequisites
- Node.js 18+ installed
- npm 9+ installed
- PostgreSQL reachable from the backend

## 1) Install dependencies

```bash
cd "c:/Users/PC/OneDrive/Desktop/UptoSkills LMS/LMS"
npm run install:all
```

## 2) Configure backend environment
Create or verify [LMS/backend/.env](backend/.env) with values similar to:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY="your_gemini_key"
```

## 3) Start everything
From the project root:

```bash
cd "c:/Users/PC/OneDrive/Desktop/UptoSkills LMS/LMS"
npm run dev
```

This starts:
- Backend API: http://127.0.0.1:5000/
- Student frontend: http://localhost:8083/
- Admin portal: http://localhost:5173/

## 4) Open the apps
- Student app: http://localhost:8083/
- Admin login: http://localhost:5173/admin-login
- Admin dashboard: http://localhost:5173/dashboard/admin
- Backend health: http://127.0.0.1:5000/health

## 5) Local admin credentials
A local admin account is created by the backend helper script:

- Email: shubham3@gmail.com
- Password: shubham123

## Troubleshooting

### Backend cannot connect
Verify the database URL in [LMS/backend/.env](backend/.env) and ensure PostgreSQL is reachable.

### Port already in use
If a port is occupied, stop the existing process and restart:

```bash
# Example for the frontend
Get-NetTCPConnection -LocalPort 8083 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
```

### Reinstall dependencies
```bash
cd "c:/Users/PC/OneDrive/Desktop/UptoSkills LMS/LMS"
npm run install:all
```
