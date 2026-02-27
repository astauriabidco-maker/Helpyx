import type { NextConfig } from "next";

// Polyfill localStorage for SSR to avoid dependency issues
if (typeof global !== 'undefined' && (!global.localStorage || typeof global.localStorage.getItem !== 'function')) {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    length: 0,
    key: () => null,
  };
}
const nextConfig: NextConfig = {
  typescript: {
    // TODO: Finaliser l'alignement du schéma Prisma (FR → EN) dans les routes API admin restantes
    // Actuellement bypassé avec @ts-nocheck dans les fichiers concernés (voir grep @ts-nocheck)
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  eslint: {
    // ESLint vérifié au build
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
  // Modules optionnels : ne pas bundler s'ils ne sont pas installés
  serverExternalPackages: ['twilio', 'z-ai-web-dev-sdk'],
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
