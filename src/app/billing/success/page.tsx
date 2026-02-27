'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');

    return (
        <Card className="max-w-md w-full border border-slate-200 shadow-lg dark:border-slate-800">
            <CardHeader className="text-center pb-2 bg-green-500 text-white rounded-t-xl" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <div className="bg-white/20 p-3 rounded-full w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                    <CheckCircle2 className="text-white w-8 h-8" />
                </div>
                <CardTitle className="text-2xl font-bold">Félicitations !</CardTitle>
                <CardDescription className="text-green-100">
                    Votre abonnement a bien été pris en compte.
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6 text-center">
                <p className="text-slate-600 dark:text-slate-400">
                    Votre compte est maintenant actif avec les nouvelles fonctionnalités de votre plan.
                    Merci pour votre confiance !
                </p>

                {sessionId && (
                    <p className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded">
                        Session: {sessionId}
                    </p>
                )}

                <Button
                    onClick={() => router.push('/billing')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                    Retourner au tableau de bord
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    );
}

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 dark:bg-slate-950">
            <Suspense fallback={<div>Chargement...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
