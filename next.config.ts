import type { NextConfig } from "next";

if (!process.env.NEXT_TRACE_SPAN_THRESHOLD_MS) {
  process.env.NEXT_TRACE_SPAN_THRESHOLD_MS = `${Number.MAX_SAFE_INTEGER}`;
}

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to succeed even if lint errors are present.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fflsucsqhjjuozmfwpho.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/images/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        port: "",
        pathname: "/vi/**",
      },
    ],
  },
  webpack: (config) => {
    if (process.env.NODE_ENV === "development") {
      config.module.rules.push({
        test: /\.(jsx|tsx)$/,
        exclude: /node_modules/,
        enforce: "pre",
        use: "@dyad-sh/nextjs-webpack-component-tagger",
      });
    }
    return config;
  },
};

export default nextConfig;