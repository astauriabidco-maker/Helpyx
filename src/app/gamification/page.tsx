import { Metadata } from 'next';
import GamificationDemo from '@/components/gamification-demo';

export const metadata: Metadata = {
  title: 'Gamification - Plateforme SaaS',
  description: 'Système de gamification pour maximiser l\'engagement des agents',
};

export default function GamificationPage() {
  return <GamificationDemo />;
}