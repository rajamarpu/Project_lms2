CREATE TABLE "FlashcardDeck" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "subject" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "topic" TEXT,
  "difficulty" TEXT NOT NULL DEFAULT 'beginner',
  "courseId" TEXT,
  "authorId" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FlashcardDeck_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Flashcard" (
  "id" TEXT NOT NULL,
  "deckId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "FlashcardProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deckId" TEXT NOT NULL,
  "currentCard" INTEGER NOT NULL DEFAULT 0,
  "viewedCards" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FlashcardProgress_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FlashcardDeck_publishedAt_category_difficulty_idx" ON "FlashcardDeck"("publishedAt", "category", "difficulty");
CREATE INDEX "FlashcardDeck_courseId_idx" ON "FlashcardDeck"("courseId");
CREATE UNIQUE INDEX "Flashcard_deckId_order_key" ON "Flashcard"("deckId", "order");
CREATE UNIQUE INDEX "FlashcardProgress_userId_deckId_key" ON "FlashcardProgress"("userId", "deckId");
CREATE INDEX "FlashcardProgress_userId_updatedAt_idx" ON "FlashcardProgress"("userId", "updatedAt");
ALTER TABLE "FlashcardDeck" ADD CONSTRAINT "FlashcardDeck_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "FlashcardDeck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "FlashcardDeck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
