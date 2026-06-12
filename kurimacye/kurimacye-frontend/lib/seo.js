import { getSiteUrl } from "./api";

const SITE_NAME = "Kuri Macye";
const DEFAULT_DESCRIPTION =
  "Kuri Macye is a premium multivendor marketplace in Rwanda. Discover quality products and services from verified local sellers.";

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = "/images/logo.png",
  noIndex = false
}) {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${path === "/" ? "" : path}`;
  const normalizedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return {
    title: normalizedTitle,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      title: normalizedTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: image }]
    },
    twitter: {
      card: "summary_large_image",
      title: normalizedTitle,
      description,
      images: [image]
    }
  };
}
