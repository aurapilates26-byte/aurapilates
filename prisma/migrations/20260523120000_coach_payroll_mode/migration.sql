-- CreateEnum
CREATE TYPE "CoachPayrollMode" AS ENUM ('PER_SESSION', 'PER_MONTH');

-- AlterTable
ALTER TABLE "coaches" ADD COLUMN "monthlySalaryDinars" INTEGER,
ADD COLUMN "payrollMode" "CoachPayrollMode" NOT NULL DEFAULT 'PER_SESSION';
