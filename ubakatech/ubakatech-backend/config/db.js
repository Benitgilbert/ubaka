import { PrismaClient } from '@prisma/client';

let prisma;
let dbConnectedState = false;
let checkPromise = null;
let lastCheckTime = 0;
const CHECK_COOLDOWN = 30000; // 30 seconds cooldown between checks (was 10s — reduces pressure on free-tier DB)

// Determine if we're on a free-tier DB (connection_limit env not set → assume 1)
// DATABASE_URL can include ?connection_limit=N to override, otherwise we cap at 1
const CONNECTION_LIMIT = parseInt(process.env.DB_CONNECTION_LIMIT || '1', 10);

let connectionUrl = process.env.DATABASE_URL;
if (connectionUrl) {
  try {
    // Sanitize credentials part to handle unencoded special characters (like literal '@' in passwords)
    const lastAt = connectionUrl.lastIndexOf('@');
    if (lastAt !== -1) {
      const credentialsPart = connectionUrl.substring(0, lastAt);
      const hostPart = connectionUrl.substring(lastAt); // includes the '@'
      
      const protocolEnd = credentialsPart.indexOf('://') + 3;
      if (protocolEnd > 2) {
        const userPassPart = credentialsPart.substring(protocolEnd);
        const colonIdx = userPassPart.indexOf(':');
        if (colonIdx !== -1) {
          const username = userPassPart.substring(0, colonIdx);
          const password = userPassPart.substring(colonIdx + 1);
          
          // Safely decode first, then encode to avoid double-encoding % characters
          const safePassword = encodeURIComponent(decodeURIComponent(password));
          
          connectionUrl = credentialsPart.substring(0, protocolEnd) + username + ':' + safePassword + hostPart;
        }
      }
    }
  } catch (err) {
    console.error('[Database] Failed to sanitize credentials in DATABASE_URL:', err.message);
  }

  try {
    // Normalise connection parameters safely using string checks
    if (!connectionUrl.includes('schema=')) {
      const sep = connectionUrl.includes('?') ? '&' : '?';
      connectionUrl = `${connectionUrl}${sep}schema=ubakatech`;
    }
    if (!connectionUrl.includes('sslaccept=')) {
      const sep = connectionUrl.includes('?') ? '&' : '?';
      connectionUrl = `${connectionUrl}${sep}sslaccept=accept_invalid_certs`;
    }
    if (!connectionUrl.includes('sslmode=')) {
      const sep = connectionUrl.includes('?') ? '&' : '?';
      connectionUrl = `${connectionUrl}${sep}sslmode=require`;
    }
    
    // Force connection_limit to default pooler limits for free tiers
    if (!connectionUrl.includes('connection_limit=')) {
      const sep = connectionUrl.includes('?') ? '&' : '?';
      connectionUrl = `${connectionUrl}${sep}connection_limit=${CONNECTION_LIMIT}`;
    } else {
      // replace existing connection_limit with CONNECTION_LIMIT
      connectionUrl = connectionUrl.replace(/connection_limit=\d+/, `connection_limit=${CONNECTION_LIMIT}`);
    }
    
    if (!connectionUrl.includes('pool_timeout=')) {
      const sep = connectionUrl.includes('?') ? '&' : '?';
      connectionUrl = `${connectionUrl}${sep}pool_timeout=20`;
    }
  } catch (err) {
    console.error('[Database] Failed to normalise DATABASE_URL string:', err.message);
  }
}

try {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
    // Cap the connection pool to match your database plan's max connections.
    // Free-tier databases (Neon, Supabase free, Railway hobby) allow only 1-5 concurrent connections.
    // Without this cap, Prisma defaults to (cpu_count * 2 + 1) connections and exhausts the pool.
  });
} catch (error) {
  console.error("❌ Failed to initialize Prisma Client:", error.message);
}

export default prisma;

// Actual connection check with timeout to prevent hanging the server on bad connection
const verifyConnection = async () => {
  if (!process.env.DATABASE_URL || !prisma) {
    return false;
  }
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      // Increased to 5s — free-tier DBs can have slow cold starts
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection check timeout')), 5000))
    ]);
    return true;
  } catch (err) {
    console.error("❌ Database connection check failed:", err.message || err);
    return false;
  }
};

// Protect any database query from hanging indefinitely
// Increased to 8s for free-tier DBs that have cold-start delays
export const queryWithTimeout = (promise, timeoutMs = 8000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Database query timeout')), timeoutMs))
  ]);
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
