/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [process.env.NEXT_PUBLIC_S3_BUCKET_DOMAIN || 'build-and-test'],
  },
}
export default nextConfig
