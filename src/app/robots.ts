export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/_next/', '/static/'],
    },
    sitemap: 'https://helpyx.com/sitemap.xml',
  };
}