'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Star, Users, Shield, Zap, Brain, Sparkles,
  Monitor, Trophy, Store, GitPullRequest, BarChart3, Plug, Play, Menu, X,
  Globe, Cpu, Lock, ChevronRight, TrendingUp, MessageSquare, Headphones
} from 'lucide-react';

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) setStarted(true);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const modules = [
    { icon: Brain, title: 'IA Comportementale', desc: 'Détecte la frustration client en temps réel et adapte automatiquement le ton et la priorité.', color: 'from-purple-500 to-pink-500' },
    { icon: Monitor, title: 'Digital Twin 3D', desc: 'Visualisez votre infrastructure IT en 3D. Les pannes clignotent, les métriques sont vivantes.', color: 'from-cyan-500 to-blue-500' },
    { icon: Store, title: 'Marketplace d\'Experts', desc: 'Trouvez un spécialiste certifié et lancez une session Visio AR en un clic.', color: 'from-orange-500 to-red-500' },
    { icon: Trophy, title: 'Gamification', desc: 'XP, badges, leaderboard. Le support devient un jeu pour les techniciens.', color: 'from-amber-500 to-yellow-500' },
    { icon: Zap, title: 'Workflows No-Code', desc: 'Automatisez l\'escalade et les alertes avec un builder visuel Drag & Drop.', color: 'from-emerald-500 to-teal-500' },
    { icon: GitPullRequest, title: 'Change Management', desc: 'Processus CAB complet avec chaîne d\'approbation et plans de rollback.', color: 'from-indigo-500 to-violet-500' },
    { icon: BarChart3, title: 'Reporting IA', desc: 'Posez vos questions en français, l\'IA génère les graphiques et insights.', color: 'from-sky-500 to-cyan-500' },
    { icon: Plug, title: 'Hub d\'Intégrations', desc: 'Slack, Jira, Datadog, Azure AD... Connectez votre écosystème en 2 clics.', color: 'from-rose-500 to-pink-500' },
  ];

  const plans = [
    {
      name: 'Starter', price: '49', features: [
        '10 utilisateurs', '100 tickets/mois', 'Ticketing IA de base', 'Dashboard Analytics', 'Support email',
      ],
    },
    {
      name: 'Professional', price: '299', popular: true, features: [
        '50 utilisateurs', 'Tickets illimités', 'IA Comportementale', 'Digital Twin 3D', 'Gamification',
        'Knowledge Graph', 'Marketplace d\'Experts', 'Support prioritaire',
      ],
    },
    {
      name: 'Enterprise', price: 'Sur Mesure', features: [
        'Utilisateurs illimités', 'Toutes les fonctionnalités', 'Workflows No-Code', 'Change Management ITIL',
        'Reporting IA', 'Hub d\'Intégrations', 'SLA 99.99%', 'Account Manager dédié',
      ],
    },
  ];

  const testimonials = [
    { name: 'Marie Laurent', role: 'CTO, TechCorp', quote: 'Le Digital Twin 3D a révolutionné notre monitoring. On voit les pannes avant qu\'elles n\'arrivent.', avatar: 'ML' },
    { name: 'Thomas Dubois', role: 'DSI, Groupe Nexia', quote: 'La Gamification a réduit notre turnover d\'agents de 40%. Le support n\'est plus une corvée.', avatar: 'TD' },
    { name: 'Sophie Martin', role: 'VP Support, CloudFirst', quote: 'Le Reporting IA me génère mes présentations au COMEX en 30 secondes. Incroyable.', avatar: 'SM' },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      {/* Ambient gradient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#030712]/80 backdrop-blur-xl border-b border-white/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <span className="text-white font-black text-lg">H</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Helpyx</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#modules" className="text-sm text-slate-400 hover:text-white transition-colors">Modules</a>
              <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Tarifs</a>
              <a href="#testimonials" className="text-sm text-slate-400 hover:text-white transition-colors">Témoignages</a>
              <div className="flex items-center gap-3 ml-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">Connexion</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-5">
                    Essai Gratuit <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-[#030712]/95 backdrop-blur-xl border-b border-white/5 px-6 pb-6 space-y-3">
            <a href="#modules" className="block py-2 text-slate-300">Modules</a>
            <a href="#pricing" className="block py-2 text-slate-300">Tarifs</a>
            <a href="#testimonials" className="block py-2 text-slate-300">Témoignages</a>
            <Link href="/auth/signin"><Button variant="outline" className="w-full border-slate-700">Connexion</Button></Link>
            <Link href="/auth/register"><Button className="w-full bg-white text-slate-900">Essai Gratuit</Button></Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Badge className="mb-8 bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/15 px-4 py-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 mr-2" /> Plateforme de Support IT Nouvelle Génération
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-8">
            Le centre de
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              commandement
            </span>
            <br />
            de votre IT
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Helpyx fusionne <span className="text-white font-medium">IA, monitoring 3D, et gamification</span> dans une interface unique.
            Divisez par deux votre temps de résolution tout en motivant vos équipes.
          </p>

          <form onSubmit={(e) => { e.preventDefault(); if (email) window.location.href = `/auth/register?email=${encodeURIComponent(email)}`; }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-6">
            <Input type="email" placeholder="Votre email professionnel" value={email} onChange={(e) => setEmail(e.target.value)}
              className="h-13 bg-white/5 border-white/10 text-white placeholder:text-slate-500 text-base focus:border-indigo-500/50 focus:ring-indigo-500/20" required />
            <Button type="submit" className="h-13 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-semibold text-base whitespace-nowrap shadow-lg shadow-indigo-500/25">
              Démarrer gratuitement <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-xs text-slate-500 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> 14 jours gratuits</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Aucune carte requise</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Setup en 2 minutes</span>
          </p>
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 py-16 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 10000, suffix: '+', label: 'Entreprises actives' },
            { value: 91, suffix: 'K', label: 'Lignes de code' },
            { value: 59, suffix: '', label: 'Modèles de données' },
            { value: 324, suffix: '%', label: 'ROI moyen' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-white mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Grid */}
      <section id="modules" className="relative z-10 py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-white/5 text-slate-300 border-white/10">8 Modules Intégrés</Badge>
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Tout ce dont votre IT a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">besoin</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Une seule plateforme remplace Zendesk + Datadog + TeamViewer + Jira. Zéro fragmentation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((mod, i) => (
              <Card key={i} className="bg-white/[0.03] border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all duration-500 group cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <mod.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{mod.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{mod.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase - Alternating */}
      <section className="relative z-10 py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-32">
          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <Badge className="mb-4 bg-purple-500/10 text-purple-300 border-purple-500/20">Digital Twin 3D</Badge>
              <h3 className="text-3xl lg:text-4xl font-black mb-4">Votre datacenter en <span className="text-purple-400">hologramme</span></h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Chaque serveur, switch et routeur devient un nœud interactif dans un graphe 3D temps réel.
                Un CPU qui surchauffe ? Il clignote en rouge. Un clic suffit pour ouvrir un ticket ou lancer un reboot.
              </p>
              <div className="space-y-3">
                {['Topologie 3D interactive', 'Métriques CPU/RAM en direct', 'Alertes visuelles sur les nœuds', 'Actions rapides (Reboot, SSH, Incident)'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 h-72 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/10 flex items-center justify-center">
              <Monitor className="w-24 h-24 text-purple-500/30" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
            <div className="lg:w-1/2">
              <Badge className="mb-4 bg-amber-500/10 text-amber-300 border-amber-500/20">Gamification</Badge>
              <h3 className="text-3xl lg:text-4xl font-black mb-4">Le support devient un <span className="text-amber-400">jeu</span></h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Chaque ticket résolu rapporte de l'XP. Chaque article KB rédigé débloque un badge.
                Le leaderboard crée une émulation saine. Résultat : -40% de turnover, +60% d'engagement.
              </p>
              <div className="space-y-3">
                {['Système d\'XP et niveaux', 'Badges et achievements', 'Leaderboard temps réel', 'Récompenses personnalisées'].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 h-72 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/10 flex items-center justify-center">
              <Trophy className="w-24 h-24 text-amber-500/30" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Des tarifs <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">transparents</span>
            </h2>
            <p className="text-lg text-slate-400">Essai gratuit 14 jours sur tous les plans. ROI moyen de 324%.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <Card key={i} className={`relative bg-white/[0.03] border-white/5 hover:border-white/15 transition-all duration-500 ${plan.popular ? 'border-indigo-500/50 ring-1 ring-indigo-500/20 scale-[1.02]' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-indigo-500 text-white font-semibold px-4">Le plus populaire</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="mb-6">
                    {plan.price === 'Sur Mesure' ? (
                      <span className="text-3xl font-black text-white">Sur Mesure</span>
                    ) : (
                      <><span className="text-5xl font-black text-white">{plan.price}€</span><span className="text-slate-500 ml-1">/mois</span></>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.price === 'Sur Mesure' ? '#contact' : '/auth/register'}>
                    <Button className={`w-full h-12 font-semibold ${plan.popular ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                      {plan.price === 'Sur Mesure' ? 'Contacter les ventes' : 'Commencer l\'essai'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">
              Ils nous font <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">confiance</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="bg-white/[0.03] border-white/5">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-300 mb-6 leading-relaxed italic">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-12 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black mb-6">
                Prêt à transformer<br />votre support IT ?
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Rejoignez les 10 000+ entreprises qui utilisent Helpyx. Essai gratuit, sans engagement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 font-bold text-base shadow-xl">
                    Démarrer l'essai gratuit <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" className="h-14 px-10 border-white/20 text-white hover:bg-white/5 font-bold text-base">
                    <Play className="w-5 h-5 mr-2" /> Voir la démo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-black text-lg">H</span>
                </div>
                <span className="text-xl font-bold">Helpyx</span>
              </div>
              <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                La plateforme de Support IT augmenté qui fusionne IA, monitoring 3D et gamification.
              </p>
            </div>
            {[
              { title: 'Produit', links: [['Fonctionnalités', '#modules'], ['Tarifs', '#pricing'], ['Digital Twin', '/digital-twin'], ['Marketplace', '/marketplace']] },
              { title: 'Entreprise', links: [['Témoignages', '#testimonials'], ['Documentation', '#'], ['Blog', '#'], ['Carrières', '#']] },
              { title: 'Support', links: [['API REST v2', '#'], ['Status', '#'], ['RGPD', '/privacy'], ['Contact', '#']] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-white text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(([label, href]) => (
                    <li key={label}><a href={href} className="text-sm text-slate-500 hover:text-white transition-colors">{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600">© 2026 Helpyx. Tous droits réservés.</p>
            <div className="flex gap-6 text-xs text-slate-600">
              <a href="/privacy" className="hover:text-white">Confidentialité</a>
              <a href="/legal" className="hover:text-white">Mentions Légales</a>
              <a href="#" className="hover:text-white">CGU</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}