-- =========================================================
-- HR Portal Migration: New Tables for INZOZI Group MIS
-- Run this in Supabase SQL Editor → SQL Editor → New Query
-- =========================================================

-- Create Enums
CREATE TYPE "ApprovalType" AS ENUM ('time_off', 'hardware', 'expense', 'other');
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "AssetStatus" AS ENUM ('available', 'assigned', 'maintenance', 'retired');

-- Add new columns to Employee (safe, nullable)
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "Employee" ADD COLUMN IF NOT EXISTS "location" TEXT;

-- Onboarding Checklist
CREATE TABLE IF NOT EXISTS "OnboardingChecklist" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OnboardingChecklist_employeeId_idx" ON "OnboardingChecklist"("employeeId");
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Approval Requests
CREATE TABLE IF NOT EXISTS "ApprovalRequest" (
    "id" TEXT NOT NULL,
    "type" "ApprovalType" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ApprovalRequest_employeeId_idx" ON "ApprovalRequest"("employeeId");
CREATE INDEX IF NOT EXISTS "ApprovalRequest_status_idx" ON "ApprovalRequest"("status");
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Hardware Assets
CREATE TABLE IF NOT EXISTS "HardwareAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT,
    "specs" TEXT,
    "status" "AssetStatus" NOT NULL DEFAULT 'available',
    "purchasedAt" TIMESTAMP(3),
    "warrantyUntil" TIMESTAMP(3),
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HardwareAsset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "HardwareAsset_serialNumber_key" ON "HardwareAsset"("serialNumber");
CREATE INDEX IF NOT EXISTS "HardwareAsset_assignedToId_idx" ON "HardwareAsset"("assignedToId");
CREATE INDEX IF NOT EXISTS "HardwareAsset_status_idx" ON "HardwareAsset"("status");
ALTER TABLE "HardwareAsset" ADD CONSTRAINT "HardwareAsset_assignedToId_fkey"
    FOREIGN KEY ("assignedToId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SaaS Licenses
CREATE TABLE IF NOT EXISTS "SaasLicense" (
    "id" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Productivity',
    "totalSeats" INTEGER NOT NULL DEFAULT 0,
    "usedSeats" INTEGER NOT NULL DEFAULT 0,
    "costPerSeat" DOUBLE PRECISION,
    "renewalDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SaasLicense_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SaasLicense_tool_key" ON "SaasLicense"("tool");

-- Certifications
CREATE TABLE IF NOT EXISTS "Certification" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "badgeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Certification_employeeId_idx" ON "Certification"("employeeId");
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_employeeId_fkey"
    FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
