'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function MockCheckout() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planId = searchParams.get('planId');
    const companyId = searchParams.get('companyId');
    const sessionId = searchParams.get('session_id');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!planId || !companyId || !sessionId) {
            alert("Missing parameters for mock checkout.");
        }
    }, [planId, companyId, sessionId]);

    const handlePay = async () => {
        setLoading(true);

        // Simulate network delay
        await new Promise(r => setTimeout(r, 1500));

        try {
            const res = await fetch('/api/billing/mock-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyId, planId, sessionId })
            });

            if (res.ok) {
                setSuccess(true);
                // Redirect back to billing success mock url
                setTimeout(() => {
                    router.push(`/billing/success?session_id=${sessionId}`);
                }, 2000);
            } else {
                alert("Payment simulation failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Error processing mock payment");
        } finally {
            setLoading(false);
        }
    };

    if (!planId || !companyId || !sessionId) {
        return <div className="p-8 text-center text-red-500">Invalid Mock Session</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 dark:bg-slate-950">
            <Card className="max-w-md w-full border border-slate-200 shadow-lg dark:border-slate-800">
                <CardHeader className="text-center pb-2 bg-slate-900 text-white rounded-t-xl" style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                    <div className="bg-white/20 p-3 rounded-full w-14 h-14 mx-auto mb-2 flex items-center justify-center">
                        <CreditCard className="text-white w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Stripe Mock</CardTitle>
                    <CardDescription className="text-slate-300">
                        Ceci est une simulation de paiement
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {success ? (
                        <div className="text-center py-8 space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Paiement Réussi !</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Redirection vers l'application en cours...
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-slate-100 p-4 rounded-lg dark:bg-slate-800">
                                <div className="flex justify-between text-sm mb-2 text-slate-500 dark:text-slate-400">
                                    <span>Plan ID:</span>
                                    <span className="font-mono text-slate-900 dark:text-white truncate w-32 text-right">{planId}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-2 text-slate-500 dark:text-slate-400">
                                    <span>Company ID:</span>
                                    <span className="font-mono text-slate-900 dark:text-white truncate w-32 text-right">{companyId}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold border-t pt-2 mt-2 border-slate-200 dark:border-slate-700">
                                    <span>Montant Total</span>
                                    <span className="text-lg">Simulée</span>
                                </div>
                            </div>

                            <Button
                                onClick={handlePay}
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md text-lg h-12"
                            >
                                {loading ? 'Traitement en cours...' : 'Simuler le Paiement'}
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-slate-900"
                                onClick={() => router.back()}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
