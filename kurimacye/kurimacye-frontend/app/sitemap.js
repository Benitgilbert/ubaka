import { getSiteUrl, safeFetchApi } from "../lib/api";

export const revalidate = 300;

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const [productsRes, categoriesRes, blogs] = await Promise.all([
    safeFetchApi("/products?limit=200", { revalidate }),
    safeFetchApi("/categories", { revalidate }),
    safeFetchApi("/blogs", { revalidate })
  ]);

  const products = productsRes?.data || [];
  const categories = categoriesRes?.data || [];
  const posts = Array.isArray(blogs) ? blogs : [];

  const staticPages = [
    "",
    "/shop",
    "/blog",
    "/about",
    "/contact",
    "/daily-deals",
    "/gift-cards",
    "/print-portal",
    "/faq",
    "/careers"
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7
  }));

  const productPages = products.map((product) => ({
    url: `${siteUrl}/product/${product.slug || product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "daily",
    priority: 0.8
  }));

  const categoryPages = categories.map((category) => ({
    url: `${siteUrl}/shop?category=${encodeURIComponent(category.slug || category.name || category.id)}`,
    lastModified: category.updatedAt ? new Date(category.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  const blogPages = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug || post.id}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
