-- CreateTable
CREATE TABLE "member_pending_packs" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pending_packs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_pending_packs_memberId_position_idx" ON "member_pending_packs"("memberId", "position");

-- AddForeignKey
ALTER TABLE "member_pending_packs" ADD CONSTRAINT "member_pending_packs_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_pending_packs" ADD CONSTRAINT "member_pending_packs_packId_fkey" FOREIGN KEY ("packId") REFERENCES "packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
