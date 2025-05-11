/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['sublet-match-images.s3.us-east-2.amazonaws.com'],
  },
}

export default nextConfig
