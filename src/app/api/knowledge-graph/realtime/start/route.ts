import { NextRequest, NextResponse } from 'next/server';

let processingInterval: NodeJS.Timeout | null = null;
let isProcessing = false;

export async function POST(request: NextRequest) {
  try {
    const { batchSize, interval, sources } = await request.json();

    if (isProcessing) {
      return NextResponse.json({ message: 'Processing already running' }, { status: 400 });
    }

    isProcessing = true;

    // Démarrer le traitement en temps réel
    processingInterval = setInterval(async () => {
      try {
        // Simuler le traitement de données
        console.log(`Processing batch of ${batchSize} items from ${sources.join(', ')}`);
        
        // Ici, vous ajouteriez la logique réelle de traitement:
        // 1. Récupérer les nouvelles données des sources
        // 2. Traiter avec NLP
        // 3. Mettre à jour le graphe de connaissances
        // 4. Générer des insights
        
        // Simulation pour la démo
        await simulateDataProcessing(batchSize, sources);
        
      } catch (error) {
        console.error('Error in real-time processing:', error);
      }
    }, interval);

    return NextResponse.json({ 
      message: 'Real-time processing started',
      batchSize,
      interval,
      sources
    });
  } catch (error) {
    console.error('Error starting real-time processing:', error);
    return NextResponse.json(
      { error: 'Failed to start processing' },
      { status: 500 }
    );
  }
}

async function simulateDataProcessing(batchSize: number, sources: string[]) {
  // Simuler le traitement de données
  const processingTime = Math.random() * 1000 + 500; // 500-1500ms
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  console.log(`Processed ${batchSize} items from ${sources.join(', ')} in ${processingTime.toFixed(0)}ms`);
}

// Fonction pour arrêter le traitement (exportée pour l'API stop)
export function stopProcessing() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
  }
  isProcessing = false;
  console.log('Real-time processing stopped');
}