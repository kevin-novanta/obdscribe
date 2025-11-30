-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'ESTIMATE_SENT', 'APPROVED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'COMPLETED';
