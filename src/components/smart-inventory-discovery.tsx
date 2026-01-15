'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  // Icons
  Radar, 
  Wifi, 
  Usb, 
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Server,
  Printer,
  Router,
  Smartphone,
  HardDrive,
  Mouse,
  Keyboard,
  Headphones,
  Camera,
  Activity,
  Shield,
  Zap,
  Globe,
  Cpu,
  Battery,
  Wrench,
  FileText,
  Eye,
  Settings,
  ChevronRight,
  X
} from 'lucide-react';

interface DiscoveredDevice {
  id: string;
  nom: string;
  ipAddress?: string;
  macAddress?: string;
  manufacturer?: string;
  modele?: string;
  type: string;
  os?: string;
  osVersion?: string;
  cpu?: string;
  ram?: string;
  stockage?: string;
  statut: 'online' | 'offline' | 'connected' | 'disconnected' | 'unknown';
  lastSeen: Date;
  ports?: number[];
  services?: string[];
  batteryLevel?: number;
  serialNumber?: string;
  capacity?: string;
  resolution?: string;
  discoveredAt: Date;
  source: string;
  confidence: number;
  warranty?: any;
  maintenance?: any;
}

interface DiscoveryHistory {
  id: string;
  type: string;
  devicesFound: number;
  duration: number;
  date: Date;
  status: string;
}

export function SmartInventoryDiscovery() {
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const [history, setHistory] = useState<DiscoveryHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [discoveryType, setDiscoveryType] = useState<'network' | 'bluetooth' | 'usb' | 'manual'>('network');
  const [ipRange, setIpRange] = useState('192.168.1.0/24');
  const [filters, setFilters] = useState({
    deviceTypes: [] as string[],
    manufacturers: [] as string[],
    status: [] as string[]
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showDeviceDetails, setShowDeviceDetails] = useState<DiscoveredDevice | null>(null);

  useEffect(() => {
    fetchDiscoveryHistory();
  }, []);

  const fetchDiscoveryHistory = async () => {
    try {
      const response = await fetch('/api/inventory/discover');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    }
  };

  const startDiscovery = async () => {
    setScanning(true);
    setScanProgress(0);
    setLoading(true);

    // Simuler la progression du scan
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const response = await fetch('/api/inventory/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: discoveryType,
          range: discoveryType === 'network' ? ipRange : undefined,
          filters: filters.deviceTypes.length > 0 ? {
            deviceTypes: filters.deviceTypes
          } : undefined
        })
      });

      clearInterval(progressInterval);
      setScanProgress(100);

      if (response.ok) {
        const data = await response.json();
        setDevices(prev => [...prev, ...data.devices]);
        setActiveTab('devices');
        await fetchDiscoveryHistory();
      }
    } catch (error) {
      console.error('Erreur lors de la découverte:', error);
    } finally {
      setTimeout(() => {
        setScanning(false);
        setLoading(false);
        setScanProgress(0);
      }, 500);
    }
  };

  const addDevicesToInventory = async () => {
    if (selectedDevices.length === 0) return;

    try {
      const devicesToAdd = devices.filter(device => selectedDevices.includes(device.id));
      
      // Pour chaque device, créer un article dans l'inventaire
      for (const device of devicesToAdd) {
        await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nom: device.nom,
            reference: device.serialNumber || device.macAddress,
            description: `${device.manufacturer} ${device.modele}`,
            categorie: mapDeviceTypeToCategory(device.type),
            quantite: 1,
            seuilAlerte: 1,
            coutUnitaire: estimateDeviceCost(device),
            fournisseur: device.manufacturer,
            emplacement: device.ipAddress || 'Non spécifié',
            specifications: JSON.stringify({
              ...device,
              discoveredAt: device.discoveredAt,
              source: device.source
            })
          })
        });
      }

      setSelectedDevices([]);
      alert(`${selectedDevices.length} équipement(s) ajouté(s) à l'inventaire avec succès!`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'inventaire:', error);
      alert('Erreur lors de l\'ajout des équipements à l\'inventaire');
    }
  };

  const mapDeviceTypeToCategory = (type: string): string => {
    const mapping: Record<string, string> = {
      'ordinateur': 'Ordinateur',
      'serveur': 'Serveur',
      'imprimante': 'Imprimante',
      'switch': 'Réseau',
      'routeur': 'Réseau',
      'souris': 'Périphérique',
      'clavier': 'Périphérique',
      'casque_audio': 'Périphérique',
      'stockage_usb': 'Stockage',
      'webcam': 'Périphérique',
      'disque_dur': 'Stockage'
    };
    return mapping[type] || 'Autre';
  };

  const estimateDeviceCost = (device: DiscoveredDevice): number => {
    // Estimation basique du coût selon le type et le fabricant
    const baseCosts: Record<string, number> = {
      'ordinateur': 800,
      'serveur': 2500,
      'imprimante': 300,
      'switch': 500,
      'routeur': 150,
      'souris': 50,
      'clavier': 80,
      'casque_audio': 120,
      'stockage_usb': 30,
      'webcam': 70,
      'disque_dur': 100
    };

    const manufacturerMultiplier: Record<string, number> = {
      'Apple Inc.': 1.5,
      'Dell Inc.': 1.1,
      'HPE': 1.3,
      'Cisco Systems': 1.4,
      'HP': 1.0,
      'Logitech': 1.0,
      'Sony': 1.1
    };

    const baseCost = baseCosts[device.type] || 100;
    const multiplier = manufacturerMultiplier[device.manufacturer || ''] || 1.0;
    
    return Math.round(baseCost * multiplier);
  };

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'ordinateur': <Monitor className="w-4 h-4" />,
      'serveur': <Server className="w-4 h-4" />,
      'imprimante': <Printer className="w-4 h-4" />,
      'switch': <Router className="w-4 h-4" />,
      'routeur': <Router className="w-4 h-4" />,
      'souris': <Mouse className="w-4 h-4" />,
      'clavier': <Keyboard className="w-4 h-4" />,
      'casque_audio': <Headphones className="w-4 h-4" />,
      'stockage_usb': <HardDrive className="w-4 h-4" />,
      'webcam': <Camera className="w-4 h-4" />,
      'disque_dur': <HardDrive className="w-4 h-4" />
    };
    return icons[type] || <Monitor className="w-4 h-4" />;
  };

  const getStatusBadge = (device: DiscoveredDevice) => {
    const variants = {
      'online': 'default',
      'connected': 'default',
      'offline': 'secondary',
      'disconnected': 'secondary',
      'unknown': 'outline'
    } as const;

    const labels = {
      'online': 'En ligne',
      'connected': 'Connecté',
      'offline': 'Hors ligne',
      'disconnected': 'Déconnecté',
      'unknown': 'Inconnu'
    };

    return (
      <Badge variant={variants[device.statut]} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          device.statut === 'online' || device.statut === 'connected' 
            ? 'bg-green-500' 
            : device.statut === 'offline' || device.statut === 'disconnected'
            ? 'bg-red-500'
            : 'bg-gray-500'
        }`} />
        {labels[device.statut]}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) {
      return <Badge className="bg-green-100 text-green-800">Élevée</Badge>;
    } else if (confidence >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800">Moyenne</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Basse</Badge>;
    }
  };

  const filteredDevices = devices.filter(device => {
    if (filters.deviceTypes.length > 0 && !filters.deviceTypes.includes(device.type)) {
      return false;
    }
    if (filters.manufacturers.length > 0 && !filters.manufacturers.includes(device.manufacturer || '')) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(device.statut)) {
      return false;
    }
    return true;
  });

  const deviceTypes = [...new Set(devices.map(d => d.type))];
  const manufacturers = [...new Set(devices.map(d => d.manufacturer).filter(Boolean))];
  const statuses = [...new Set(devices.map(d => d.statut))];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Découverte</TabsTrigger>
          <TabsTrigger value="devices">Équipements trouvés</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Tab Découverte */}
        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="w-5 h-5" />
                Découverte automatique d'équipements
              </CardTitle>
              <CardDescription>
                Scannez votre réseau pour découvrir automatiquement les équipements connectés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type de découverte */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all ${
                    discoveryType === 'network' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setDiscoveryType('network')}
                >
                  <CardContent className="p-4 text-center">
                    <Wifi className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">Réseau</h3>
                    <p className="text-sm text-gray-600">Découverte IP/Éthernet</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    discoveryType === 'bluetooth' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setDiscoveryType('bluetooth')}
                >
                  <CardContent className="p-4 text-center">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">Bluetooth</h3>
                    <p className="text-sm text-gray-600">Périphériques sans fil</p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${
                    discoveryType === 'usb' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setDiscoveryType('usb')}
                >
                  <CardContent className="p-4 text-center">
                    <Usb className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold">USB</h3>
                    <p className="text-sm text-gray-600">Périphériques connectés</p>
                  </CardContent>
                </Card>
              </div>

              {/* Configuration du scan */}
              {discoveryType === 'network' && (
                <div>
                  <Label htmlFor="ipRange">Plage d'adresses IP</Label>
                  <Input
                    id="ipRange"
                    value={ipRange}
                    onChange={(e) => setIpRange(e.target.value)}
                    placeholder="192.168.1.0/24"
                    className="mt-1"
                  />
                </div>
              )}

              {/* Filtres */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="mb-4"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres avancés
                </Button>

                {showFilters && (
                  <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label>Types d'équipements</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les types" />
                        </SelectTrigger>
                        <SelectContent>
                          {deviceTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Fabricants</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les fabricants" />
                        </SelectTrigger>
                        <SelectContent>
                          {manufacturers.map(manufacturer => (
                            <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Statut</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton de lancement */}
              <div className="flex gap-4">
                <Button 
                  onClick={startDiscovery} 
                  disabled={scanning}
                  className="flex-1"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Scan en cours...
                    </>
                  ) : (
                    <>
                      <Radar className="w-4 h-4 mr-2" />
                      Lancer la découverte
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuration
                </Button>
              </div>

              {/* Progression du scan */}
              {scanning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression du scan</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <Progress value={scanProgress} className="w-full" />
                  <p className="text-sm text-gray-600">
                    Recherche des équipements {discoveryType === 'network' ? 'réseau' : discoveryType === 'bluetooth' ? 'Bluetooth' : 'USB'}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Équipements trouvés */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Équipements découverts ({filteredDevices.length})
                </span>
                <div className="flex gap-2">
                  {selectedDevices.length > 0 && (
                    <Button onClick={addDevicesToInventory} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter à l'inventaire ({selectedDevices.length})
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDevices.length === 0 ? (
                <div className="text-center py-8">
                  <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Aucun équipement découvert</p>
                  <p className="text-sm text-gray-500">Lancez une découverte pour trouver des équipements</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDevices(filteredDevices.map(d => d.id));
                            } else {
                              setSelectedDevices([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Équipement</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Adresse IP</TableHead>
                      <TableHead>Fabricant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Confiance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedDevices.includes(device.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDevices(prev => [...prev, device.id]);
                              } else {
                                setSelectedDevices(prev => prev.filter(id => id !== device.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(device.type)}
                            <div>
                              <div className="font-medium">{device.nom}</div>
                              {device.modele && (
                                <div className="text-sm text-gray-600">{device.modele}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{device.type}</Badge>
                        </TableCell>
                        <TableCell>{device.ipAddress || '-'}</TableCell>
                        <TableCell>{device.manufacturer || '-'}</TableCell>
                        <TableCell>{getStatusBadge(device)}</TableCell>
                        <TableCell>{getConfidenceBadge(device.confidence)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowDeviceDetails(device)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedDevices(prev => [...prev, device.id])}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Historique */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historique des découvertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Aucune découverte précédente</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Équipements trouvés</TableHead>
                      <TableHead>Durée</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {new Date(item.date).toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.type}</Badge>
                        </TableCell>
                        <TableCell>{item.devicesFound}</TableCell>
                        <TableCell>{item.duration}s</TableCell>
                        <TableCell>
                          <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>
                            {item.status === 'completed' ? 'Terminé' : 'En cours'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Détails équipement */}
      <Dialog open={!!showDeviceDetails} onOpenChange={() => setShowDeviceDetails(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showDeviceDetails && getDeviceIcon(showDeviceDetails.type)}
              Détails de l'équipement
            </DialogTitle>
          </DialogHeader>
          {showDeviceDetails && (
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <p className="font-medium">{showDeviceDetails.nom}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="font-medium">{showDeviceDetails.type}</p>
                </div>
                <div>
                  <Label>Fabricant</Label>
                  <p className="font-medium">{showDeviceDetails.manufacturer || 'Inconnu'}</p>
                </div>
                <div>
                  <Label>Modèle</Label>
                  <p className="font-medium">{showDeviceDetails.modele || 'Inconnu'}</p>
                </div>
              </div>

              {/* Informations réseau */}
              {(showDeviceDetails.ipAddress || showDeviceDetails.macAddress) && (
                <div>
                  <h4 className="font-semibold mb-2">Informations réseau</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {showDeviceDetails.ipAddress && (
                      <div>
                        <Label>Adresse IP</Label>
                        <p className="font-medium">{showDeviceDetails.ipAddress}</p>
                      </div>
                    )}
                    {showDeviceDetails.macAddress && (
                      <div>
                        <Label>Adresse MAC</Label>
                        <p className="font-medium">{showDeviceDetails.macAddress}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informations système */}
              {(showDeviceDetails.os || showDeviceDetails.cpu || showDeviceDetails.ram) && (
                <div>
                  <h4 className="font-semibold mb-2">Informations système</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {showDeviceDetails.os && (
                      <div>
                        <Label>Système d'exploitation</Label>
                        <p className="font-medium">
                          {showDeviceDetails.os} {showDeviceDetails.osVersion}
                        </p>
                      </div>
                    )}
                    {showDeviceDetails.cpu && (
                      <div>
                        <Label>Processeur</Label>
                        <p className="font-medium">{showDeviceDetails.cpu}</p>
                      </div>
                    )}
                    {showDeviceDetails.ram && (
                      <div>
                        <Label>Mémoire RAM</Label>
                        <p className="font-medium">{showDeviceDetails.ram}</p>
                      </div>
                    )}
                    {showDeviceDetails.stockage && (
                      <div>
                        <Label>Stockage</Label>
                        <p className="font-medium">{showDeviceDetails.stockage}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statut et confiance */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Statut actuel</Label>
                  <div className="mt-1">{getStatusBadge(showDeviceDetails)}</div>
                </div>
                <div>
                  <Label>Niveau de confiance</Label>
                  <div className="mt-1">{getConfidenceBadge(showDeviceDetails.confidence)}</div>
                </div>
              </div>

              {/* Informations de maintenance */}
              {showDeviceDetails.maintenance && (
                <div>
                  <h4 className="font-semibold mb-2">Maintenance</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Prochaine maintenance</Label>
                      <p className="font-medium">
                        {new Date(showDeviceDetails.maintenance.nextMaintenance).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <Label>Priorité</Label>
                      <Badge variant={showDeviceDetails.maintenance.priority === 'high' ? 'destructive' : 'default'}>
                        {showDeviceDetails.maintenance.priority === 'high' ? 'Élevée' : 'Moyenne'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    setSelectedDevices(prev => [...prev, showDeviceDetails.id]);
                    setShowDeviceDetails(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter à l'inventaire
                </Button>
                <Button variant="outline">
                  <Wrench className="w-4 h-4 mr-2" />
                  Planifier maintenance
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}