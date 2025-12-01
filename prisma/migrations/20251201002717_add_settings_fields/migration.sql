-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "address" TEXT,
ADD COLUMN     "defaultIncludeMaint" BOOLEAN,
ADD COLUMN     "defaultReportMode" TEXT,
ADD COLUMN     "defaultReportTone" TEXT,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT;
