const isStaticExport = process.env.STATIC_EXPORT === '1';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages：静态导出到 out/（CI 临时移除 middleware 后构建，见 pages.yml）
  // 服务器部署：生成 .next/standalone 最小部署包（见 deploy.yml）
  ...(isStaticExport
    ? { output: 'export', trailingSlash: true, images: { unoptimized: true } }
    : { output: 'standalone' }),
  basePath,
};
export default nextConfig;
