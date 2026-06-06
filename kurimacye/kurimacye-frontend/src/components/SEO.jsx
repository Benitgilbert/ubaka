import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SEO({ title, description, canonical, noindex }) {
  const location = useLocation();

  useEffect(() => {
    // 1. Title
    const baseTitle = "Kuri Macye";
    const newTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} | Premium Multivendor Marketplace`;
    document.title = newTitle;

    // 2. Description
    const defaultDesc = "Kuri Macye is a premium multivendor e-commerce marketplace in Rwanda. Shop a wide range of quality goods, products, and professional services from local sellers.";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description || defaultDesc);

    // 3. Canonical Link
    // Remove any pre-existing canonical link first to avoid duplicates
    const existingCanonicalLinks = document.querySelectorAll('link[rel="canonical"]');
    existingCanonicalLinks.forEach(el => el.remove());

    const canonicalLink = document.createElement("link");
    canonicalLink.setAttribute("rel", "canonical");
    // Ensure we use the proper www. domain for canonical urls
    const path = location.pathname === "/" ? "" : location.pathname;
    const finalCanonical = canonical || `https://www.kurimacye.co.rw${path}`;
    canonicalLink.setAttribute("href", finalCanonical);
    document.head.appendChild(canonicalLink);

    // 4. Robots Meta (noindex)
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      robotsMeta.setAttribute("content", "noindex, nofollow");
    } else {
      if (robotsMeta) {
        robotsMeta.remove();
      }
    }

    // 5. Open Graph & Twitter URL/Title/Description
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", finalCanonical);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title || baseTitle);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", description || defaultDesc);

    let twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute("content", finalCanonical);

    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", title || baseTitle);

    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", description || defaultDesc);

  }, [title, description, canonical, noindex, location.pathname]);

  return null;
}
