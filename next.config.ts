import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // O avatar tem um limite de 2 MB; a margem acomoda o multipart/form-data.
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
