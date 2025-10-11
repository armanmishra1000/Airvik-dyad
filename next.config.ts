import type { NextConfig } from "next";

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
  async redirects() {
    return [
      { source: "/dashboard", destination: "/admin/dashboard", permanent: false },
      { source: "/reservations", destination: "/admin/reservations", permanent: false },
      { source: "/reservations/:id", destination: "/admin/reservations/:id", permanent: false },
      { source: "/calendar", destination: "/admin/calendar", permanent: false },
      { source: "/housekeeping", destination: "/admin/housekeeping", permanent: false },
      { source: "/guests", destination: "/admin/guests", permanent: false },
      { source: "/guests/:id", destination: "/admin/guests/:id", permanent: false },
      { source: "/room-categories", destination: "/admin/room-categories", permanent: false },
      { source: "/room-types", destination: "/admin/room-types", permanent: false },
      { source: "/rooms", destination: "/admin/rooms", permanent: false },
      { source: "/rates", destination: "/admin/rates", permanent: false },
      { source: "/reports", destination: "/admin/reports", permanent: false },
      { source: "/settings", destination: "/admin/settings", permanent: false },
    ];
  },
};

export default nextConfig;