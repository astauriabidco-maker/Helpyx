'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface AutoResponseProps {
    [key: string]: any;
}

export function AutoResponse(props: AutoResponseProps) {
    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Réponses Automatiques
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Module de réponses automatiques en cours de développement.
                </p>
            </CardContent>
        </Card>
    );
}
