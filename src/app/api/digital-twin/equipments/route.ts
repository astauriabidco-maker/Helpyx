import { NextRequest, NextResponse } from 'next/server'

// Simuler des données d'équipements avec capteurs IoT
const generateEquipments = () => {
  const equipmentTypes = ['pc', 'server', 'printer', 'network'] as const
  const statuses = ['online', 'offline', 'warning', 'critical'] as const
  const locations = ['Bureau A101', 'Bureau A102', 'Salle Serveurs', 'Open Space', 'Réunion 1']
  const users = ['Jean Dupont', 'Marie Martin', 'Pierre Durand', 'Sophie Lefebvre', 'Admin IT']
  
  const equipments = []
  
  for (let i = 1; i <= 8; i++) {
    const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)]
    const status = Math.random() > 0.8 ? 
      (Math.random() > 0.5 ? 'warning' : 'critical') : 
      (Math.random() > 0.1 ? 'online' : 'offline')
    
    const temperature = Math.floor(Math.random() * 30) + 50 // 50-80°C
    const usage = Math.floor(Math.random() * 60) + 20 // 20-80%
    const performance = Math.floor(Math.random() * 40) + 60 // 60-100%
    const health = status === 'critical' ? Math.floor(Math.random() * 30) + 10 :
                   status === 'warning' ? Math.floor(Math.random() * 30) + 40 :
                   Math.floor(Math.random() * 30) + 70
    
    const failureProbability = status === 'critical' ? Math.floor(Math.random() * 30) + 70 :
                              status === 'warning' ? Math.floor(Math.random() * 30) + 40 :
                              Math.floor(Math.random() * 20) + 5
    
    const issues = []
    if (temperature > 70) issues.push('Température élevée détectée')
    if (usage > 80) issues.push('Utilisation CPU anormale')
    if (health < 50) issues.push('Composants usés détectés')
    if (performance < 70) issues.push('Performance dégradée')
    if (issues.length === 0) issues.push('Fonctionnement normal')
    
    equipments.push({
      id: `EQ-${String(i).padStart(3, '0')}`,
      name: `${type.toUpperCase()}-${String(i).padStart(3, '0')}`,
      type,
      status,
      temperature,
      usage,
      performance,
      health,
      lastUpdate: new Date().toLocaleString('fr-FR'),
      location: locations[Math.floor(Math.random() * locations.length)],
      user: type === 'server' ? 'Admin IT' : users[Math.floor(Math.random() * users.length)],
      predictions: {
        failure: failureProbability,
        timeframe: `${Math.floor(Math.random() * 60) + 1} jours`,
        issues
      },
      specs: {
        cpu: type === 'server' ? 'Intel Xeon E5-2690' : 
             type === 'pc' ? 'Intel Core i7-12700K' :
             'ARM Cortex-A53',
        ram: type === 'server' ? '64 GB DDR4' : 
             type === 'pc' ? '16 GB DDR4' :
             '4 GB LPDDR4',
        storage: type === 'server' ? '2 TB SSD RAID' : 
                 type === 'pc' ? '1 TB NVMe SSD' :
                 '256 GB SSD',
        os: type === 'server' ? 'Windows Server 2022' : 
            type === 'pc' ? 'Windows 11 Pro' :
            'Linux Embedded'
      }
    })
  }
  
  return equipments
}

export async function GET(request: NextRequest) {
  try {
    const equipments = generateEquipments()
    
    return NextResponse.json(equipments)
  } catch (error) {
    console.error('Error fetching equipments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch equipments' },
      { status: 500 }
    )
  }
}