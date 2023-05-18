-- CreateTable
CREATE TABLE "user" (
    "userId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "employeeNumber" INTEGER NOT NULL,
    "joinDate" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "businessSituation" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "confirmPassword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
