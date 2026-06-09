import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');

// Static Job Openings list
export const STATIC_JOBS = [
  {
    id: 'role-senior-frontend',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Gicumbi, Rwanda (Byumba / Hybrid)',
    type: 'Full-time',
    description: 'Lead the design and development of our next-generation responsive dashboard interfaces and client web portals using React 19, Vite, and Tailwind CSS v4.',
    requirements: [
      '3+ years of experience with React and modern JavaScript/TypeScript.',
      'Strong eye for visual design and pixel-perfect implementation.',
      'Experience with build configurations (Vite, Rollup) and state management.',
      'Strong communication skills and willingness to mentor junior developers.'
    ],
    benefits: [
      'Competitive salary in RWF/USD.',
      'Work in our office in Byumba with top-tier equipment.',
      'Flexible hours and hybrid work options (3 days office, 2 days remote).',
      'Full health insurance coverage & annual learning stipend.'
    ]
  },
  {
    id: 'role-uiux-designer',
    title: 'UI/UX Product Designer',
    department: 'Product & Design',
    location: 'Gicumbi, Rwanda (Byumba / Remote)',
    type: 'Full-time',
    description: 'Shape the visual language and user flows of civic and merchant tools. Design interfaces that feel human, fast, and accessible to low-bandwidth mobile users.',
    requirements: [
      'Portfolio demonstrating beautiful Web/Mobile product designs.',
      'Proficiency in Figma, vector artwork, and interactive prototyping.',
      'Deep empathy for real-world user workflows (local marketplace vendors, commuters).',
      'Basic understanding of frontend frameworks (React, HTML/CSS) to collaborate with engineers.'
    ],
    benefits: [
      'Flexible work location (fully remote option available).',
      'Figma Professional license and latest MacBook Pro setup.',
      'Health insurance & wellness budget.',
      'Creative workspace with collaborative design sprints.'
    ]
  },
  {
    id: 'role-backend-developer',
    title: 'Backend Systems Engineer',
    department: 'Engineering',
    location: 'Gicumbi, Rwanda (Gisuna / Office)',
    type: 'Full-time',
    description: 'Design robust database schemas, secure API gateways, and manage external integrations (EBM invoicing compliance, Mobile Money checkout triggers).',
    requirements: [
      '3+ years in Node.js, Express, PostgreSQL, and Prisma ORM or equivalent.',
      'Solid understanding of transactional databases, query optimization, and schema design.',
      'Experience with background processing, Redis, and WebSockets.',
      'Familiarity with containerized deployments (Docker) and AWS.'
    ],
    benefits: [
      'Highly competitive compensation.',
      'Workspace in a high-growth environment.',
      'Premium hardware & technical books budget.',
      'Annual team retreat.'
    ]
  },
  {
    id: 'role-qa-automation',
    title: 'QA Automation Specialist',
    department: 'Quality Assurance',
    location: 'Remote',
    type: 'Part-time / Contract',
    description: 'Ensure our systems work flawlessly across 100+ low-end smartphone devices. Write automated browser tests, stress test database operations, and document bug flows.',
    requirements: [
      'Experience writing Cypress, Playwright, or Selenium automation scripts.',
      'Familiarity with API testing tools (Postman, Jest).',
      'Analytical mindset with sharp attention to detail.',
      'Knowledge of CI/CD integration for automated tests.'
    ],
    benefits: [
      'Hourly competitive contract rates.',
      'Flexible remote schedule.',
      'Access to technical software licenses and hardware testing farm.'
    ]
  }
];

// Helper to ensure data directory and file exists
async function getFileRecords(fileName) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const filePath = path.join(DATA_DIR, fileName);
    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(fileData);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // File does not exist yet, write empty array
        await fs.writeFile(filePath, '[]', 'utf-8');
        return [];
      }
      throw err;
    }
  } catch (err) {
    console.error(`[PublicController] Error reading file ${fileName}:`, err.message);
    return [];
  }
}

// Helper to save records
async function saveFileRecords(fileName, records) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const filePath = path.join(DATA_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(records, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[PublicController] Error saving file ${fileName}:`, err.message);
    return false;
  }
}

// Handler to submit a project request (inquiry)
export const createInquiry = async (req, res) => {
  const { name, email, org, serviceType, budget, timeline, description, features } = req.body;

  if (!name || !email || !serviceType || !budget || !timeline || !description) {
    return res.status(400).json({ error: 'Please provide all required fields (name, email, serviceType, budget, timeline, description).' });
  }

  try {
    const inquiries = await getFileRecords('inquiries.json');
    
    const trackingId = `UBK-INQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newInquiry = {
      id: trackingId,
      name,
      email,
      org: org || 'Individual / Startup',
      serviceType,
      budget,
      timeline,
      description,
      features: features || [],
      status: 'received',
      createdAt: new Date().toISOString()
    };

    inquiries.push(newInquiry);
    await saveFileRecords('inquiries.json', inquiries);

    console.log(`[PublicController] New client inquiry created: ${trackingId} from ${email}`);
    
    return res.status(201).json({
      success: true,
      message: 'Your project inquiry was successfully received. We will contact you within 24 hours.',
      inquiry: newInquiry
    });
  } catch (err) {
    console.error('[PublicController] Failed to create inquiry:', err.message);
    return res.status(500).json({ error: 'Failed to save project request. Please try again.' });
  }
};

// Handler to list open job postings
export const getCareers = async (req, res) => {
  return res.json(STATIC_JOBS);
};

// Handler to apply for a job posting
export const applyJob = async (req, res) => {
  const { name, email, roleId, portfolioUrl, resumeUrl, pitch } = req.body;

  if (!name || !email || !roleId || !resumeUrl || !pitch) {
    return res.status(400).json({ error: 'Please fill in all required application fields (name, email, roleId, resumeUrl, pitch).' });
  }

  const roleMatch = STATIC_JOBS.find(j => j.id === roleId);
  if (!roleMatch) {
    return res.status(404).json({ error: 'Selected position does not exist or has been filled.' });
  }

  try {
    const applications = await getFileRecords('applications.json');
    const trackingId = `UBK-APP-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const newApplication = {
      id: trackingId,
      name,
      email,
      roleId,
      roleName: roleMatch.title,
      portfolioUrl: portfolioUrl || '',
      resumeUrl,
      pitch,
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };

    applications.push(newApplication);
    await saveFileRecords('applications.json', applications);

    console.log(`[PublicController] New application received: ${trackingId} for ${roleMatch.title} from ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Your application was received successfully. We will review it and get back to you shortly.',
      application: newApplication
    });
  } catch (err) {
    console.error('[PublicController] Failed to process application:', err.message);
    return res.status(500).json({ error: 'Failed to submit application. Please try again.' });
  }
};

// Handler to get public team members
export const getTeam = async (req, res) => {
  try {
    const team = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        title: true,
        focus: true,
        avatar: true,
        department: true,
        location: true
      }
    });
    return res.json(team);
  } catch (err) {
    console.error('[PublicController] Failed to fetch team members:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve team members.' });
  }
};

// Handler to get capabilities services
export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    return res.json(services);
  } catch (err) {
    console.error('[PublicController] Failed to fetch services:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve services.' });
  }
};

// Handler to get pricing packages
export const getPricing = async (req, res) => {
  try {
    const pricing = await prisma.pricingPackage.findMany();
    return res.json(pricing);
  } catch (err) {
    console.error('[PublicController] Failed to fetch pricing packages:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve pricing packages.' });
  }
};

// Handler to get retainer packages
export const getRetainers = async (req, res) => {
  try {
    const retainers = await prisma.retainerPackage.findMany();
    return res.json(retainers);
  } catch (err) {
    console.error('[PublicController] Failed to fetch retainer packages:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve retainer packages.' });
  }
};

// Handler to get FAQ list
export const getFaqs = async (req, res) => {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: 'asc' }
    });
    return res.json(faqs);
  } catch (err) {
    console.error('[PublicController] Failed to fetch FAQs:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve FAQs.' });
  }
};

// Database connectivity debug handler
export const debugDb = async (req, res) => {
  let host = 'unknown';
  let pathName = 'unknown';
  let user = 'unknown';
  let queryParams = {};
  
  const dbUrl = process.env.DATABASE_URL || 'not set';
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  
  try {
    const lastAt = dbUrl.lastIndexOf('@');
    if (lastAt !== -1) {
      const credentialsPart = dbUrl.substring(0, lastAt);
      const hostPart = dbUrl.substring(lastAt + 1);
      
      const hostUrl = new URL('http://' + hostPart);
      host = hostUrl.host;
      pathName = hostUrl.pathname;
      hostUrl.searchParams.forEach((val, key) => {
        queryParams[key] = val;
      });
      
      const protocolEnd = credentialsPart.indexOf('://') + 3;
      if (protocolEnd > 2) {
        const userPassPart = credentialsPart.substring(protocolEnd);
        const colonIdx = userPassPart.indexOf(':');
        if (colonIdx !== -1) {
          user = userPassPart.substring(0, colonIdx);
        } else {
          user = userPassPart;
        }
      }
    }
  } catch (parseErr) {
    console.error('Failed to parse dbUrl details:', parseErr.message);
  }

  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.service.count();
    
    return res.json({
      success: true,
      message: 'Database check successful',
      maskedUrl,
      dbDetails: { host, pathName, user, queryParams },
      rawQueryResult: result,
      servicesCount: count
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database check failed',
      maskedUrl,
      dbDetails: { host, pathName, user, queryParams },
      error: err.message,
      stack: err.stack,
      env: process.env.NODE_ENV,
      dbLimit: process.env.DB_CONNECTION_LIMIT
    });
  }
};

// Programmatic schema setup and data seeding handler
export const setupDb = async (req, res) => {
  try {
    console.log('[SetupDB] Starting database schema setup...');
    
    // 1. Ensure schema exists
    await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "ubakatech";');
    
    // Create Employee table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ubakatech"."Employee" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "roleId" TEXT,
        "title" TEXT,
        "focus" TEXT,
        "avatar" TEXT,
        "department" TEXT,
        "location" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Employee_email_key" ON "ubakatech"."Employee"("email");');
    
    // Add focus column if missing
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "ubakatech"."Employee" ADD COLUMN IF NOT EXISTS "focus" TEXT;');
    } catch (e) {
      console.log('Employee focus column check/alter skipped');
    }

    // Create Service table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ubakatech"."Service" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "desc" TEXT NOT NULL,
        "icon" TEXT NOT NULL,
        "features" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Service_title_key" ON "ubakatech"."Service"("title");');

    // Create PricingPackage table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ubakatech"."PricingPackage" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "badge" TEXT,
        "popular" BOOLEAN NOT NULL DEFAULT false,
        "features" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PricingPackage_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "PricingPackage_name_key" ON "ubakatech"."PricingPackage"("name");');

    // Create RetainerPackage table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ubakatech"."RetainerPackage" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "price" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "badge" TEXT,
        "popular" BOOLEAN NOT NULL DEFAULT false,
        "icon" TEXT NOT NULL,
        "features" TEXT[],
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RetainerPackage_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "RetainerPackage_name_key" ON "ubakatech"."RetainerPackage"("name");');

    // Create Faq table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ubakatech"."Faq" (
        "id" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Faq_question_key" ON "ubakatech"."Faq"("question");');

    console.log('[SetupDB] DDL executed successfully. Starting seeding...');

    // Seed data
    const employees = [
      {
        id: 'emp-gilbert-benit',
        name: 'Gilbert Benit',
        email: 'byiringirobenitg@gmail.com',
        title: 'Founder & Lead Systems Developer',
        focus: "A developer who believes code should serve people. You'll find him testing databases, talking with local shop owners, or looking for ways to speed up cashier screens.",
        department: 'Engineering',
        location: 'Byumba, Gicumbi District, Rwanda'
      },
      {
        id: 'emp-elsa-keza',
        name: 'Elsa Keza',
        email: 'kezaelsa@ubakatech.co.rw',
        title: 'Head of Product Experience & Design',
        focus: 'A designer who spends time in the field. She designs interfaces that anyone can use easily, even under the bright Gicumbi sun on a small smartphone screen.',
        department: 'Product & Design',
        location: 'Kigali, Rwanda'
      },
      {
        id: 'emp-david-mugisha',
        name: 'David Mugisha',
        email: 'mugishadavid@ubakatech.co.rw',
        title: 'Principal Backend Systems Architect',
        focus: 'Our backend and server architect. He makes sure your databases stay secure and up, ensuring scans and payments go through instantly.',
        department: 'Engineering',
        location: 'Kigali, Rwanda'
      }
    ];

    for (const emp of employees) {
      await prisma.employee.upsert({
        where: { email: emp.email },
        update: {
          title: emp.title,
          focus: emp.focus,
          department: emp.department,
          location: emp.location
        },
        create: {
          ...emp,
          password: '$2a$10$xyzplaceholderhashedpwd'
        }
      });
    }

    const services = [
      {
        id: 'srv-custom-software',
        title: 'Custom Software Engineering',
        desc: 'We build digital tools that solve your exact business needs. Whether you need a web portal, mobile app, or a secure server database, we write clean, fast code that fits your operations like a custom-made suit.',
        icon: 'Cpu',
        features: ['Custom Web Platforms & Dashboards', 'Fast Mobile Apps (Android/iOS)', 'Secure Database Architecture', 'API Development & Integrations']
      },
      {
        id: 'srv-uiux-design',
        title: 'Thoughtful Product UI/UX Design',
        desc: 'We design screens that make sense to the people using them. We sit down with real users—like market traders and commuters—to design layouts with clean visual patterns, readable fonts, and clear touch targets.',
        icon: 'Smartphone',
        features: ['User Research & Field Usability Testing', 'Interactive Screen Prototypes', 'Fast & Light Layout Renders', 'High-Contrast Mobile Optimization']
      },
      {
        id: 'srv-payments-compliance',
        title: 'Local Payments & Compliance',
        desc: 'We bridge the gap between your software and local regulations. We make it simple for you to accept Mobile Money payments and automatically file VAT transactions with the RRA EBM system.',
        icon: 'ShieldCheck',
        features: ['RRA EBM Invoicing Integration', 'MTN MoMo & Airtel Money Checkouts', 'Automated Daily Sales Reconciliation', 'Audit-Ready Balance Sheet PDF Exports']
      }
    ];

    for (const s of services) {
      await prisma.service.upsert({
        where: { title: s.title },
        update: {
          desc: s.desc,
          icon: s.icon,
          features: s.features
        },
        create: s
      });
    }

    const pricing = [
      {
        id: 'prc-starter',
        name: 'Starter MVP Suite',
        price: '2,500,000 Frw',
        description: 'Perfect for validating new business concepts or deploying clean web-based workflows.',
        features: [
          'Tailored UI/UX & Responsive Web Layouts',
          'Secure User Authentications & Audits',
          'Relational Database Setup (PostgreSQL)',
          'Basic Mobile Money Payments Checkout',
          '2 Weeks Post-Launch Deployment Support'
        ],
        badge: 'Popular for Startups',
        popular: false
      },
      {
        id: 'prc-enterprise',
        name: 'Enterprise Commerce Suite',
        price: '6,000,000 Frw',
        description: 'Full-scale commerce and operational software for established local firms.',
        features: [
          'Advanced Multi-vendor Sync & Catalogs',
          'Automated MTN MoMo & Airtel Payments API',
          'RRA EBM v2 Tax Compliance Integration',
          'Audit-Ready PDF Balance Sheet Exports',
          'Dedicated Admin Dashboard & User Management',
          '4 Weeks Post-Launch Deployment Support'
        ],
        badge: 'Best Value for Enterprises',
        popular: true
      },
      {
        id: 'prc-custom',
        name: 'Custom Co-Design & AI Suite',
        price: 'Custom / Contact Us',
        description: 'Specialized systems requiring hardware, heavy computation, or AI algorithms.',
        features: [
          'Offline-First Sync for Rural Terminals',
          'TensorFlow.js / MediaPipe Neural-nets Integration',
          'WebSocket Real-Time Multi-channel Feeds',
          'Custom React Native iOS & Android Apps',
          'Continuous Integration & Deployment Pipeline Setup',
          'Extended Dedicated Support'
        ],
        badge: 'Tailored R&D',
        popular: false
      }
    ];

    for (const p of pricing) {
      await prisma.pricingPackage.upsert({
        where: { name: p.name },
        update: {
          price: p.price,
          description: p.description,
          badge: p.badge,
          popular: p.popular,
          features: p.features
        },
        create: p
      });
    }

    const retainers = [
      {
        id: 'ret-standard',
        name: 'Standard Technical Retainer',
        price: '400,000 Frw/mo',
        description: 'Ensuring your systems run smoothly, securely, and without downtime after launch.',
        features: [
          '24/7 Automated Server Health Monitoring',
          'Encrypted Daily Database Backups',
          'Regular Security & Dependency Patches',
          'Up to 5 Hours of Bug Fixes & Small Updates',
          'Response within 24 Hours Guarantee'
        ],
        icon: 'ShieldCheck',
        badge: 'Basic Support SLA',
        popular: false
      },
      {
        id: 'ret-active',
        name: 'Active Dev & Support Retainer',
        price: '1,200,000 Frw/mo',
        description: 'Continuous improvements and new feature deployments for growing platforms.',
        features: [
          'Everything in the Standard Technical Retainer',
          'Up to 25 Hours of Dedicated Developer Time',
          'Continuous Feature Rollouts & Deployments',
          'Monthly Database Optimization Reviews',
          'Priority Response within 8 Hours'
        ],
        icon: 'Activity',
        badge: 'Best Retainer Value',
        popular: true
      }
    ];

    for (const r of retainers) {
      await prisma.retainerPackage.upsert({
        where: { name: r.name },
        update: {
          price: r.price,
          description: r.description,
          badge: r.badge,
          popular: r.popular,
          icon: r.icon,
          features: r.features
        },
        create: r
      });
    }

    const faqs = [
      {
        id: 'faq-momo',
        question: 'Do you design MTN Mobile Money and Airtel Money integrations?',
        answer: 'Yes, we integrate local mobile money payment options seamlessly. We understand that in Rwanda, MTN MoMo and Airtel Money are how most people run their daily lives. We make it easy for your customers to check out and for you to track payments instantly.',
        order: 1
      },
      {
        id: 'faq-ebm',
        question: 'Is your point-of-sale system RRA EBM v2 tax compliant?',
        answer: 'Absolutely. We handle all the compliance details so you don\'t have to. We connect your platform directly with the Rwanda Revenue Authority (RRA) EBM invoicing system. When an item is sold, it registers with the tax gateway automatically, keeping your business legal and audit-ready.',
        order: 2
      },
      {
        id: 'faq-offline',
        question: 'Can you build offline-first applications for rural areas?',
        answer: 'Yes. Internet connections in upcountry areas like Gicumbi can fluctuate. We build systems that cache data on the user\'s phone or computer. Cashiers can continue registering sales offline, and the system automatically syncs up when the network returns.',
        order: 3
      },
      {
        id: 'faq-timeline',
        question: 'What is your typical software development lifecycle timeline?',
        answer: 'Most custom software takes between 4 to 12 weeks from our first conversation to launch. We don\'t hide in a room coding for months—every two weeks, we show you working features to get your feedback and make sure we are building exactly what you envisioned.',
        order: 4
      },
      {
        id: 'faq-maintenance',
        question: 'Do you offer ongoing technical maintenance after product launch?',
        answer: 'Yes, we stay by your side after launch. We monitor servers to prevent crashes, run secure database backups daily, and provide quick support when you have questions or want to add new updates.',
        order: 5
      }
    ];

    for (const f of faqs) {
      await prisma.faq.upsert({
        where: { question: f.question },
        update: {
          answer: f.answer,
          order: f.order
        },
        create: f
      });
    }

    return res.json({
      success: true,
      message: 'Database tables created and seeded successfully on production!'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Database setup failed',
      error: err.message,
      stack: err.stack
    });
  }
};

