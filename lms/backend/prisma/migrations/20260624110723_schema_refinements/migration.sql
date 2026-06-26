/*
  Warnings:

  - The `status` column on the `Certificate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `CommunityReport` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `price` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - The `status` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `CourseReview` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `LiveSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `AssessmentAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AssessmentRetakeGrant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BillingRecord` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `BillingRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Bookmark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CommunityReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LearningEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TicketMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserPreference` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('published', 'hidden');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('pending', 'issued', 'revoked');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('pending', 'paid', 'failed');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('scheduled', 'live', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('open', 'actioned', 'dismissed');

-- DropForeignKey
ALTER TABLE "CommunityPost" DROP CONSTRAINT "CommunityPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CommunityTopic" DROP CONSTRAINT "CommunityTopic_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeQuestion" DROP CONSTRAINT "PracticeQuestion_authorId_fkey";

-- DropForeignKey
ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "TicketMessage" DROP CONSTRAINT "TicketMessage_authorId_fkey";

-- AlterTable
ALTER TABLE "AssessmentAttempt" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "AssessmentRetakeGrant" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "BillingRecord" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BillingStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "status",
ADD COLUMN     "status" "CertificateStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CommunityPost" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CommunityReport" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'open';

-- AlterTable
ALTER TABLE "CommunityTopic" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "instructorId" DROP NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE INTEGER,
DROP COLUMN "status",
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "CourseReview" DROP COLUMN "status",
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'published';

-- AlterTable
ALTER TABLE "LearningEvent" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "LiveSession" DROP COLUMN "status",
ADD COLUMN     "status" "LiveSessionStatus" NOT NULL DEFAULT 'scheduled';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PracticeQuestion" ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SupportTicket" ALTER COLUMN "requesterId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TicketMessage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "authorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "status",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "UserPreference" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "BillingRecord_status_createdAt_idx" ON "BillingRecord"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Certificate_status_createdAt_idx" ON "Certificate"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CommunityReport_status_createdAt_idx" ON "CommunityReport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Course_status_createdAt_idx" ON "Course"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CourseReview_courseId_status_idx" ON "CourseReview"("courseId", "status");

-- CreateIndex
CREATE INDEX "LiveSession_startsAt_status_idx" ON "LiveSession"("startsAt", "status");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityTopic" ADD CONSTRAINT "CommunityTopic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeQuestion" ADD CONSTRAINT "PracticeQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
