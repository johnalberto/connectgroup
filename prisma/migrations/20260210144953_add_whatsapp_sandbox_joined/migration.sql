/*
  Warnings:

  - The values [SENT,DELIVERED,FAILED,READ] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,USER] on the enum `SenderType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `body` on the `message_templates` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `message_templates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `phone` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - A unique constraint covering the columns `[name]` on the table `message_templates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[twilioMessageSid]` on the table `whatsapp_messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `message_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateBody` to the `message_templates` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdBy` on table `message_templates` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `direction` to the `whatsapp_messages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('outbound', 'inbound');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('notification', 'invitation', 'reminder', 'general');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterEnum
BEGIN;
CREATE TYPE "MessageStatus_new" AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed', 'undelivered', 'received');
ALTER TABLE "whatsapp_messages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "whatsapp_messages" ALTER COLUMN "status" TYPE "MessageStatus_new" USING ("status"::text::"MessageStatus_new");
ALTER TYPE "MessageStatus" RENAME TO "MessageStatus_old";
ALTER TYPE "MessageStatus_new" RENAME TO "MessageStatus";
DROP TYPE "MessageStatus_old";
ALTER TABLE "whatsapp_messages" ALTER COLUMN "status" SET DEFAULT 'queued';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SenderType_new" AS ENUM ('admin', 'user', 'system');
ALTER TABLE "whatsapp_messages" ALTER COLUMN "senderType" TYPE "SenderType_new" USING ("senderType"::text::"SenderType_new");
ALTER TYPE "SenderType" RENAME TO "SenderType_old";
ALTER TYPE "SenderType_new" RENAME TO "SenderType";
DROP TYPE "SenderType_old";
COMMIT;

-- AlterTable
ALTER TABLE "message_templates" DROP COLUMN "body",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "category" "TemplateCategory" NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "language" VARCHAR(5) NOT NULL DEFAULT 'es',
ADD COLUMN     "templateBody" TEXT NOT NULL,
ADD COLUMN     "twilioContentSid" VARCHAR(34),
ADD COLUMN     "variables" JSONB,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "createdBy" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "whatsappSandboxJoined" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "whatsapp_messages" ADD COLUMN     "direction" "MessageDirection" NOT NULL,
ADD COLUMN     "errorCode" VARCHAR(10),
ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "templateUsed" VARCHAR(100),
ADD COLUMN     "templateVariables" JSONB,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'queued';

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_name_key" ON "message_templates"("name");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_messages_twilioMessageSid_key" ON "whatsapp_messages"("twilioMessageSid");

-- CreateIndex
CREATE INDEX "whatsapp_messages_twilioMessageSid_idx" ON "whatsapp_messages"("twilioMessageSid");

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
