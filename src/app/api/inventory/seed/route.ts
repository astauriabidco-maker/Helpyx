import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Create sample inventory data
export async function POST(request: NextRequest) {
  try {
    // Get or create default company
    let company = await db.company.findFirst({
      where: { slug: 'preview-company' }
    });
    
    if (!company) {
      company = await db.company.create({
        data: {
          nom: 'Preview Company',
          slug: 'preview-company',
          emailContact: 'preview@example.com',
          statut: 'active',
          planAbonnement: 'starter'
        }
      });
    }

    // Sample inventory items
    const sampleItems = [
      {
        nom: 'DDR4 RAM 16GB',
        reference: 'RAM-DDR4-16G',
        description: 'Barrette de mémoire RAM DDR4 16GB 3200MHz',
        categorie: 'RAM',
        quantite: 8,
        seuilAlerte: 5,
        coutUnitaire: 65.99,
        fournisseur: 'MemoryTech',
        emplacement: 'Allée A, Étagère 3',
        companyId: company.id
      },
      {
        nom: 'SSD NVMe 500GB',
        reference: 'SSD-NVME-500',
        description: 'Solid State Drive NVMe M.2 500GB',
        categorie: 'SSD',
        quantite: 3,
        seuilAlerte: 5,
        coutUnitaire: 89.99,
        fournisseur: 'StoragePro',
        emplacement: 'Allée B, Étagère 2',
        companyId: company.id
      },
      {
        nom: 'CPU Intel Core i5-12400',
        reference: 'CPU-I5-12400',
        description: 'Processeur Intel Core i5-12400 2.5GHz',
        categorie: 'CPU',
        quantite: 2,
        seuilAlerte: 3,
        coutUnitaire: 189.99,
        fournisseur: 'IntelDirect',
        emplacement: 'Allée C, Étagère 1',
        companyId: company.id
      },
      {
        nom: 'Carte Graphique RTX 3060',
        reference: 'GPU-RTX3060',
        description: 'NVIDIA GeForce RTX 3060 12GB GDDR6',
        categorie: 'GPU',
        quantite: 1,
        seuilAlerte: 2,
        coutUnitaire: 329.99,
        fournisseur: 'GraphicsHouse',
        emplacement: 'Allée D, Étagère 4',
        companyId: company.id
      },
      {
        nom: 'Alimentation 650W 80+ Gold',
        reference: 'PSU-650G',
        description: 'Bloc d\'alimentation 650W 80+ Gold',
        categorie: 'Alimentation',
        quantite: 6,
        seuilAlerte: 4,
        coutUnitaire: 79.99,
        fournisseur: 'PowerSupply Co',
        emplacement: 'Allée E, Étagère 1',
        companyId: company.id
      }
    ];

    // Create inventory items
    const createdItems = [];
    for (const item of sampleItems) {
      const existing = await db.inventory.findFirst({
        where: { 
          reference: item.reference,
          companyId: company.id
        }
      });

      if (!existing) {
        const created = await db.inventory.create({
          data: item
        });
        createdItems.push(created);
      } else {
        createdItems.push(existing);
      }
    }

    return NextResponse.json({
      message: 'Sample inventory data created successfully',
      company: company.nom,
      items: createdItems.length,
      data: createdItems
    });
  } catch (error) {
    console.error('Error seeding inventory data:', error);
    return NextResponse.json(
      { error: 'Error seeding inventory data' },
      { status: 500 }
    );
  }
}