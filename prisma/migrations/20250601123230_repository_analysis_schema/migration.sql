/*
  Warnings:

  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewFeedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InterviewQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_userId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewFeedback" DROP CONSTRAINT "InterviewFeedback_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewQuestion" DROP CONSTRAINT "InterviewQuestion_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubUsername" TEXT;

-- DropTable
DROP TABLE "Interview";

-- DropTable
DROP TABLE "InterviewFeedback";

-- DropTable
DROP TABLE "InterviewQuestion";

-- DropTable
DROP TABLE "Subscription";

-- DropEnum
DROP TYPE "InterviewStatus";

-- DropEnum
DROP TYPE "InterviewType";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "SubscriptionType";

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "watchers" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "htmlUrl" TEXT NOT NULL,
    "cloneUrl" TEXT NOT NULL,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "topics" TEXT[],
    "license" TEXT,
    "hasWiki" BOOLEAN NOT NULL DEFAULT false,
    "hasPages" BOOLEAN NOT NULL DEFAULT false,
    "hasProjects" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryView" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "repositoryId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepositoryView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepositoryAnalysis" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "totalLines" INTEGER,
    "totalFiles" INTEGER,
    "avgComplexity" DOUBLE PRECISION,
    "testCoverage" INTEGER,
    "securityScore" INTEGER,
    "maintainabilityScore" INTEGER,
    "documentationScore" INTEGER,
    "vulnerabilities" JSONB,
    "contributors" JSONB,
    "commits" JSONB,
    "fileTypes" JSONB,
    "aiInsights" TEXT,
    "aiInsightsGeneratedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepositoryAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_owner_idx" ON "Repository"("owner");

-- CreateIndex
CREATE INDEX "Repository_fullName_idx" ON "Repository"("fullName");

-- CreateIndex
CREATE INDEX "Repository_language_idx" ON "Repository"("language");

-- CreateIndex
CREATE INDEX "Repository_isPrivate_idx" ON "Repository"("isPrivate");

-- CreateIndex
CREATE INDEX "RepositoryView_userId_idx" ON "RepositoryView"("userId");

-- CreateIndex
CREATE INDEX "RepositoryView_repositoryId_idx" ON "RepositoryView"("repositoryId");

-- CreateIndex
CREATE INDEX "RepositoryView_viewedAt_idx" ON "RepositoryView"("viewedAt");

-- CreateIndex
CREATE INDEX "RepositoryView_ipAddress_idx" ON "RepositoryView"("ipAddress");

-- CreateIndex
CREATE INDEX "RepositoryAnalysis_repositoryId_idx" ON "RepositoryAnalysis"("repositoryId");

-- CreateIndex
CREATE INDEX "RepositoryAnalysis_createdAt_idx" ON "RepositoryAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "User_githubUsername_idx" ON "User"("githubUsername");

-- AddForeignKey
ALTER TABLE "RepositoryView" ADD CONSTRAINT "RepositoryView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryView" ADD CONSTRAINT "RepositoryView_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepositoryAnalysis" ADD CONSTRAINT "RepositoryAnalysis_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
