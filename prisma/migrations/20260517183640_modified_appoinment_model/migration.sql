-- AlterEnum
ALTER TYPE "AppointmentStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "heightCm" INTEGER,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "userNotes" TEXT,
ALTER COLUMN "requestDate" SET DEFAULT CURRENT_TIMESTAMP;
