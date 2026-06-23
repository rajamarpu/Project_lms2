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
Create a `.env` in the `backend/` directory:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

### Installation
From the root directory, install all dependencies for the frontend, backend, and admin portal:
```bash
npm run install:all
```

### Running Locally
To launch the entire stack concurrently (Frontend, Backend, and Admin), run this command from the root directory:
```bash
npm run dev
```

- **Frontend**: http://localhost:8081
- **Backend APIs**: http://localhost:5000/api-docs
- **Admin Portal**: http://localhost:5173
