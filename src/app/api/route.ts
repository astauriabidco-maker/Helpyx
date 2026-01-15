import { NextResponse } from 'next/server';

export function GET() {
  return NextResponse.json({
    name: 'Helpyx API',
    version: '1.0.0',
    description: 'API pour la plateforme de support client Helpyx',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
      },
      tickets: {
        list: '/api/tickets',
        create: '/api/tickets',
        update: '/api/tickets/[id]',
        delete: '/api/tickets/[id]',
        comments: '/api/tickets/[id]/comments',
      },
      billing: {
        plans: '/api/billing/plans',
        subscriptions: '/api/billing/subscriptions',
        checkout: '/api/billing/payments/checkout',
        portal: '/api/billing/portal',
        webhooks: '/api/billing/webhooks',
      },
      users: {
        profile: '/api/users/profile',
        settings: '/api/users/settings',
      },
      analytics: {
        dashboard: '/api/analytics/dashboard',
        reports: '/api/analytics/reports',
        metrics: '/api/analytics/metrics',
      },
    },
    documentation: '/api/docs',
    status: '/api/health',
    support: 'support@helpyx.com',
  });
}