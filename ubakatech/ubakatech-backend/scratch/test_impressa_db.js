import pg from 'pg';
const { Client } = pg;

const connectionString = "postgresql://postgres.xnozaxqyesbyiezdumpo:Famillee%40123@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";

async function checkProducts() {
  const client = new Client({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT p.id, p.name, p.price, p."approvalStatus", p."createdAt"
      FROM "Product" p
      ORDER BY p."createdAt" DESC
      LIMIT 10
    `);
    console.log("=== PRODUCTS ===");
    console.log(JSON.stringify(res.rows, null, 2));

    const pending = await client.query(`
      SELECT count(*) as count from "Product" WHERE "approvalStatus" = 'pending'
    `);
    console.log("Pending approvals count:", pending.rows[0].count);

  } catch (err) {
    console.error("Database query failed:", err.message);
  } finally {
    await client.end();
  }
}

checkProducts();
