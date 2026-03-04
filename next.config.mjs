/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: {},
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/media/**" },
    ],
  },
  // Proxy API and media to Django when using single-port (same-origin) mode
  async rewrites() {
    const apiBase = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    return [
      { source: "/api/:path*", destination: `${apiBase}/api/:path*` },
      { source: "/media/:path*", destination: `${apiBase}/media/:path*` },
    ];
  },
};

export default nextConfig;
