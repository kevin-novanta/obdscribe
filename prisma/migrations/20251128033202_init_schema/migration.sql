-- CreateTable
CREATE TABLE "Shop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'advisor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "shopId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vehicleYear" INTEGER,
    "vehicleMake" TEXT,
    "vehicleModel" TEXT,
    "vehicleTrim" TEXT,
    "mileage" INTEGER,
    "codesRaw" TEXT NOT NULL,
    "complaint" TEXT NOT NULL,
    "notes" TEXT,
    "techView" TEXT NOT NULL,
    "customerView" TEXT NOT NULL,
    "maintenanceSuggestions" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DtcCode" (
    "code" TEXT NOT NULL,
    "genericMeaning" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DtcCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "MaintenanceBand" (
    "id" SERIAL NOT NULL,
    "minMileage" INTEGER NOT NULL,
    "maxMileage" INTEGER NOT NULL,
    "suggestions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceBand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
