-- CreateTable
CREATE TABLE "QuizHistory" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "QuizHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizHistory" ADD CONSTRAINT "QuizHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
