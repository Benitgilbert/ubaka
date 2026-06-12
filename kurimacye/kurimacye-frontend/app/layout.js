import "./globals.css";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: null,
  path: "/"
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-cream-100 text-charcoal-800">{children}</body>
    </html>
  );
}
