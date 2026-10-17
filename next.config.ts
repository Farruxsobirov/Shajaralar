import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // content/ papkasidagi JSON fayllar serverda ham mavjud bo'lsin
  outputFileTracingIncludes: { "/": ["./content/**/*"] },
  // /admin manzili Decap CMS sahifasini ochadi
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
