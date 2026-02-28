'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import {
  Package, Plus, Search, Edit, Trash2, RefreshCw,
  Loader2, AlertTriangle, TrendingUp, ShoppingCart,
  Monitor, Cpu, HardDrive, Battery, Stethoscope,
  ChevronDown, ChevronUp, Eye, Tag, MapPin, Hash,
  ShieldCheck, Shield, ShieldAlert, ShieldX,
  Laptop, Server, Printer, Filter, X, RotateCcw
} from 'lucide-react';

// =============================================================
// Types
// =============================================================

interface InventoryItem {
  id: string;
  nom: string;
  reference?: string;
  description?: string;
  categorie?: string;
  quantite: number;
  seuilAlerte: number;
  coutUnitaire?: number;
  prixVente?: number;
  fournisseur?: string;
  emplacement?: string;
  statut: string;
  // Reconditionné
  grade?: string;
  marque?: string;
  modele?: string;
  processeur?: string;
  ram?: string;
  stockage?: string;
  ecran?: string;
  systemeOs?: string;
  cosmetique?: string;
  batteryCycles?: number;
  batteryHealth?: number;
  dureeGarantie?: number;
  dateTestQualite?: string;
  testeePar?: string;
  notesTest?: string;
  // Relations
  ticketItems: any[];
  restockOrders: any[];
}

// =============================================================
// Constants
// =============================================================

const CATEGORIES_PIECES = [
  'RAM', 'CPU', 'GPU', 'SSD', 'HDD',
  'Carte Mère', 'Alimentation', 'Refroidissement',
  'Câble', 'Écran', 'Clavier', 'Souris',
  'Imprimante', 'Réseau', 'Batterie', 'Autre'
];

const CATEGORIES_MACHINES = [
  'PC Portable', 'PC Bureau', 'Serveur',
  'Mini PC', 'Workstation', 'All-in-One', 'Tablette'
];

const GRADES = [
  { value: 'A', label: 'Grade A', desc: 'Comme neuf — aucune trace visible', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  { value: 'B', label: 'Grade B', desc: 'Micro-rayures — excellent état', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'C', label: 'Grade C', desc: 'Traces visibles — fonctionnel', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { value: 'D', label: 'Grade D', desc: 'Usé — fonctionnel avec défauts', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
];

const STATUTS = [
  { value: 'en_stock', label: 'En stock', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'en_test', label: 'En test', color: 'bg-blue-100 text-blue-800' },
  { value: 'en_reparation', label: 'En réparation', color: 'bg-orange-100 text-orange-800' },
  { value: 'vendu', label: 'Vendu', color: 'bg-purple-100 text-purple-800' },
  { value: 'rma', label: 'RMA', color: 'bg-red-100 text-red-800' },
  { value: 'rebut', label: 'Rebut', color: 'bg-gray-100 text-gray-800' },
];

const MARQUES = ['Lenovo', 'Dell', 'HP', 'Apple', 'Acer', 'Asus', 'Microsoft', 'FUJITSU', 'Autre'];

// =============================================================
// Helpers
// =============================================================

function getGradeConfig(grade?: string) {
  return GRADES.find(g => g.value === grade) || GRADES[0];
}

function getStatutConfig(statut: string) {
  return STATUTS.find(s => s.value === statut) || STATUTS[0];
}

function getDeviceIcon(cat?: string) {
  switch (cat) {
    case 'PC Portable': return Laptop;
    case 'PC Bureau': return Monitor;
    case 'Serveur': return Server;
    case 'Mini PC': return Monitor;
    case 'Workstation': return Monitor;
    case 'Imprimante': return Printer;
    default: return Package;
  }
}

const isMachineCategory = (cat?: string) =>
  CATEGORIES_MACHINES.includes(cat || '');

// =============================================================
// Main Component
// =============================================================

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'machines' | 'pieces'>('machines');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterMarque, setFilterMarque] = useState<string>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('recherche', searchTerm);
      const res = await fetch(`/api/inventory?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      console.error('Erreur:', e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  // Filtered items
  const filtered = items.filter(item => {
    const isDevice = isMachineCategory(item.categorie);
    if (viewMode === 'machines' && !isDevice) return false;
    if (viewMode === 'pieces' && isDevice) return false;

    if (filterGrade !== 'all' && item.grade !== filterGrade) return false;
    if (filterStatut !== 'all' && item.statut !== filterStatut) return false;
    if (filterMarque !== 'all' && item.marque !== filterMarque) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.nom.toLowerCase().includes(q) ||
        item.reference?.toLowerCase().includes(q) ||
        item.marque?.toLowerCase().includes(q) ||
        item.modele?.toLowerCase().includes(q) ||
        item.processeur?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Stats
  const machines = items.filter(i => isMachineCategory(i.categorie));
  const pieces = items.filter(i => !isMachineCategory(i.categorie));
  const machinesEnStock = machines.filter(i => i.statut === 'en_stock');
  const valeurStock = machines
    .filter(i => i.statut === 'en_stock')
    .reduce((s, i) => s + (i.prixVente || i.coutUnitaire || 0), 0);
  const gradeA = machines.filter(i => i.grade === 'A' && i.statut === 'en_stock').length;
  const gradeB = machines.filter(i => i.grade === 'B' && i.statut === 'en_stock').length;
  const gradeC = machines.filter(i => i.grade === 'C' && i.statut === 'en_stock').length;

  // Form helpers
  const openCreateMachine = () => {
    setEditingId(null);
    setFormData({
      nom: '',
      reference: '',
      categorie: 'PC Portable',
      grade: 'A',
      marque: '',
      modele: '',
      processeur: '',
      ram: '',
      stockage: '',
      ecran: '',
      systemeOs: 'Windows 11 Pro',
      cosmetique: '',
      prixVente: 0,
      coutUnitaire: 0,
      fournisseur: '',
      emplacement: '',
      quantite: 1,
      seuilAlerte: 0,
      dureeGarantie: 12,
      statut: 'en_stock',
      batteryCycles: undefined,
      batteryHealth: undefined,
    });
    setShowForm(true);
  };

  const openCreatePiece = () => {
    setEditingId(null);
    setFormData({
      nom: '',
      reference: '',
      categorie: 'SSD',
      quantite: 0,
      seuilAlerte: 5,
      coutUnitaire: 0,
      fournisseur: '',
      emplacement: '',
      grade: 'A',
      statut: 'en_stock',
    });
    setShowForm(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.nom) return;
    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/inventory/${editingId}` : '/api/inventory';
      const method = editingId ? 'PUT' : 'POST';

      const payload: any = { ...formData };
      // Clean empty strings
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
      // Ensure numbers
      ['quantite', 'seuilAlerte', 'coutUnitaire', 'prixVente', 'dureeGarantie', 'batteryCycles', 'batteryHealth'].forEach(k => {
        if (payload[k] !== undefined) payload[k] = Number(payload[k]) || 0;
      });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      fetchInventory();
    } catch (e) {
      console.error(e);
    }
  };

  // Navigation for RMA creation
  const router = useRouter();
  const handleCreateRma = (item: InventoryItem) => {
    const params = new URLSearchParams({
      create: '1',
      equipmentName: item.nom || '',
      equipmentRef: item.reference || '',
      marque: item.marque || '',
      modele: item.modele || '',
      grade: item.grade || '',
      inventoryId: item.id || '',
    });
    if (item.prixVente) params.set('prixVendu', String(item.prixVente));
    router.push(`/admin/rma?${params.toString()}`);
  };

  // Demo data for empty state
  const demoMachines: InventoryItem[] = [
    { id: 'demo-1', nom: 'Lenovo ThinkPad T480', reference: 'LP-T480-001', categorie: 'PC Portable', quantite: 1, seuilAlerte: 0, statut: 'en_stock', grade: 'A', marque: 'Lenovo', modele: 'ThinkPad T480', processeur: 'Intel Core i5-8350U', ram: '16 Go DDR4', stockage: '256 Go SSD', ecran: '14" FHD IPS', systemeOs: 'Windows 11 Pro', prixVente: 549, coutUnitaire: 280, fournisseur: 'IT Broker', emplacement: 'Stock A1', dureeGarantie: 12, batteryHealth: 87, batteryCycles: 234, notesTest: 'Score 87/100 — Bon état', ticketItems: [], restockOrders: [] },
    { id: 'demo-2', nom: 'Dell OptiPlex 7060', reference: 'DB-7060-002', categorie: 'PC Bureau', quantite: 1, seuilAlerte: 0, statut: 'en_stock', grade: 'A', marque: 'Dell', modele: 'OptiPlex 7060', processeur: 'Intel Core i7-8700', ram: '32 Go DDR4', stockage: '512 Go NVMe', systemeOs: 'Windows 11 Pro', cosmetique: 'Parfait état', prixVente: 479, coutUnitaire: 220, fournisseur: 'IT Broker', emplacement: 'Stock B2', dureeGarantie: 12, notesTest: 'Score 93/100 — Excellent', ticketItems: [], restockOrders: [] },
    { id: 'demo-3', nom: 'HP EliteBook 840 G5', reference: 'LP-840G5-003', categorie: 'PC Portable', quantite: 1, seuilAlerte: 0, statut: 'en_test', grade: 'C', marque: 'HP', modele: 'EliteBook 840 G5', processeur: 'Intel Core i5-8250U', ram: '8 Go DDR4', stockage: '256 Go SSD', ecran: '14" FHD IPS', systemeOs: 'Windows 10 Pro', cosmetique: 'Rayures capot + traces clavier', prixVente: 349, coutUnitaire: 150, fournisseur: 'Reboot Pro', emplacement: 'Atelier', dureeGarantie: 6, batteryHealth: 31, batteryCycles: 847, notesTest: '⚠️ Score 58/100 — Batterie + SSD à remplacer', ticketItems: [], restockOrders: [] },
    { id: 'demo-4', nom: 'Lenovo ThinkCentre M720', reference: 'DB-M720-004', categorie: 'PC Bureau', quantite: 1, seuilAlerte: 0, statut: 'en_stock', grade: 'B', marque: 'Lenovo', modele: 'ThinkCentre M720', processeur: 'Intel Core i5-9400', ram: '16 Go DDR4', stockage: '256 Go SSD', systemeOs: 'Windows 11 Pro', cosmetique: 'Micro-rayures boîtier', prixVente: 399, coutUnitaire: 180, fournisseur: 'IT Broker', emplacement: 'Stock A3', dureeGarantie: 12, notesTest: 'Score 89/100 — Bon état', ticketItems: [], restockOrders: [] },
    { id: 'demo-5', nom: 'Dell Latitude 5520', reference: 'LP-5520-005', categorie: 'PC Portable', quantite: 1, seuilAlerte: 0, statut: 'vendu', grade: 'A', marque: 'Dell', modele: 'Latitude 5520', processeur: 'Intel Core i5-1145G7', ram: '16 Go DDR4', stockage: '512 Go NVMe', ecran: '15.6" FHD', systemeOs: 'Windows 11 Pro', prixVente: 649, coutUnitaire: 350, fournisseur: 'Euro IT', emplacement: '—', dureeGarantie: 12, batteryHealth: 95, batteryCycles: 78, notesTest: 'Score 95/100 — Excellent', ticketItems: [], restockOrders: [] },
  ];

  const hasMachinesInDb = items.some(i => isMachineCategory(i.categorie));
  const hasPiecesInDb = items.some(i => !isMachineCategory(i.categorie));
  const displayItems = filtered.length > 0
    ? filtered
    : (viewMode === 'machines' && !hasMachinesInDb ? demoMachines : []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventaire</h1>
                <p className="text-sm text-gray-500">Machines reconditionnées & pièces détachées</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchInventory} className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={viewMode === 'machines' ? openCreateMachine : openCreatePiece}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {viewMode === 'machines' ? 'Ajouter une machine' : 'Ajouter une pièce'}
              </button>
            </div>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-6">
          <button
            onClick={() => setViewMode('machines')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'machines' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Monitor className="w-4 h-4 inline mr-1.5" />
            Machines reconditionnées
          </button>
          <button
            onClick={() => setViewMode('pieces')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${viewMode === 'pieces' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <HardDrive className="w-4 h-4 inline mr-1.5" />
            Pièces & consommables
          </button>
        </div>

        {/* Stats for machines view */}
        {viewMode === 'machines' && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 mb-1">En stock</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{machinesEnStock.length || demoMachines.filter(d => d.statut === 'en_stock').length}</div>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 mb-1">Valeur stock</div>
              <div className="text-2xl font-bold text-blue-600">{(valeurStock || demoMachines.filter(d => d.statut === 'en_stock').reduce((s, d) => s + (d.prixVente || 0), 0)).toLocaleString('fr-FR')} €</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4 cursor-pointer" onClick={() => setFilterGrade(filterGrade === 'A' ? 'all' : 'A')}>
              <div className="text-xs text-emerald-600">Grade A</div>
              <div className="text-2xl font-bold text-emerald-700">{gradeA || demoMachines.filter(d => d.grade === 'A' && d.statut === 'en_stock').length}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 p-4 cursor-pointer" onClick={() => setFilterGrade(filterGrade === 'B' ? 'all' : 'B')}>
              <div className="text-xs text-blue-600">Grade B</div>
              <div className="text-2xl font-bold text-blue-700">{gradeB || demoMachines.filter(d => d.grade === 'B' && d.statut === 'en_stock').length}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 cursor-pointer" onClick={() => setFilterGrade(filterGrade === 'C' ? 'all' : 'C')}>
              <div className="text-xs text-yellow-600">Grade C</div>
              <div className="text-2xl font-bold text-yellow-700">{gradeC || demoMachines.filter(d => d.grade === 'C' && d.statut === 'en_stock').length}</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800 p-4 cursor-pointer" onClick={() => setFilterStatut(filterStatut === 'en_test' ? 'all' : 'en_test')}>
              <div className="text-xs text-orange-600">En test</div>
              <div className="text-2xl font-bold text-orange-700">{machines.filter(i => i.statut === 'en_test').length || demoMachines.filter(d => d.statut === 'en_test').length}</div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={viewMode === 'machines' ? 'Rechercher par marque, modèle, processeur...' : 'Rechercher par nom, référence...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
          {viewMode === 'machines' && (
            <>
              <select
                value={filterMarque}
                onChange={(e) => setFilterMarque(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              >
                <option value="all">Toutes marques</option>
                {MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                value={filterStatut}
                onChange={(e) => setFilterStatut(e.target.value)}
                className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white"
              >
                <option value="all">Tous statuts</option>
                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </>
          )}
          {(filterGrade !== 'all' || filterStatut !== 'all' || filterMarque !== 'all') && (
            <button onClick={() => { setFilterGrade('all'); setFilterStatut('all'); setFilterMarque('all'); }} className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <X className="w-3 h-3 inline mr-1" /> Reset
            </button>
          )}
        </div>

        {/* CREATE/EDIT FORM — Slide-over panel */}
        {showForm && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Modifier' : 'Ajouter'} {viewMode === 'machines' ? 'une machine' : 'une pièce'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {viewMode === 'machines' ? (
              /* ===== FORM MACHINE ===== */
              <div className="space-y-5">
                {/* Infos principales */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Marque *</label>
                    <select value={formData.marque || ''} onChange={e => setFormData({ ...formData, marque: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white">
                      <option value="">Choisir...</option>
                      {MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Modèle *</label>
                    <input value={formData.modele || ''} onChange={e => setFormData({ ...formData, modele: e.target.value, nom: `${formData.marque || ''} ${e.target.value}`.trim() })} placeholder="ThinkPad T480" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Référence interne</label>
                    <input value={formData.reference || ''} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="LP-T480-001" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                {/* Catégorie + Grade + Statut */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Type</label>
                    <select value={formData.categorie || ''} onChange={e => setFormData({ ...formData, categorie: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white">
                      {CATEGORIES_MACHINES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Grade</label>
                    <div className="flex gap-1.5">
                      {GRADES.map(g => (
                        <button key={g.value} onClick={() => setFormData({ ...formData, grade: g.value })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${formData.grade === g.value ? g.color + ' border-transparent ring-2 ring-offset-1 ring-blue-500' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500'}`} title={g.desc}>
                          {g.value}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Statut</label>
                    <select value={formData.statut || 'en_stock'} onChange={e => setFormData({ ...formData, statut: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white">
                      {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Specs */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-2 block">Spécifications</label>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1"><Cpu className="w-3 h-3" /> CPU</div>
                      <input value={formData.processeur || ''} onChange={e => setFormData({ ...formData, processeur: e.target.value })} placeholder="i5-8350U" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1"><Package className="w-3 h-3" /> RAM</div>
                      <input value={formData.ram || ''} onChange={e => setFormData({ ...formData, ram: e.target.value })} placeholder="16 Go DDR4" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1"><HardDrive className="w-3 h-3" /> Stockage</div>
                      <input value={formData.stockage || ''} onChange={e => setFormData({ ...formData, stockage: e.target.value })} placeholder="256 Go SSD" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-1"><Monitor className="w-3 h-3" /> Écran</div>
                      <input value={formData.ecran || ''} onChange={e => setFormData({ ...formData, ecran: e.target.value })} placeholder="14&quot; FHD IPS" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* OS + Cosmétique + Batterie */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">OS</label>
                    <input value={formData.systemeOs || ''} onChange={e => setFormData({ ...formData, systemeOs: e.target.value })} placeholder="Windows 11 Pro" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">État cosmétique</label>
                    <input value={formData.cosmetique || ''} onChange={e => setFormData({ ...formData, cosmetique: e.target.value })} placeholder="Comme neuf" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Batterie %</label>
                    <input type="number" min={0} max={100} value={formData.batteryHealth || ''} onChange={e => setFormData({ ...formData, batteryHealth: parseInt(e.target.value) || undefined })} placeholder="87" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Cycles batterie</label>
                    <input type="number" min={0} value={formData.batteryCycles || ''} onChange={e => setFormData({ ...formData, batteryCycles: parseInt(e.target.value) || undefined })} placeholder="234" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                {/* Prix + Garantie + Emplacement */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Prix d'achat (€)</label>
                    <input type="number" step="0.01" value={formData.coutUnitaire || ''} onChange={e => setFormData({ ...formData, coutUnitaire: parseFloat(e.target.value) || 0 })} placeholder="280" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Prix de vente (€)</label>
                    <input type="number" step="0.01" value={formData.prixVente || ''} onChange={e => setFormData({ ...formData, prixVente: parseFloat(e.target.value) || 0 })} placeholder="549" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Garantie (mois)</label>
                    <input type="number" min={0} value={formData.dureeGarantie || 12} onChange={e => setFormData({ ...formData, dureeGarantie: parseInt(e.target.value) || 12 })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Emplacement</label>
                    <input value={formData.emplacement || ''} onChange={e => setFormData({ ...formData, emplacement: e.target.value })} placeholder="Stock A1" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>

                {/* Fournisseur */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Fournisseur</label>
                    <input value={formData.fournisseur || ''} onChange={e => setFormData({ ...formData, fournisseur: e.target.value })} placeholder="IT Broker" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Nom (auto-généré)</label>
                    <input value={formData.nom || ''} onChange={e => setFormData({ ...formData, nom: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white bg-gray-50 dark:bg-gray-900" />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">Annuler</button>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Enregistrer' : 'Ajouter au stock'}
                  </button>
                </div>
              </div>
            ) : (
              /* ===== FORM PIÈCE (simple) ===== */
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Nom *</label>
                    <input value={formData.nom || ''} onChange={e => setFormData({ ...formData, nom: e.target.value })} placeholder="DDR4 16 Go" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Référence</label>
                    <input value={formData.reference || ''} onChange={e => setFormData({ ...formData, reference: e.target.value })} placeholder="RAM-DDR4-16G" className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Catégorie</label>
                    <select value={formData.categorie || ''} onChange={e => setFormData({ ...formData, categorie: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 dark:text-white">
                      {CATEGORIES_PIECES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Quantité</label>
                    <input type="number" min={0} value={formData.quantite || 0} onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Seuil alerte</label>
                    <input type="number" min={0} value={formData.seuilAlerte || 5} onChange={e => setFormData({ ...formData, seuilAlerte: parseInt(e.target.value) || 5 })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Coût unitaire (€)</label>
                    <input type="number" step="0.01" value={formData.coutUnitaire || ''} onChange={e => setFormData({ ...formData, coutUnitaire: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Fournisseur</label>
                    <input value={formData.fournisseur || ''} onChange={e => setFormData({ ...formData, fournisseur: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-800 dark:text-white" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 transition">Annuler</button>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Machine list */}
        {viewMode === 'machines' ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <div className="col-span-3">Machine</div>
              <div className="col-span-1">Grade</div>
              <div className="col-span-3">Configuration</div>
              <div className="col-span-1">Batterie</div>
              <div className="col-span-1">Prix vente</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-1">Audit</div>
              <div className="col-span-1">Actions</div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Monitor className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune machine trouvée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {displayItems.map(item => {
                  const Icon = getDeviceIcon(item.categorie);
                  const gradeConf = getGradeConfig(item.grade);
                  const statutConf = getStatutConfig(item.statut);
                  const isExpanded = expandedItem === item.id;
                  const marge = item.prixVente && item.coutUnitaire ? item.prixVente - item.coutUnitaire : null;

                  return (
                    <div key={item.id}>
                      <div className={`grid grid-cols-12 gap-2 px-6 py-3.5 items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/20' : ''}`} onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                        {/* Machine */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-sm text-gray-900 dark:text-white">{item.marque} {item.modele || item.nom}</div>
                            <div className="text-xs text-gray-400">{item.reference} · {item.categorie}</div>
                          </div>
                        </div>
                        {/* Grade */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${gradeConf.color}`}>
                            {gradeConf.label}
                          </span>
                        </div>
                        {/* Config */}
                        <div className="col-span-3">
                          <div className="flex flex-wrap gap-1.5">
                            {item.processeur && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{item.processeur}</span>}
                            {item.ram && <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded">{item.ram}</span>}
                            {item.stockage && <span className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded">{item.stockage}</span>}
                            {item.ecran && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded">{item.ecran}</span>}
                          </div>
                        </div>
                        {/* Batterie */}
                        <div className="col-span-1">
                          {item.batteryHealth !== undefined && item.batteryHealth !== null ? (
                            <div className="flex items-center gap-1.5">
                              <Battery className={`w-4 h-4 ${item.batteryHealth >= 70 ? 'text-emerald-500' : item.batteryHealth >= 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                              <span className="text-sm font-medium">{item.batteryHealth}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                        {/* Prix */}
                        <div className="col-span-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{item.prixVente ? `${item.prixVente} €` : '—'}</div>
                          {marge !== null && <div className="text-[11px] text-emerald-600">+{marge} € marge</div>}
                        </div>
                        {/* Statut */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${statutConf.color}`}>
                            {statutConf.label}
                          </span>
                        </div>
                        {/* Audit */}
                        <div className="col-span-1">
                          {item.notesTest ? (
                            <span className="text-xs text-gray-500" title={item.notesTest}>
                              {item.notesTest.match(/Score (\d+)/)?.[1] ? `${item.notesTest.match(/Score (\d+)/)?.[1]}/100` : '✅'}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                        {/* Actions */}
                        <div className="col-span-1 flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition" title="Modifier">
                            <Edit className="w-4 h-4 text-gray-400" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Supprimer">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                          {item.statut !== 'rma' && (
                            <button onClick={(e) => { e.stopPropagation(); handleCreateRma(item); }} className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition" title="Créer un retour SAV">
                              <RotateCcw className="w-4 h-4 text-orange-500" />
                            </button>
                          )}
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="px-6 pb-4 bg-gray-50/50 dark:bg-gray-800/10">
                          <div className="grid grid-cols-4 gap-4 pt-2">
                            <DetailCard label="OS" value={item.systemeOs} />
                            <DetailCard label="Cosmétique" value={item.cosmetique} />
                            <DetailCard label="Garantie" value={item.dureeGarantie ? `${item.dureeGarantie} mois` : undefined} />
                            <DetailCard label="Emplacement" value={item.emplacement} />
                            <DetailCard label="Fournisseur" value={item.fournisseur} />
                            <DetailCard label="Prix d'achat" value={item.coutUnitaire ? `${item.coutUnitaire} €` : undefined} />
                            <DetailCard label="Testé par" value={item.testeePar} />
                            <DetailCard label="Notes test" value={item.notesTest} />
                          </div>
                          {/* Quick action buttons */}
                          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                            {item.statut !== 'rma' && item.statut !== 'rebut' && (
                              <button onClick={() => handleCreateRma(item)}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition">
                                <RotateCcw className="w-4 h-4" /> Créer un retour SAV
                              </button>
                            )}
                            {item.statut === 'rma' && (
                              <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
                                <RotateCcw className="w-4 h-4" /> RMA en cours — <button onClick={() => router.push('/admin/rma')} className="underline hover:no-underline">Voir le dossier</button>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ===== PIECES VIEW (simple table) ===== */
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-8 gap-2 px-6 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <div className="col-span-2">Article</div>
              <div className="col-span-1">Catégorie</div>
              <div className="col-span-1">Quantité</div>
              <div className="col-span-1">Seuil</div>
              <div className="col-span-1">Coût U.</div>
              <div className="col-span-1">Fournisseur</div>
              <div className="col-span-1">Actions</div>
            </div>
            {displayItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Aucune pièce en stock</p>
                <button onClick={openCreatePiece} className="mt-3 text-blue-600 text-sm hover:underline">+ Ajouter une pièce</button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {displayItems.map(item => (
                  <div key={item.id} className="grid grid-cols-8 gap-2 px-6 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                    <div className="col-span-2">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">{item.nom}</div>
                      {item.reference && <div className="text-xs text-gray-400">{item.reference}</div>}
                    </div>
                    <div className="col-span-1"><span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{item.categorie}</span></div>
                    <div className="col-span-1"><span className={`font-bold text-sm ${item.quantite <= item.seuilAlerte ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{item.quantite}</span></div>
                    <div className="col-span-1 text-sm text-gray-400">{item.seuilAlerte}</div>
                    <div className="col-span-1 text-sm">{item.coutUnitaire ? `${item.coutUnitaire} €` : '—'}</div>
                    <div className="col-span-1 text-sm text-gray-500">{item.fournisseur || '—'}</div>
                    <div className="col-span-1 flex gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"><Edit className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="text-sm">
      <span className="text-gray-400 text-xs">{label}</span>
      <div className="text-gray-900 dark:text-white font-medium mt-0.5">{value || '—'}</div>
    </div>
  );
}