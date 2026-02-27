import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Récupérer les données du graphe pour la visualisation VR/AR
    const tickets = await db.ticket.findMany({
      take: 50,
      include: {
        user: true,
        comments: true
      }
    });

    // Transformer les données en nœuds 3D
    const nodes = tickets.map((ticket, index) => {
      const angle = (index / tickets.length) * Math.PI * 2;
      const radius = 5 + Math.random() * 3;

      return {
        id: `ticket-${ticket.id}`,
        type: 'entity',
        position: {
          x: Math.cos(angle) * radius,
          y: (Math.random() - 0.5) * 4,
          z: Math.sin(angle) * radius
        },
        rotation: {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2
        },
        scale: {
          x: 1,
          y: 1,
          z: 1
        },
        color: getTicketColor(ticket.priorite),
        label: (ticket.titre || ticket.description).substring(0, 20) + '...',
        data: {
          ticketId: ticket.id,
          priority: ticket.priorite,
          status: ticket.status,
          createdAt: ticket.createdAt
        },
        connections: [] as string[],
        confidence: 0.8 + Math.random() * 0.2,
        lastUpdate: new Date()
      };
    });

    // Créer des connexions basées sur les similarités
    nodes.forEach((node, i) => {
      const connectionCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < connectionCount; j++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i && !node.connections.includes(nodes[targetIndex].id)) {
          node.connections.push(nodes[targetIndex].id);
        }
      }
    });

    // Ajouter des nœuds de relation et d'insights
    const relationNodes = generateRelationNodes();
    const insightNodes = generateInsightNodes();

    const allNodes = [...nodes, ...relationNodes, ...insightNodes];

    return NextResponse.json({
      nodes: allNodes,
      metadata: {
        totalNodes: allNodes.length,
        ticketNodes: nodes.length,
        relationNodes: relationNodes.length,
        insightNodes: insightNodes.length,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error fetching VR data:', error);

    // Données de démonstration en cas d'erreur
    const demoNodes = generateDemoNodes();

    return NextResponse.json({
      nodes: demoNodes,
      metadata: {
        totalNodes: demoNodes.length,
        ticketNodes: 20,
        relationNodes: 5,
        insightNodes: 3,
        generatedAt: new Date(),
        demo: true
      }
    });
  }
}

function getTicketColor(priority: string): string {
  switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#3b82f6';
  }
}

function generateRelationNodes(): any[] {
  const relations = ['résout', 'est lié à', 'cause', 'symptôme de'];
  const colors = ['#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return relations.map((relation, index) => ({
    id: `relation-${index}`,
    type: 'relation',
    position: {
      x: (Math.random() - 0.5) * 8,
      y: 3 + Math.random() * 2,
      z: (Math.random() - 0.5) * 8
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    scale: {
      x: 0.8,
      y: 0.8,
      z: 0.8
    },
    color: colors[index % colors.length],
    label: relation,
    data: {
      relationType: relation,
      weight: Math.random()
    },
    connections: [],
    confidence: 0.9,
    lastUpdate: new Date()
  }));
}

function generateInsightNodes(): any[] {
  const insights = [
    'Pattern critique détecté',
    'Anomalie de performance',
    'Corrélation inattendue'
  ];

  return insights.map((insight, index) => ({
    id: `insight-${index}`,
    type: 'insight',
    position: {
      x: (Math.random() - 0.5) * 6,
      y: -3 - Math.random() * 2,
      z: (Math.random() - 0.5) * 6
    },
    rotation: {
      x: 0,
      y: Math.random() * Math.PI * 2,
      z: 0
    },
    scale: {
      x: 1.2,
      y: 1.2,
      z: 1.2
    },
    color: '#fbbf24',
    label: insight,
    data: {
      insightType: 'prediction',
      confidence: 0.75 + Math.random() * 0.25
    },
    connections: [],
    confidence: 0.8,
    lastUpdate: new Date()
  }));
}

function generateDemoNodes(): any[] {
  const nodes: any[] = [];
  const nodeTypes = ['entity', 'relation', 'insight', 'cluster'];
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  for (let i = 0; i < 30; i++) {
    const angle = (i / 30) * Math.PI * 2;
    const radius = 3 + Math.random() * 5;

    nodes.push({
      id: `demo-node-${i}`,
      type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
      position: {
        x: Math.cos(angle) * radius,
        y: (Math.random() - 0.5) * 6,
        z: Math.sin(angle) * radius
      },
      rotation: {
        x: Math.random() * Math.PI * 2,
        y: Math.random() * Math.PI * 2,
        z: Math.random() * Math.PI * 2
      },
      scale: {
        x: 0.8 + Math.random() * 0.4,
        y: 0.8 + Math.random() * 0.4,
        z: 0.8 + Math.random() * 0.4
      },
      color: colors[Math.floor(Math.random() * colors.length)],
      label: `Node ${i + 1}`,
      data: {
        confidence: 0.7 + Math.random() * 0.3,
        type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)]
      },
      connections: [],
      confidence: 0.7 + Math.random() * 0.3,
      lastUpdate: new Date()
    });
  }

  // Créer des connexions
  nodes.forEach((node, i) => {
    const connectionCount = Math.floor(Math.random() * 4);
    for (let j = 0; j < connectionCount; j++) {
      const targetIndex = Math.floor(Math.random() * nodes.length);
      if (targetIndex !== i && !node.connections.includes(nodes[targetIndex].id)) {
        node.connections.push(nodes[targetIndex].id);
      }
    }
  });

  return nodes;
}