const isPagesBuild = process.env.NEXT_PUBLIC_STATIC_BASE_PATH === "docs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: isPagesBuild ? "/docs" : undefined,
  assetPrefix: isPagesBuild ? "/docs/" : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
