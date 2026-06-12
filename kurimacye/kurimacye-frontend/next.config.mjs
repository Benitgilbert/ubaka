/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ik.imagekit.io" }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico|images|static).*)",
        destination: "/index.html"
      }
    ];
  }
};

export default nextConfig;
