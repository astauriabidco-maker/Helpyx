import type { NextConfig } from "next";

// Polyfill localStorage for SSR to avoid dependency issues
if (typeof global !== 'undefined' && (!global.localStorage || typeof global.localStorage.getItem !== 'function')) {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };
}
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuration pour éviter les problèmes WebSocket
  experimental: {
    // Désactiver les fonctionnalités expérimentales qui causent des problèmes
  },
  // Configuration pour le développement local
  async rewrites() {
    return [];
  },
  // S'assurer que le HMR fonctionne correctement
  webpack: (config, { dev }) => {
    if (dev) {
      // Configuration pour le développement
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
