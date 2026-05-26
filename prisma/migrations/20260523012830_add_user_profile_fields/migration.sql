-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "bankOwner" TEXT,
ADD COLUMN     "favoriteTeam" TEXT,
ADD COLUMN     "paymentReceipt" TEXT,
ADD COLUMN     "paymentRef" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDIENTE';
