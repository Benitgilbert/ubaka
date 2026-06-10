import prisma, { isDbConnected } from '../config/db.js';
import pg from 'pg';
const { Pool } = pg;

let impressaPool = null;

const queryImpressa = async (text, params) => {
  if (!process.env.IMPRESSA_DATABASE_URL) {
    return null;
  }
  if (!impressaPool) {
    impressaPool = new Pool({
      connectionString: process.env.IMPRESSA_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  const client = await impressaPool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
};

// Hardcoded initial list of Ubaka Tech projects
let INITIAL_PROJECTS = [];

// Mock Kuri Macye lists removed for production real-data enforcement

export const PROJECT_HEALTH_STATE = {};
let ioInstance = null;

export const broadcastProjectsUpdate = async () => {
  if (!ioInstance) return;
  let projects = [];
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      projects = await prisma.project.findMany();
    } catch (err) {
      projects = INITIAL_PROJECTS;
    }
  } else {
    projects = INITIAL_PROJECTS;
  }

  const projectsWithMetrics = projects.map(p => {
    const slug = p.slug;
    const state = PROJECT_HEALTH_STATE[slug] || {
      uptime: 'N/A',
      activeUsers: 0,
      apiHealth: 'healthy',
      serverLoad: 'N/A',
      weeklyRevenue: '0 Rwf',
      latency: 'N/A'
    };
    return {
      ...p,
      metrics: {
        uptime: state.uptime,
        activeUsers: state.activeUsers,
        apiHealth: state.apiHealth,
        serverLoad: state.serverLoad,
        weeklyRevenue: state.weeklyRevenue,
        latency: state.latency
      }
    };
  });

  ioInstance.emit('projects_updated', projectsWithMetrics);
};

// Background Health Monitor service
export const startHealthMonitor = (io) => {
  ioInstance = io;
  console.log('[HealthMonitor] Starting Ubaka Tech MIS Health Checking Service...');
  
  const checkHealth = async () => {
    let projects = [];
    const dbActive = await isDbConnected();
    if (dbActive) {
      try {
        projects = await prisma.project.findMany();
      } catch (err) {
        projects = INITIAL_PROJECTS;
      }
    } else {
      projects = INITIAL_PROJECTS;
    }

    for (const p of projects) {
      const slug = p.slug;
      if (!PROJECT_HEALTH_STATE[slug]) {
        PROJECT_HEALTH_STATE[slug] = {
          uptime: 'N/A',
          activeUsers: 0,
          apiHealth: 'healthy',
          serverLoad: 'N/A',
          weeklyRevenue: '0 Rwf',
          latency: 'N/A',
          successCount: 0,
          totalChecks: 0
        };
      }

      const state = PROJECT_HEALTH_STATE[slug];
      const isKuriMacye = slug === 'impressa' || slug.includes('kuri') || (p.liveUrl && p.liveUrl.includes('kurimacye'));

      // If Kuri Macye, fetch real database metrics in real-time
      if (isKuriMacye) {
        try {
          const userCountRows = await queryImpressa('SELECT COUNT(*)::int as count FROM public."User"', []);
          state.activeUsers = userCountRows && userCountRows[0] ? userCountRows[0].count : 0;

          const revenueRows = await queryImpressa(`
            SELECT COALESCE(SUM("grandTotal"), 0)::float as revenue 
            FROM public."Order" 
            WHERE "createdAt" >= NOW() - INTERVAL '7 days' 
            AND "paymentStatus" = 'completed'
          `, []);
          const revenue = revenueRows && revenueRows[0] ? revenueRows[0].revenue : 0;
          state.weeklyRevenue = `${revenue.toLocaleString()} Rwf`;
        } catch (dbErr) {
          console.error('[HealthMonitor] Kuri Macye database query failed:', dbErr.message);
        }
      } else {
        state.activeUsers = 0;
        state.weeklyRevenue = '0 Rwf';
      }

      state.serverLoad = 'N/A'; // No simulation

      if (!p.liveUrl) {
        state.uptime = 'N/A';
        state.latency = 'N/A';
        state.apiHealth = 'healthy';
        continue;
      }

      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(p.liveUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Ubaka-Tech-MIS-Monitor/1.0' }
        });
        
        clearTimeout(timeoutId);
        const latency = Date.now() - startTime;

        if (response.ok) {
          state.successCount++;
          state.apiHealth = 'healthy';
        } else {
          state.apiHealth = 'warning';
        }
        state.totalChecks++;
        state.latency = `${latency}ms`;
        state.uptime = `${((state.successCount / state.totalChecks) * 100).toFixed(2)}%`;
      } catch (err) {
        state.apiHealth = 'inactive';
        state.totalChecks++;
        state.latency = 'Timeout';
        state.uptime = `${((state.successCount / state.totalChecks) * 100).toFixed(2)}%`;
        console.warn(`[HealthMonitor] Project ${slug} ping failed:`, err.message);
      }
    }
    
    // Broadcast the updated metrics via WebSocket
    await broadcastProjectsUpdate();
  };

  checkHealth();
  setInterval(checkHealth, 60000);
};

// Get all projects
export const getProjects = async (req, res) => {
  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const projects = await prisma.project.findMany();
      
      const projectsWithMetrics = projects.map(p => {
        const slug = p.slug;
        const state = PROJECT_HEALTH_STATE[slug] || {
          uptime: 'N/A',
          activeUsers: 0,
          apiHealth: 'healthy',
          serverLoad: 'N/A',
          weeklyRevenue: '0 Rwf',
          latency: 'N/A'
        };
        return {
          ...p,
          metrics: {
            uptime: state.uptime,
            activeUsers: state.activeUsers,
            apiHealth: state.apiHealth,
            serverLoad: state.serverLoad,
            weeklyRevenue: state.weeklyRevenue,
            latency: state.latency
          }
        };
      });
      
      return res.json(projectsWithMetrics);
    } catch (err) {
      console.warn('[ProjectController] Error fetching projects from database, falling back to mock:', err.message);
    }
  }

  const fallbackWithMetrics = INITIAL_PROJECTS.map(p => {
    const slug = p.slug;
    const state = PROJECT_HEALTH_STATE[slug] || p.metrics;
    return {
      ...p,
      metrics: {
        uptime: state.uptime,
        activeUsers: state.activeUsers,
        apiHealth: state.apiHealth,
        serverLoad: state.serverLoad,
        weeklyRevenue: state.weeklyRevenue || p.metrics.weeklyRevenue || '0 Rwf',
        latency: state.latency || 'N/A'
      }
    };
  });
  return res.json(fallbackWithMetrics);
};

// Get single project details & health
export const getProjectBySlug = async (req, res) => {
  const { slug } = req.params;
  const dbActive = await isDbConnected();

  let project;
  if (dbActive) {
    try {
      project = await prisma.project.findUnique({ where: { slug } });
    } catch (err) {
      console.warn('[ProjectController] Error finding project by slug in database:', err.message);
    }
  }

  if (!project) {
    project = INITIAL_PROJECTS.find(p => p.slug === slug);
  }

  if (!project) {
    return res.status(404).json({ error: `Project '${slug}' not found` });
  }

  const state = PROJECT_HEALTH_STATE[slug] || {
    uptime: 'N/A',
    activeUsers: 0,
    apiHealth: 'healthy',
    serverLoad: 'N/A',
    weeklyRevenue: '0 Rwf',
    latency: 'N/A'
  };

  return res.json({
    ...project,
    metrics: {
      uptime: state.uptime,
      activeUsers: state.activeUsers,
      apiHealth: state.apiHealth,
      serverLoad: state.serverLoad,
      weeklyRevenue: state.weeklyRevenue || '0 Rwf',
      latency: state.latency || 'N/A'
    }
  });
};

// KURI MACYE Admin Activities: List products pending approval
export const getPendingImpressaApprovals = async (req, res) => {
  if (!process.env.IMPRESSA_DATABASE_URL) {
    return res.status(500).json({ error: 'Kuri Macye database connection is not configured (IMPRESSA_DATABASE_URL is missing).' });
  }

  try {
    const realProducts = await queryImpressa(`
      SELECT p.id, p.name, p.price, p."approvalStatus" as status, p."createdAt", p.image, 
             COALESCE(u."storeName", u.name) as "sellerName", c.name as category 
      FROM "Product" p
      LEFT JOIN "User" u ON p."sellerId" = u.id
      LEFT JOIN "_ProductToCategory" pc ON p.id = pc."B"
      LEFT JOIN "Category" c ON pc."A" = c.id
      WHERE p."approvalStatus" = 'pending'
      ORDER BY p."createdAt" DESC
    `);
    
    return res.json(realProducts || []);
  } catch (err) {
    console.error("âš ï¸ Failed to fetch pending products from real Kuri Macye DB:", err.message);
    return res.status(500).json({ error: `Failed to fetch pending products: ${err.message}` });
  }
};

// KURI MACYE Admin Activities: Approve/Reject product
export const updateImpressaProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  if (!process.env.IMPRESSA_DATABASE_URL) {
    return res.status(500).json({ error: 'Kuri Macye database connection is not configured (IMPRESSA_DATABASE_URL is missing).' });
  }

  try {
    const visibility = status === 'approved' ? 'public' : 'hidden';
    const approvedBy = req.user?.id || 'ubaka-admin';
    const approvedAt = new Date();

    const result = await queryImpressa(`
      UPDATE "Product" 
      SET "approvalStatus" = $1, "approvalNote" = $2, "approvedBy" = $3, "approvedAt" = $4, "visibility" = $5
      WHERE id = $6
      RETURNING id, name, "approvalStatus"
    `, [status, note || '', approvedBy, approvedAt, visibility, id]);

    if (result && result.length > 0) {
      console.log(`[ProjectController] Real Impressa Product ID ${id} set to ${status}. Note: ${note || 'None'}`);
      return res.json({
        success: true,
        message: `Product successfully ${status} in real Kuri Macye database.`,
        product: result[0]
      });
    } else {
      return res.status(404).json({ error: 'Product not found in real Kuri Macye database.' });
    }
  } catch (err) {
    console.error("âš ï¸ Failed to update product in real Kuri Macye DB:", err.message);
    return res.status(500).json({ error: `Failed to update product in database: ${err.message}` });
  }
};

// KURI MACYE Admin Activities: Get Support Tickets
export const getImpressaTickets = async (req, res) => {
  if (!process.env.IMPRESSA_DATABASE_URL) {
    return res.status(500).json({ error: 'Kuri Macye database connection is not configured (IMPRESSA_DATABASE_URL is missing).' });
  }

  try {
    const realTickets = await queryImpressa(`
      SELECT t.id, t.subject, t.description, t.status, t.priority, t."createdAt", u.email as "userEmail"
      FROM "Ticket" t
      LEFT JOIN "User" u ON t."userId" = u.id
      WHERE t.status != 'resolved' AND t.status != 'closed'
      ORDER BY t."createdAt" DESC
    `);
    
    return res.json(realTickets || []);
  } catch (err) {
    console.error("âš ï¸ Failed to fetch tickets from real Kuri Macye DB:", err.message);
    return res.status(500).json({ error: `Failed to fetch tickets: ${err.message}` });
  }
};

// KURI MACYE Admin Activities: Update Support Ticket (resolve or modify)
export const updateImpressaTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'open', 'in_progress', 'resolved'

  if (!process.env.IMPRESSA_DATABASE_URL) {
    return res.status(500).json({ error: 'Kuri Macye database connection is not configured (IMPRESSA_DATABASE_URL is missing).' });
  }

  try {
    const result = await queryImpressa(`
      UPDATE "Ticket"
      SET status = $1
      WHERE id = $2
      RETURNING id, subject, status
    `, [status, id]);

    if (result && result.length > 0) {
      console.log(`[ProjectController] Real Impressa Ticket ID ${id} status updated to ${status}`);
      return res.json({
        success: true,
        message: `Ticket successfully updated to ${status} in real Kuri Macye database.`,
        ticket: result[0]
      });
    } else {
      return res.status(404).json({ error: 'Ticket not found in real Kuri Macye database.' });
    }
  } catch (err) {
    console.error("âš ï¸ Failed to update ticket in real Kuri Macye DB:", err.message);
    return res.status(500).json({ error: `Failed to update ticket in database: ${err.message}` });
  }
};


// UI showcase metadata mapping for public landing page
const SHOWCASE_METADATA = {
  impressa: {
    tagline: 'Premium Multivendor E-Commerce Marketplace',
    shortDesc: 'Empowering local sellers and micro-businesses through a modern digital marketplace. Connecting vendors to customers across Rwanda.',
    icon: 'Smartphone',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    shadow: 'shadow-purple-500/10',
    stats: [
      { label: 'Active Vendors', value: '1,200+' },
      { label: 'Weekly Transactions', value: '7.4M RWF' },
      { label: 'Rwandan Regions Active', value: '5 Provinces' },
      { label: 'System Uptime', value: '99.98%' }
    ],
    details: {
      mission: 'To empower Rwandan SMEs and local vendors by connecting them to customers through a vibrant digital marketplace. No vendor is left behind.',
      tech: ['React 19', 'Node.js Express', 'Supabase', 'PostgreSQL', 'Prisma ORM'],
      features: [
        'Premium multivendor marketplace connecting local sellers to buyers.',
        'Multi-vendor inventory synchronization and attributes catalog.',
        'Secure credit tracking system ("Abonne tracking") for loyal local customers.',
        'Audit-ready financial report PDF generation.'
      ]
    }
  },
  'gesture-to-speech': {
    tagline: 'Rwandan Sign Language (RSL) Translation System',
    shortDesc: 'Breaking daily communication barriers for deaf students and workers with real-time gesture-to-speech translation.',
    icon: 'Heart',
    gradient: 'from-rose-500 to-orange-500',
    shadow: 'shadow-rose-500/10',
    stats: [
      { label: 'Vocabulary signs', value: '12,000+' },
      { label: 'Translation Latency', value: '120ms' },
      { label: 'Model Accuracy', value: '98.4%' },
      { label: 'Schools Implemented', value: '8 centers' }
    ],
    details: {
      mission: 'Providing digital accessibility tools that enable seamless communication between Deaf signers and non-signing members of the community.',
      tech: ['TensorFlow.js', 'Python FastAPI', 'MediaPipe', 'WebRTC Streamer', 'React'],
      features: [
        'High-speed video frame hand and body pose tracking.',
        'Local dataset mapping Kinyarwanda dialects and RSL idioms.',
        'Voice synthesis engine supporting Kinyarwanda and English audio playback.',
        'Offline capability for school computers with low connectivity.'
      ]
    }
  },
  linker: {
    tagline: 'Smart Commuter Bus Booking Portal',
    shortDesc: 'Removing commuting stress and waiting lines through a digitized real-time booking and scheduling system.',
    icon: 'Globe',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/10',
    stats: [
      { label: 'Daily Tickets Booked', value: '1,850+' },
      { label: 'Active Routes Mapped', value: '18 lines' },
      { label: 'Partner Operators', value: '5 agencies' },
      { label: 'Bus Terminal Sync', value: 'Real-time' }
    ],
    details: {
      mission: 'Transforming public transportation in Kigali and upcountry routes, replacing unorganized queuing with clean, scheduled seat bookings.',
      tech: ['React Native', 'Redis Queue', 'PostgreSQL', 'Socket.io', 'Twilio Gateway'],
      features: [
        'Real-time bus seat selection and live bus location tracker.',
        'Instant mobile ticket generation via SMS & dynamic QR Codes.',
        'Automated route load balancing for fleet managers.',
        'Mobile Money (MoMo) integration for instant payment checkout.'
      ]
    }
  },
  homland: {
    tagline: 'Virtual Real-Estate & Direct Rental Portal',
    shortDesc: 'Helping tenants meet property owners directly, verifying spaces via virtual tours to eliminate broker scams.',
    icon: 'Home',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/10',
    stats: [
      { label: 'Verified Properties', value: '2,400+' },
      { label: 'Active Owners', value: '650+' },
      { label: 'Broker Fee Savings', value: '100%' },
      { label: 'Virtual Tours Loaded', value: '1,500+' }
    ],
    details: {
      mission: 'Creating a highly transparent rental market where university students and families can confidently rent houses, apartments, and offices without broker exploitation.',
      tech: ['Vite React', 'Three.js 3D Viewer', 'Cloudinary', 'Node.js', 'PostgreSQL'],
      features: [
        '180Â° and 360Â° virtual property walk-throughs.',
        'Direct in-app messaging between landlord and prospective tenants.',
        'Standardized digital lease drafting and rent payment tracking.',
        'Direct validation system (Ubaka Tech staff physically inspect listed listings).'
      ]
    }
  }
};

// Expose public showcase projects for unauthenticated landing page
export const getPublicShowcaseProjects = async (req, res) => {
  const dbActive = await isDbConnected();
  let projects = [];

  if (dbActive) {
    try {
      projects = await prisma.project.findMany();
    } catch (err) {
      console.warn('[ProjectController] DB error fetching showcase projects, falling back to mock:', err.message);
      projects = INITIAL_PROJECTS;
    }
  } else {
    projects = INITIAL_PROJECTS;
  }

  // Map and merge with dynamic showcase layout attributes
  const showcaseProjects = projects.map(p => {
    const slug = p.slug;
    const metadata = SHOWCASE_METADATA[slug] || {
      tagline: 'Ubaka Tech Dynamic Ecosystem Portfolio',
      shortDesc: p.description || 'Creating custom technology solutions to improve community workflows and access.',
      icon: 'Layers',
      gradient: 'from-purple-500 to-indigo-500',
      shadow: 'shadow-purple-500/10',
      stats: [
        { label: 'Project Status', value: p.status.toUpperCase() },
        { label: 'Uptime', value: '100%' },
        { label: 'API Status', value: 'Active' },
        { label: 'Server Load', value: 'Normal' }
      ],
      details: {
        mission: p.description || 'Optimizing community operations with next-generation digital applications.',
        tech: ['React', 'Node.js', 'PostgreSQL'],
        features: ['Optimized backend interfaces.', 'Secure role controls and access audits.']
      }
    };

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      status: p.status,
      repositoryUrl: p.repositoryUrl,
      liveUrl: p.liveUrl,
      tagline: metadata.tagline,
      shortDesc: metadata.shortDesc,
      iconName: metadata.icon,
      gradient: metadata.gradient,
      shadow: metadata.shadow,
      stats: metadata.stats,
      details: metadata.details
    };
  });

  return res.json(showcaseProjects);
};

// Generic Kuri Macye 32 admin features database configurations
const FEATURE_CONFIGS = {
  users: {
    table: 'User',
    select: 'id, name, email, role, "createdAt"',
    permission: 'manage_impressa_users'
  },
  sellers: {
    table: 'User',
    select: 'id, name, email, "storeName", "sellerStatus", "rdbVerification", "termsAcceptance", "createdAt"',
    where: "role = 'seller'",
    permission: 'manage_impressa_sellers'
  },
  violations: {
    table: 'Violation',
    select: '*',
    permission: 'manage_impressa_violations'
  },
  seller_reports: {
    table: 'SellerReport',
    select: '*',
    permission: 'view_impressa_seller_reports'
  },
  orders: {
    table: 'Order',
    select: '*',
    permission: 'manage_impressa_orders'
  },
  inquiries: {
    table: 'Order',
    select: '*',
    where: "status = 'quote_requested'",
    permission: 'manage_impressa_inquiries'
  },
  products: {
    table: 'Product',
    select: '*',
    permission: 'manage_impressa_products'
  },
  approvals: {
    table: 'Product',
    select: '*',
    where: "\"approvalStatus\" = 'pending'",
    permission: 'approve_impressa_products'
  },
  shifts: {
    table: 'Shift',
    select: '*',
    permission: 'manage_impressa_shifts'
  },
  categories: {
    table: 'Category',
    select: '*',
    permission: 'manage_impressa_categories'
  },
  attributes: {
    table: 'Attribute',
    select: '*',
    permission: 'manage_impressa_attributes'
  },
  reviews: {
    table: 'Review',
    select: '*',
    permission: 'manage_impressa_reviews'
  },
  tickets: {
    table: 'Ticket',
    select: '*',
    permission: 'manage_impressa_tickets'
  },
  customer_queries: {
    table: 'ChatLog',
    select: '*',
    permission: 'manage_impressa_customer_queries'
  },
  abonnes: {
    table: 'ClientAbonne',
    select: '*',
    permission: 'manage_impressa_abonnes'
  },
  coupons: {
    table: 'Coupon',
    select: '*',
    permission: 'manage_impressa_coupons'
  },
  gift_cards: {
    table: 'GiftCard',
    select: '*',
    permission: 'manage_impressa_gift_cards'
  },
  gift_card_products: {
    table: 'GiftCardProduct',
    select: '*',
    permission: 'manage_impressa_gift_card_products'
  },
  flash_sales: {
    table: 'FlashSale',
    select: '*',
    permission: 'manage_impressa_flash_sales'
  },
  banners: {
    table: 'Banner',
    select: '*',
    permission: 'manage_impressa_banners'
  },
  testimonials: {
    table: 'Testimonial',
    select: '*',
    permission: 'manage_impressa_testimonials'
  },
  blogs: {
    table: 'Blog',
    select: '*',
    permission: 'manage_impressa_blogs'
  },
  brand_partners: {
    table: 'BrandPartner',
    select: '*',
    permission: 'manage_impressa_brand_partners'
  },
  finance: {
    table: 'Transaction',
    select: '*',
    permission: 'manage_impressa_finance'
  },
  commissions: {
    table: 'CommissionSettings',
    select: '*',
    permission: 'manage_impressa_commissions'
  },
  payouts: {
    table: 'Payout',
    select: '*',
    permission: 'manage_impressa_payouts'
  },
  site_settings: {
    table: 'SiteSettings',
    select: '*',
    permission: 'manage_impressa_site_settings'
  },
  subscribers: {
    table: 'Subscriber',
    select: '*',
    permission: 'manage_impressa_subscribers'
  },
  email_templates: {
    table: 'EmailTemplate',
    select: '*',
    permission: 'manage_impressa_email_templates'
  },
  delivery: {
    table: 'ShippingZone',
    select: '*',
    permission: 'manage_impressa_delivery'
  },
  taxes: {
    table: 'TaxRate',
    select: '*',
    permission: 'manage_impressa_taxes'
  },
  reports: {
    table: 'ReportLog',
    select: '*',
    permission: 'manage_impressa_reports'
  },
  settings: {
    table: 'SiteSettings',
    select: '*',
    permission: 'manage_impressa_settings'
  }
};

// Seed mock records for all 32 Impressa features
const mockDataStore = {};

// GET handler
export const handleImpressaDataGet = async (req, res) => {
  const { feature } = req.params;
  const config = FEATURE_CONFIGS[feature];

  if (!config) {
    return res.status(404).json({ error: `Feature '${feature}' not recognized.` });
  }

  if (!req.user.permissions.includes(config.permission)) {
    return res.status(403).json({ error: `Access denied. Insufficient privileges to view ${feature}.` });
  }

  if (process.env.IMPRESSA_DATABASE_URL) {
    try {
      let queryText = `SELECT ${config.select} FROM "${config.table}"`;
      if (config.where) {
        queryText += ` WHERE ${config.where}`;
      }
      
      const tablesWithCreatedAt = ['User', 'Violation', 'SellerReport', 'Order', 'Product', 'Shift', 'Category', 'Attribute', 'Review', 'Ticket', 'ChatLog', 'ClientAbonne', 'Coupon', 'GiftCard', 'GiftCardProduct', 'FlashSale', 'Banner', 'Testimonial', 'Blog', 'BrandPartner', 'Transaction', 'Payout', 'Subscriber', 'ShippingZone', 'TaxRate', 'ReportLog', 'EmailTemplate'];
      if (tablesWithCreatedAt.includes(config.table)) {
        queryText += ` ORDER BY "createdAt" DESC`;
      }
      
      const realData = await queryImpressa(queryText);
      if (realData) {
        return res.json(realData);
      }
    } catch (err) {
      console.error(`âš ï¸ Failed to fetch real Kuri Macye DB data for ${feature}:`, err.message);
    }
  }

  const data = mockDataStore[feature] || [];
  return res.json(data);
};

// CREATE handler
export const handleImpressaDataCreate = async (req, res) => {
  const { feature } = req.params;
  const config = FEATURE_CONFIGS[feature];

  if (!config) {
    return res.status(404).json({ error: `Feature '${feature}' not recognized.` });
  }

  if (!req.user.permissions.includes(config.permission)) {
    return res.status(403).json({ error: `Access denied. Insufficient privileges to modify ${feature}.` });
  }

  const payload = req.body;
  
  if (process.env.IMPRESSA_DATABASE_URL) {
    try {
      const keys = Object.keys(payload).filter(k => k !== 'id');
      const values = Object.values(payload).filter((_, i) => Object.keys(payload)[i] !== 'id');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const quotedKeys = keys.map(k => `"${k}"`).join(', ');
      const queryText = `INSERT INTO "${config.table}" (${quotedKeys}) VALUES (${placeholders}) RETURNING *`;
      
      const result = await queryImpressa(queryText, values);
      if (result && result.length > 0) {
        return res.status(201).json({ success: true, record: result[0] });
      }
    } catch (err) {
      console.error(`âš ï¸ Failed to create real Kuri Macye DB record for ${feature}:`, err.message);
      return res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }

  const newRecord = {
    id: `mock-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString()
  };
  if (!mockDataStore[feature]) mockDataStore[feature] = [];
  mockDataStore[feature].push(newRecord);
  return res.status(201).json({ success: true, record: newRecord });
};

// UPDATE handler
export const handleImpressaDataUpdate = async (req, res) => {
  const { feature, id } = req.params;
  const config = FEATURE_CONFIGS[feature];

  if (!config) {
    return res.status(404).json({ error: `Feature '${feature}' not recognized.` });
  }

  if (!req.user.permissions.includes(config.permission)) {
    return res.status(403).json({ error: `Access denied. Insufficient privileges to modify ${feature}.` });
  }

  const payload = req.body;

  if (process.env.IMPRESSA_DATABASE_URL) {
    try {
      const keys = Object.keys(payload).filter(k => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt');
      const values = keys.map(k => payload[k]);
      const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
      values.push(id);
      const queryText = `UPDATE "${config.table}" SET ${sets} WHERE id = $${values.length} RETURNING *`;
      
      const result = await queryImpressa(queryText, values);
      if (result && result.length > 0) {
        return res.json({ success: true, record: result[0] });
      } else {
        return res.status(404).json({ error: `Record with id ${id} not found.` });
      }
    } catch (err) {
      console.error(`âš ï¸ Failed to update real Kuri Macye DB record for ${feature}:`, err.message);
      return res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }

  if (!mockDataStore[feature]) mockDataStore[feature] = [];
  const idx = mockDataStore[feature].findIndex(r => r.id === id);
  if (idx !== -1) {
    mockDataStore[feature][idx] = {
      ...mockDataStore[feature][idx],
      ...payload
    };
    return res.json({ success: true, record: mockDataStore[feature][idx] });
  } else {
    return res.status(404).json({ error: `Record with id ${id} not found.` });
  }
};

// DELETE handler
export const handleImpressaDataDelete = async (req, res) => {
  const { feature, id } = req.params;
  const config = FEATURE_CONFIGS[feature];

  if (!config) {
    return res.status(404).json({ error: `Feature '${feature}' not recognized.` });
  }

  if (!req.user.permissions.includes(config.permission)) {
    return res.status(403).json({ error: `Access denied. Insufficient privileges to delete ${feature}.` });
  }

  if (process.env.IMPRESSA_DATABASE_URL) {
    try {
      const queryText = `DELETE FROM "${config.table}" WHERE id = $1 RETURNING id`;
      const result = await queryImpressa(queryText, [id]);
      if (result && result.length > 0) {
        return res.json({ success: true, id: result[0].id });
      } else {
        return res.status(404).json({ error: `Record with id ${id} not found.` });
      }
    } catch (err) {
      console.error(`âš ï¸ Failed to delete real Kuri Macye DB record for ${feature}:`, err.message);
      return res.status(500).json({ error: `Database error: ${err.message}` });
    }
  }

  if (!mockDataStore[feature]) mockDataStore[feature] = [];
  const idx = mockDataStore[feature].findIndex(r => r.id === id);
  if (idx !== -1) {
    mockDataStore[feature].splice(idx, 1);
    return res.json({ success: true, id });
  } else {
    return res.status(404).json({ error: `Record with id ${id} not found.` });
  }
};

// Proxy Test Email sending to impressa-backend
export const sendImpressaTestEmail = async (req, res) => {
  const { templateName, recipientEmail } = req.body;
  const impressaUrl = process.env.IMPRESSA_API_URL || 'https://kurimacye-backend.onrender.com';
  
  if (!req.user.permissions.includes('manage_impressa_email_templates')) {
    return res.status(403).json({ error: 'Access denied. Insufficient privileges to test templates.' });
  }

  try {
    const response = await fetch(`${impressaUrl}/api/admin/email-templates/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-ubaka-secret': process.env.JWT_SECRET || 'impressa123'
      },
      body: JSON.stringify({ templateName, recipientEmail })
    });
    
    const data = await response.json();
    if (response.ok) {
      return res.json(data);
    } else {
      return res.status(response.status).json(data);
    }
  } catch (err) {
    console.error('[ProjectController] Error proxying test email:', err.message);
    return res.status(500).json({ error: `Failed to dispatch test email to e-commerce server: ${err.message}` });
  }
};

// Proxy Seller Verification to impressa-backend
export const verifyImpressaSeller = async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body;
  const impressaUrl = process.env.IMPRESSA_API_URL || 'https://kurimacye-backend.onrender.com';
  
  if (!req.user.permissions.includes('manage_impressa_sellers')) {
    return res.status(403).json({ error: 'Access denied. Insufficient privileges to verify sellers.' });
  }

  try {
    const response = await fetch(`${impressaUrl}/api/seller-verification/${id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-ubaka-secret': process.env.JWT_SECRET || 'impressa123'
      },
      body: JSON.stringify({ action, rejectionReason })
    });
    
    const data = await response.json();
    if (response.ok) {
      return res.json(data);
    } else {
      return res.status(response.status).json(data);
    }
  } catch (err) {
    console.error('[ProjectController] Error proxying seller verification:', err.message);
    return res.status(500).json({ error: `Failed to verify seller on e-commerce server: ${err.message}` });
  }
};

// Create a new project
export const createProject = async (req, res) => {
  const { name, description, status, repositoryUrl, liveUrl } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // Check role: sysadmin or cto only
  if (req.user.role !== 'sysadmin' && req.user.role !== 'cto') {
    return res.status(403).json({ error: 'Forbidden: Only administrators and CTOs can manage projects.' });
  }

  const dbActive = await isDbConnected();
  const projectData = {
    name,
    slug,
    description: description || '',
    status: status || 'planning',
    repositoryUrl: repositoryUrl || '',
    liveUrl: liveUrl || ''
  };

  if (dbActive) {
    try {
      // Check existing
      const exists = await prisma.project.findFirst({
        where: { OR: [{ name }, { slug }] }
      });
      if (exists) {
        return res.status(400).json({ error: 'A project with this name or slug already exists.' });
      }

      const newProject = await prisma.project.create({
        data: projectData
      });

      // Initialize health state in memory cache
      PROJECT_HEALTH_STATE[slug] = {
        uptime: 'N/A',
        activeUsers: 0,
        apiHealth: 'healthy',
        serverLoad: 'N/A',
        weeklyRevenue: '0 Rwf',
        latency: 'N/A',
        successCount: 0,
        totalChecks: 0
      };

      if (req.auditLog) req.auditLog({ actor: req.user.name, action: `Registered system "${newProject.name}"`, resource: 'project', resourceId: newProject.id });
      await broadcastProjectsUpdate();
      return res.status(201).json(newProject);
    } catch (err) {
      console.error('[ProjectController] Error creating project in database:', err.message);
      return res.status(500).json({ error: 'Database error creating project' });
    }
  }

  // Fallback Mock Mode
  const exists = INITIAL_PROJECTS.find(p => p.name === name || p.slug === slug);
  if (exists) {
    return res.status(400).json({ error: 'A project with this name or slug already exists.' });
  }

  const mockProject = {
    id: `proj-mock-${Date.now()}`,
    ...projectData,
    metrics: {
      uptime: 'N/A',
      activeUsers: 0,
      apiHealth: 'healthy',
      serverLoad: 'N/A',
      weeklyRevenue: '0 Rwf'
    }
  };

  INITIAL_PROJECTS.push(mockProject);
  
  PROJECT_HEALTH_STATE[slug] = {
    uptime: 'N/A',
    activeUsers: 0,
    apiHealth: 'healthy',
    serverLoad: 'N/A',
    weeklyRevenue: '0 Rwf',
    latency: 'N/A',
    successCount: 0,
    totalChecks: 0
  };

  await broadcastProjectsUpdate();
  return res.status(201).json(mockProject);
};

// Update an existing project
export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, status, repositoryUrl, liveUrl } = req.body;

  if (req.user.role !== 'sysadmin' && req.user.role !== 'cto') {
    return res.status(403).json({ error: 'Forbidden: Only administrators and CTOs can manage projects.' });
  }

  const dbActive = await isDbConnected();

  const updateData = {};
  if (name !== undefined) {
    updateData.name = name;
    updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (repositoryUrl !== undefined) updateData.repositoryUrl = repositoryUrl;
  if (liveUrl !== undefined) updateData.liveUrl = liveUrl;

  if (dbActive) {
    try {
      const exists = await prisma.project.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const updated = await prisma.project.update({
        where: { id },
        data: updateData
      });

      if (req.auditLog) req.auditLog({ actor: req.user.name, action: `Updated system "${updated.name}" → status: ${updated.status}`, resource: 'project', resourceId: id });
      await broadcastProjectsUpdate();
      return res.json(updated);
    } catch (err) {
      console.error('[ProjectController] Error updating project in database:', err.message);
      return res.status(500).json({ error: 'Database error updating project' });
    }
  }

  // Fallback Mock Mode
  const idx = INITIAL_PROJECTS.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Project not found in mock store' });
  }

  const updated = {
    ...INITIAL_PROJECTS[idx],
    ...updateData
  };

  INITIAL_PROJECTS[idx] = updated;
  await broadcastProjectsUpdate();
  return res.json(updated);
};

// Delete a project
export const deleteProject = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'sysadmin' && req.user.role !== 'cto') {
    return res.status(403).json({ error: 'Forbidden: Only administrators and CTOs can manage projects.' });
  }

  const dbActive = await isDbConnected();

  if (dbActive) {
    try {
      const exists = await prisma.project.findUnique({ where: { id } });
      if (!exists) {
        return res.status(404).json({ error: 'Project not found' });
      }

      await prisma.project.delete({ where: { id } });
      if (req.auditLog) req.auditLog({ actor: req.user.name, action: `Deleted system "${exists.name}"`, resource: 'project', resourceId: id });
      await broadcastProjectsUpdate();
      return res.json({ success: true, message: 'Project successfully deleted' });
    } catch (err) {
      console.error('[ProjectController] Error deleting project from database:', err.message);
      return res.status(500).json({ error: 'Database error deleting project' });
    }
  }

  // Fallback Mock Mode
  const idx = INITIAL_PROJECTS.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Project not found in mock store' });
  }

  INITIAL_PROJECTS.splice(idx, 1);
  await broadcastProjectsUpdate();
  return res.json({ success: true, message: 'Project successfully deleted from mock store' });
};



