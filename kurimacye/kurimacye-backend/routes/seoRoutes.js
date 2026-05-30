import express from "express";
import prisma from "../prisma.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'kurimacye.co.rw';
    const baseUrl = `${protocol}://${host}`;

    // 1. Fetch products
    const products = await prisma.product.findMany({
      where: {
        visibility: "public",
        approvalStatus: "approved"
      },
      select: {
        slug: true,
        id: true,
        updatedAt: true
      }
    });

    // 2. Fetch categories
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      select: {
        slug: true,
        id: true,
        updatedAt: true
      }
    });

    // 3. Fetch blog posts
    const blogs = await prisma.blog.findMany({
      where: {
        isActive: true
      },
      select: {
        slug: true,
        id: true,
        updatedAt: true
      }
    });

    // 4. Generate XML sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    const staticPages = [
      { path: "", priority: "1.0", changefreq: "daily" },
      { path: "/shop", priority: "0.8", changefreq: "daily" },
      { path: "/print-portal", priority: "0.7", changefreq: "weekly" },
      { path: "/daily-deals", priority: "0.7", changefreq: "daily" },
      { path: "/gift-cards", priority: "0.6", changefreq: "monthly" },
      { path: "/blog", priority: "0.6", changefreq: "weekly" },
      { path: "/about", priority: "0.4", changefreq: "monthly" },
      { path: "/contact", priority: "0.4", changefreq: "monthly" }
    ];

    staticPages.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${p.path}</loc>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic Categories
    categories.forEach(c => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/shop?category=${c.slug || c.id}</loc>\n`;
      xml += `    <lastmod>${c.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic Blogs
    blogs.forEach(b => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${b.slug || b.id}</loc>\n`;
      xml += `    <lastmod>${b.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic Products
    products.forEach(p => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/product/${p.slug || p.id}</loc>\n`;
      xml += `    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
