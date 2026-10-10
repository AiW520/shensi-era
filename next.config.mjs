/** @type {import('next').NextConfig} */
const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isProjectPages = process.env.GITHUB_ACTIONS === "true" && repository && !repository.endsWith(".github.io");
const basePath = isProjectPages ? `/${repository}` : "";

const nextConfig = {
  output: "export",
  experimental: { cpus: 2 },
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  outputFileTracingRoot: process.cwd(),
};
export default nextConfig;
