/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['react-bootstrap'],
  // Keep canonical Next.js routing behavior for Vercel deployments.
  trailingSlash: false,
  typescript: {
    // Temporary deploy guardrail while legacy TS debt is remediated in tracked slices.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporary: deployment must not be blocked by existing legacy lint debt.
    // Lint still runs in CI and local workflows where remediation is tracked separately.
    ignoreDuringBuilds: true,
  },
  // Disable static optimization for admin pages to prevent SSR issues
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pswnlowvmdgeifhxilao.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle Supabase Realtime dynamic imports to suppress critical dependency warnings
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    });

    // Suppress critical dependency warnings from Supabase Realtime
    config.ignoreWarnings = [
      {
        module: /node_modules\/@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
      {
        module: /node_modules\/ws/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
};

export default nextConfig;
