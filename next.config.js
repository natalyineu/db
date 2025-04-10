/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production'
              // Production CSP with specific hashes for Next.js inline scripts
              ? "default-src 'self'; script-src 'self' 'sha256-LcsuUMiDkprrt6ZKeiLP4iYNhWo8NqaSbAgtoZxVK3s=' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-VlnV2UGoXZwIbD/ntOVk+cxPw49cZwqapQ3qoDvi8iE=' 'sha256-iv9PC+oH/VKmE6xoRe8SMdWF+ZLJPZUmG3PTroM68YA=' 'sha256-YK0s9tMsrQz4Brk4ny+9/JEGIabBl8bK05pz3K3c/vA=' 'sha256-423tk2n/XRTY0474poXMhi7uZGMyCcM2LcV8i7QHoeA=' 'sha256-sRxShxxUnwBm7Yo1og1bS1sWXGCnPbo/Q0qySMu61X4=' 'sha256-E1YFmZDaH3gs+/inmV86OMFDNZZoxIBHiD205JSi1+s=' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.vercel-analytics.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
              // More permissive CSP for development
              : "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.vercel-analytics.com; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Access-Control-Allow-Credentials', 
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_SITE_URL || 'https://your-production-domain.com' 
              : 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
