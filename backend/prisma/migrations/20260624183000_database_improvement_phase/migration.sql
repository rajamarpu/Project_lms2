-- Database improvement phase: enum cleanup, course slug, and safer structured fields

CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'pending', 'scheduled', 'approved', 'archived', 'rejected');
CREATE TYPE "ReviewStatus" AS ENUM ('published', 'hidden');
CREATE TYPE "CertificateStatus" AS ENUM ('pending', 'issued', 'revoked');
CREATE TYPE "BillingStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'canceled');
CREATE TYPE "LiveSessionStatus" AS ENUM ('scheduled', 'live', 'completed', 'canceled');
CREATE TYPE "CommunityReportStatus" AS ENUM ('open', 'actioned', 'dismissed');
CREATE TYPE "SupportTicketPriority" AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE "PracticeQuestionDifficulty" AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE "PracticeQuestionType" AS ENUM ('multiple_choice', 'true_false', 'short_answer');

ALTER TABLE "User"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "UserStatus" USING "status"::text::"UserStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "Course"
  ADD COLUMN "slug" TEXT;

ALTER TABLE "Course"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "CourseStatus" USING "status"::text::"CourseStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

ALTER TABLE "CourseReview"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "ReviewStatus" USING "status"::text::"ReviewStatus",
  ALTER COLUMN "status" SET DEFAULT 'published';

ALTER TABLE "Certificate"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "CertificateStatus" USING "status"::text::"CertificateStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "BillingRecord"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "BillingStatus" USING "status"::text::"BillingStatus",
  ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "LiveSession"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "LiveSessionStatus" USING "status"::text::"LiveSessionStatus",
  ALTER COLUMN "status" SET DEFAULT 'scheduled';

ALTER TABLE "CommunityReport"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "CommunityReportStatus" USING "status"::text::"CommunityReportStatus",
  ALTER COLUMN "status" SET DEFAULT 'open';

ALTER TABLE "SupportTicket"
  ALTER COLUMN "priority" DROP DEFAULT,
  ALTER COLUMN "priority" TYPE "SupportTicketPriority" USING "priority"::text::"SupportTicketPriority",
  ALTER COLUMN "priority" SET DEFAULT 'medium';

ALTER TABLE "PracticeQuestion"
  ALTER COLUMN "difficulty" DROP DEFAULT,
  ALTER COLUMN "difficulty" TYPE "PracticeQuestionDifficulty" USING "difficulty"::text::"PracticeQuestionDifficulty",
  ALTER COLUMN "difficulty" SET DEFAULT 'medium',
  ALTER COLUMN "type" DROP DEFAULT,
  ALTER COLUMN "type" TYPE "PracticeQuestionType" USING "type"::text::"PracticeQuestionType",
  ALTER COLUMN "type" SET DEFAULT 'multiple_choice';

ALTER TABLE "SupportTicket" DROP CONSTRAINT "SupportTicket_requesterId_fkey";
ALTER TABLE "SupportTicket"
  ALTER COLUMN "requesterId" DROP NOT NULL;
ALTER TABLE "SupportTicket"
  ADD CONSTRAINT "SupportTicket_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketMessage" DROP CONSTRAINT "TicketMessage_authorId_fkey";
ALTER TABLE "TicketMessage"
  ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "TicketMessage"
  ADD CONSTRAINT "TicketMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
