/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // 静态导出时，API 请求走相对路径（与后端同域部署）
  // 本地开发时通过 npm run dev 的 rewrites 代理到 3001
  trailingSlash: true,
};

module.exports = nextConfig;
