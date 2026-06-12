import { getSiteUrl } from "../lib/api";

export default function robots() {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/seller", "/dashboard", "/cart", "/checkout"]
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
