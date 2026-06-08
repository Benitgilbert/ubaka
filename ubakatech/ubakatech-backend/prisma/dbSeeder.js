import { PrismaClient } from '@prisma/client';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed/Update Employees (Gilbert Benit, Elsa Keza, David Mugisha)
  console.log('Seeding employees/leadership profiles...');
  const employees = [
    {
      name: 'Gilbert Benit',
      email: 'byiringirobenitg@gmail.com', // matching existing auth emails if any
      title: 'Founder & Lead Systems Developer',
      focus: "A developer who believes code should serve people. You'll find him testing databases, talking with local shop owners, or looking for ways to speed up cashier screens.",
      department: 'Engineering',
      location: 'Byumba, Gicumbi District, Rwanda'
    },
    {
      name: 'Elsa Keza',
      email: 'kezaelsa@ubakatech.co.rw',
      title: 'Head of Product Experience & Design',
      focus: 'A designer who spends time in the field. She designs interfaces that anyone can use easily, even under the bright Gicumbi sun on a small smartphone screen.',
      department: 'Product & Design',
      location: 'Kigali, Rwanda'
    },
    {
      name: 'David Mugisha',
      email: 'mugishadavid@ubakatech.co.rw',
      title: 'Principal Backend Systems Architect',
      focus: 'Our backend and server architect. He makes sure your databases stay secure and up, ensuring scans and payments go through instantly.',
      department: 'Engineering',
      location: 'Kigali, Rwanda'
    }
  ];

  for (const emp of employees) {
    // Check if employee exists by email
    const existing = await prisma.employee.findUnique({ where: { email: emp.email } });
    if (existing) {
      await prisma.employee.update({
        where: { id: existing.id },
        data: {
          title: emp.title,
          focus: emp.focus,
          department: emp.department,
          location: emp.location
        }
      });
      console.log(`Updated employee: ${emp.name}`);
    } else {
      // Create with a default dummy password since password is required
      await prisma.employee.create({
        data: {
          ...emp,
          password: '$2a$10$xyzplaceholderhashedpwd' // placeholder
        }
      });
      console.log(`Created employee: ${emp.name}`);
    }
  }

  // 2. Seed Services
  console.log('Seeding capabilities services...');
  const services = [
    {
      title: 'Custom Software Engineering',
      desc: 'We build digital tools that solve your exact business needs. Whether you need a web portal, mobile app, or a secure server database, we write clean, fast code that fits your operations like a custom-made suit.',
      icon: 'Cpu',
      features: ['Custom Web Platforms & Dashboards', 'Fast Mobile Apps (Android/iOS)', 'Secure Database Architecture', 'API Development & Integrations']
    },
    {
      title: 'Thoughtful Product UI/UX Design',
      desc: 'We design screens that make sense to the people using them. We sit down with real users—like market traders and commuters—to design layouts with clean visual patterns, readable fonts, and clear touch targets.',
      icon: 'Smartphone',
      features: ['User Research & Field Usability Testing', 'Interactive Screen Prototypes', 'Fast & Light Layout Renders', 'High-Contrast Mobile Optimization']
    },
    {
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
  console.log('Services seeded successfully.');

  // 3. Seed Pricing Packages
  console.log('Seeding pricing tiers...');
  const pricing = [
    {
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
  console.log('Pricing seeded successfully.');

  // 4. Seed Retainer Packages
  console.log('Seeding retainers...');
  const retainers = [
    {
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
  console.log('Retainers seeded successfully.');

  // 5. Seed FAQs
  console.log('Seeding FAQ list...');
  const faqs = [
    {
      question: 'Do you design MTN Mobile Money and Airtel Money integrations?',
      answer: 'Yes, we integrate local mobile money payment options seamlessly. We understand that in Rwanda, MTN MoMo and Airtel Money are how most people run their daily lives. We make it easy for your customers to check out and for you to track payments instantly.',
      order: 1
    },
    {
      question: 'Is your point-of-sale system RRA EBM v2 tax compliant?',
      answer: 'Absolutely. We handle all the compliance details so you don\'t have to. We connect your platform directly with the Rwanda Revenue Authority (RRA) EBM invoicing system. When an item is sold, it registers with the tax gateway automatically, keeping your business legal and audit-ready.',
      order: 2
    },
    {
      question: 'Can you build offline-first applications for rural areas?',
      answer: 'Yes. Internet connections in upcountry areas like Gicumbi can fluctuate. We build systems that cache data on the user\'s phone or computer. Cashiers can continue registering sales offline, and the system automatically syncs up when the network returns.',
      order: 3
    },
    {
      question: 'What is your typical software development lifecycle timeline?',
      answer: 'Most custom software takes between 4 to 12 weeks from our first conversation to launch. We don\'t hide in a room coding for months—every two weeks, we show you working features to get your feedback and make sure we are building exactly what you envisioned.',
      order: 4
    },
    {
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
  console.log('FAQs seeded successfully.');

  console.log('🌱 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
