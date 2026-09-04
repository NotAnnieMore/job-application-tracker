import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // O avatar tem um limite de 2 MB; a margem acomoda o multipart/form-data.
      bodySizeLimit: "3mb",
    },
  },
};

export default withNextIntl(nextConfig);
