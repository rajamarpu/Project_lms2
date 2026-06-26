CREATE TABLE "LiveSession" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "courseId" TEXT,
  "instructorId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 60,
  "meetingUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityTopic" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "createdById" TEXT NOT NULL,
  "locked" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunityTopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityPost" (
  "id" TEXT NOT NULL,
  "topicId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "hidden" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityReport" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "reporterId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "CommunityReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AIPersonality" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "avatar" TEXT,
  "accent" TEXT NOT NULL DEFAULT '#6366f1',
  "systemPrompt" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AIPersonality_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMessage" (
  "id" TEXT NOT NULL,
  "roomId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT,
  "personalityId" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "content" TEXT NOT NULL,
  "moderated" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PracticeQuestion" (
  "id" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL DEFAULT 'medium',
  "type" TEXT NOT NULL DEFAULT 'multiple_choice',
  "prompt" TEXT NOT NULL,
  "options" JSONB,
  "answer" JSONB,
  "explanation" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PracticeQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentRetakeGrant" (
  "id" TEXT NOT NULL,
  "assessmentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "grantedById" TEXT NOT NULL,
  "extraAttempts" INTEGER NOT NULL DEFAULT 1,
  "reason" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentRetakeGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityReport_postId_reporterId_key" ON "CommunityReport"("postId", "reporterId");
CREATE UNIQUE INDEX "AIPersonality_name_key" ON "AIPersonality"("name");
CREATE INDEX "LiveSession_startsAt_status_idx" ON "LiveSession"("startsAt", "status");
CREATE INDEX "LiveSession_courseId_startsAt_idx" ON "LiveSession"("courseId", "startsAt");
CREATE INDEX "CommunityTopic_createdAt_idx" ON "CommunityTopic"("createdAt");
CREATE INDEX "CommunityPost_topicId_createdAt_idx" ON "CommunityPost"("topicId", "createdAt");
CREATE INDEX "CommunityReport_status_createdAt_idx" ON "CommunityReport"("status", "createdAt");
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");
CREATE INDEX "ChatMessage_userId_createdAt_idx" ON "ChatMessage"("userId", "createdAt");
CREATE INDEX "PracticeQuestion_category_difficulty_active_idx" ON "PracticeQuestion"("category", "difficulty", "active");
CREATE INDEX "AssessmentRetakeGrant_assessmentId_userId_expiresAt_idx" ON "AssessmentRetakeGrant"("assessmentId", "userId", "expiresAt");

ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityTopic" ADD CONSTRAINT "CommunityTopic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "CommunityTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityReport" ADD CONSTRAINT "CommunityReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_personalityId_fkey" FOREIGN KEY ("personalityId") REFERENCES "AIPersonality"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PracticeQuestion" ADD CONSTRAINT "PracticeQuestion_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentRetakeGrant" ADD CONSTRAINT "AssessmentRetakeGrant_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentRetakeGrant" ADD CONSTRAINT "AssessmentRetakeGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentRetakeGrant" ADD CONSTRAINT "AssessmentRetakeGrant_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
