import fs from 'fs'
import path from 'path'

const envFile = path.resolve(process.cwd(), '.env')
const envVars = fs.readFileSync(envFile, 'utf-8')
for (const line of envVars.split('\n')) {
  const [key, value] = line.split('=')
  if (key && value) process.env[key.trim()] = value.trim()
}

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
    domains: [process.env.NEXT_PUBLIC_S3_BUCKET_DOMAIN],
  },
}

console.log("✅ Loaded domain:", process.env.NEXT_PUBLIC_S3_BUCKET_DOMAIN)

export default nextConfig

