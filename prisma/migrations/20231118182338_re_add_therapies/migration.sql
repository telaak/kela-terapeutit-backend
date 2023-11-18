-- CreateTable
CREATE TABLE "Therapy" (
    "id" SERIAL NOT NULL,
    "muoto" TEXT NOT NULL,
    "lajit" TEXT[],
    "therapistId" INTEGER,

    CONSTRAINT "Therapy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Therapy" ADD CONSTRAINT "Therapy_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
