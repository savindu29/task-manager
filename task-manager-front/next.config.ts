import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Emit a self-contained .next/standalone server (+ minimal node_modules) so
  // the Docker runtime stage can run without installing dependencies.
  output: "standalone",
  // Pin the file-tracing root to this project. Without it, Next walks up to the
  // nearest lockfile and (with lockfiles higher in the tree) nests server.js
  // under the full source path inside .next/standalone, breaking the Docker COPY.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
