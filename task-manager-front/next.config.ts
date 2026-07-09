import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Self-contained server output for Docker.
  output: "standalone",
  // Pin tracing root so server.js lands at .next/standalone/ (multiple lockfiles otherwise mislead it).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
