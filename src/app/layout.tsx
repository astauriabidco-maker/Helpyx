import { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Helpyx - Plateforme de Support Client avec IA | Multi-tenant SaaS',
  description: 'Transformez votre support client avec Helpyx : IA intégrée, tickets intelligents, analytics avancés et architecture multi-tenant. Essai gratuit 14 jours.',
  keywords: [
    'support client',
    'help desk',
    'tickets',
    'IA',
    'intelligence artificielle',
    'SaaS',
    'multi-tenant',
    'automatisation',
    'analytics',
    'support technique',
    'gestion des tickets',
    'chatbot',
    'self-service',
    'SLA',
    'RGPD'
  ],
  authors: [{ name: 'Helpyx Team' }],
  creator: 'Helpyx',
  publisher: 'Helpyx',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://helpyx.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    title: 'Helpyx - Plateforme de Support Client avec IA',
    description: 'Transformez votre support client avec l\'intelligence artificielle et l\'automatisation. Rejoignez 10 000+ entreprises.',
    siteName: 'Helpyx',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Helpyx - Plateforme de Support Client',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Helpyx - Support Client avec IA',
    description: 'Transformez votre support client avec l\'intelligence artificielle. Essai gratuit 14 jours.',
    images: ['/og-image.jpg'],
    creator: '@helpyx',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased bg-white text-slate-900">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}