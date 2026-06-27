-- Add nullable phone field used by the current Prisma schema.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
