import { PrismaClient } from '@prisma/client';

let prisma;
let dbConnectedState = false;
let checkPromise = null;
let lastCheckTime = 0;
const CHECK_COOLDOWN = 10000; // 10 seconds cooldown between checks

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("❌ Failed to initialize Prisma Client:", error.message);
}

export default prisma;

// Actual connection check
const verifyConnection = async () => {
  if (!process.env.DATABASE_URL || !prisma) {
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.error("❌ Database connection check failed:", err.message || err);
    return false;
  }
};

// Periodic background checks or cooldown-based check
export const isDbConnected = async (forceWait = false) => {
  const now = Date.now();
  if (now - lastCheckTime > CHECK_COOLDOWN) {
    // If not currently checking, trigger a background check
    if (!checkPromise) {
      checkPromise = verifyConnection().then((connected) => {
        if (dbConnectedState !== connected) {
          dbConnectedState = connected;
          console.log(`[Database] Connection state changed to: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
        }
        lastCheckTime = Date.now();
        checkPromise = null;
        return connected;
      });
    }
  }
  
  if (forceWait && checkPromise) {
    await checkPromise;
  }
  
  // Return the last known state immediately without waiting for queryRaw!
  return dbConnectedState;
};

// Initial verification at module load
checkPromise = verifyConnection().then((connected) => {
  dbConnectedState = connected;
  lastCheckTime = Date.now();
  console.log(`[Database] Initial connection check: ${connected ? 'SUCCESS' : 'FAILED'}`);
  checkPromise = null;
  return connected;
});
