'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface AIDiagnosticProps {
    ticketId?: string;
    [key: string]: any;
}

export function AIDiagnostic({ ticketId, ...props }: AIDiagnosticProps) {
    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Diagnostic IA
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Module de diagnostic IA en cours de développement.
                </p>
            </CardContent>
        </Card>
    );
}
