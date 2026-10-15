-- CreateTable
CREATE TABLE "PaySettings" (
    "userId" TEXT NOT NULL,
    "hourlyWageCents" INTEGER NOT NULL,
    "nightBonusPercent" INTEGER NOT NULL,
    "nightStartHour" INTEGER NOT NULL,
    "nightEndHour" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaySettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "PaySettings" ADD CONSTRAINT "PaySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
