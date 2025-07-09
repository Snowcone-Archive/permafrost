/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["@snowflake-software/permafrost-js"],
  webpack: (config, options) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      querystring: "querystring-browser",
    };

    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
