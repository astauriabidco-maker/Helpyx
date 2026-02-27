'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AppShell } from '@/components/app-shell';
import { Star, MapPin, Clock, DollarSign, Award, CheckCircle, MessageSquare, Video, ShieldCheck } from 'lucide-react';

export default function ExpertDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const expertId = params.id as string;
    const [loading, setLoading] = useState(true);

    // Simulation de données de l'expert
    const expert = {
        id: expertId,
        profile: {
            firstName: 'Alice',
            lastName: 'Dupont',
            avatar: 'https://i.pravatar.cc/150?u=alice',
            bio: "Expert certifié en infrastructure et serveurs Linux. Je résous vos problèmes de base de données, réseaux et sécurité avec plus de 10 ans d'expérience. Disponible pour des missions d'urgence.",
            location: 'Paris, France',
        },
        expertise: {
            category: 'infrastructure',
            yearsExperience: 10,
            skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'Security']
        },
        stats: {
            averageRating: 4.9,
            totalReviews: 124,
            completedGigs: 89,
            successRate: 0.98
        },
        pricing: {
            hourlyRate: 80,
            minimumGigPrice: 150
        },
        availability: {
            responseTime: 2
        },
        verification: {
            isVerified: true
        }
    };

    useEffect(() => {
        // Simuler le chargement depuis l'API
        setTimeout(() => {
            setLoading(false);
        }, 800);
    }, []);

    const handleStartChat = () => {
        // Redirige vers la future intégration Chat
        alert("Ouverture du Canal de Chat sécurisé...");
    };

    const handleStartAR = () => {
        // Redirige vers la session AR/Vidéo
        router.push(`/ar/session/${expertId}?role=client`);
    };

    if (loading) {
        return (
            <AppShell>
                <div className="flex h-96 items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-5xl mx-auto space-y-6">

                {/* En-tête du profil */}
                <div className="relative h-48 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-800 flex items-end p-6 mb-16">
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6 w-full">
                        <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-900 shadow-xl">
                            <AvatarImage src={expert.profile.avatar} />
                            <AvatarFallback className="text-3xl">AD</AvatarFallback>
                        </Avatar>

                        <div className="pb-4">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {expert.profile.firstName} {expert.profile.lastName}
                                {expert.verification.isVerified && (
                                    <CheckCircle className="w-6 h-6 text-blue-500 bg-white rounded-full" />
                                )}
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {expert.profile.location}</span>
                                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {expert.stats.averageRating} ({expert.stats.totalReviews} avis)</span>
                            </p>
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 flex gap-3">
                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md">
                            Top Expert
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">

                    {/* Colonne Principale (Gauche) */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>À propos de moi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {expert.profile.bio}
                                </p>

                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                                    <h3 className="font-semibold mb-3">Compétences</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {expert.expertise.skills.map((skill, index) => (
                                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques de Réussite</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{expert.stats.completedGigs}</div>
                                        <div className="text-sm text-slate-500">Missions terminées</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{Math.round(expert.stats.successRate * 100)}%</div>
                                        <div className="text-sm text-slate-500">Taux de succès</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{expert.expertise.yearsExperience} ans</div>
                                        <div className="text-sm text-slate-500">D'expérience</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{expert.availability.responseTime}h</div>
                                        <div className="text-sm text-slate-500">Temps de réponse</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Colonne Actions (Droite) */}
                    <div className="space-y-6">
                        <Card className="border-indigo-100 shadow-lg dark:border-indigo-900/50">
                            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 rounded-t-xl border-b border-slate-100 dark:border-slate-800">
                                <CardTitle>Engager l'Expert</CardTitle>
                                <CardDescription>
                                    Contactez cet expert pour un devis ou une assistance en direct.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-600 dark:text-slate-400">Tarif Horaire</span>
                                    <span className="text-xl font-bold flex items-center"><DollarSign className="w-5 h-5" />{expert.pricing.hourlyRate}/h</span>
                                </div>

                                <div className="space-y-3">
                                    <Button onClick={handleStartChat} className="w-full" variant="outline">
                                        <MessageSquare className="w-4 h-4 mr-2" />
                                        Contacter par Message
                                    </Button>

                                    <Button
                                        onClick={handleStartAR}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md relative overflow-hidden group"
                                    >
                                        {/* Effet Brillant (Shine) */}
                                        <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-[-20deg] group-hover:animate-shine" />
                                        <Video className="w-4 h-4 mr-2" />
                                        Session Visio / AR Live
                                    </Button>
                                    <p className="text-xs text-center text-slate-500 mt-2">
                                        Idéal pour le diagnostic sur machine physique avec Réalité Augmentée.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 flex items-center gap-3">
                                <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                <div>
                                    <h4 className="font-semibold text-sm">Paiement Sécurisé</h4>
                                    <p className="text-xs text-slate-500">Les fonds sont bloqués jusqu'à validation de la mission.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AppShell>
    );
}
