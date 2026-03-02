import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/residents/:path*",
        destination: "/dashboard/residents/:path*",
        permanent: false,
      },
      {
        source: "/households/:path*",
        destination: "/dashboard/households/:path*",
        permanent: false,
      },
      {
        source: "/clearances/:path*",
        destination: "/dashboard/clearances/:path*",
        permanent: false,
      },
      {
        source: "/blotter/:path*",
        destination: "/dashboard/blotter/:path*",
        permanent: false,
      },
      {
        source: "/announcements/:path*",
        destination: "/dashboard/announcements/:path*",
        permanent: false,
      },
      {
        source: "/analytics/:path*",
        destination: "/dashboard/analytics/:path*",
        permanent: false,
      },
      {
        source: "/reports/:path*",
        destination: "/dashboard/reports/:path*",
        permanent: false,
      },
      {
        source: "/settings/:path*",
        destination: "/dashboard/settings/:path*",
        permanent: false,
      },
      {
        source: "/activity-logs/:path*",
        destination: "/dashboard/activity-logs/:path*",
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
