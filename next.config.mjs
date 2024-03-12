/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    return config;
  },
  // basePath: process.env.NODE_ENV === "development" ? undefined : "/bird-id",
};

export default nextConfig;
