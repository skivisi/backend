-- CreateTable
CREATE TABLE "find" (
    "findId" SERIAL NOT NULL,
    "specId" INTEGER NOT NULL,
    "findItems" TEXT[],

    CONSTRAINT "find_pkey" PRIMARY KEY ("findId")
);

-- AddForeignKey
ALTER TABLE "find" ADD CONSTRAINT "find_specId_fkey" FOREIGN KEY ("specId") REFERENCES "spec"("specId") ON DELETE RESTRICT ON UPDATE CASCADE;
