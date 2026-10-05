-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Show_day_startsAt_idx" ON "Show"("day", "startsAt");

-- CreateIndex
CREATE INDEX "Show_stage_idx" ON "Show"("stage");
