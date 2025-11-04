/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    // SSR modunda export yok; Netlify plugin next/image'ı functions ile çözer
    unoptimized: false,
    remotePatterns: [
      { protocol: "https", hostname: "static.ticimax.cloud" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
