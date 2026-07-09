import type { NextConfig } from "next";
import path from "path";

// Standalone output is for the Docker image only. On Vercel it breaks the
// build, so enable it ONLY when DOCKER_BUILD=1 (set in the Dockerfile).
const dockerBuild = process.env.DOCKER_BUILD === "1";

const nextConfig: NextConfig = dockerBuild
  ? {
      output: "standalone",
      outputFileTracingRoot: path.join(__dirname),
    }
  : {};

export default nextConfig;
