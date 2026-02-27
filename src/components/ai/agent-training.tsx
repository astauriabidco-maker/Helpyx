'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

interface AgentTrainingProps {
    [key: string]: any;
}

export function AgentTraining(props: AgentTrainingProps) {
    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Formation Agent IA
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Module de formation IA en cours de développement.
                </p>
            </CardContent>
        </Card>
    );
}
