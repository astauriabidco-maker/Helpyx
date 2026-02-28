# 📦 Inventaire & CMDB

> **Route** : `/inventory` · `/smart-inventory`  
> **Rôle requis** : ADMIN, AGENT  
> **Composants** : `inventory-management.tsx`, `smart-inventory-discovery.tsx`

---

## À quoi ça sert ?

L'inventaire centralise tous les équipements informatiques de votre entreprise : ordinateurs, serveurs, imprimantes, switches, câbles, licences. C'est votre CMDB (Configuration Management Database).

---

## Vue principale

La page affiche un tableau avec tous les équipements :

| Colonne | Description |
|---------|-------------|
| **Nom** | Nom de l'équipement (ex: PC-Bureau-042) |
| **Catégorie** | Ordinateur, Serveur, Réseau, Imprimante, Stockage... |
| **Référence** | Numéro de série ou code interne |
| **Quantité** | Nombre en stock |
| **Statut** | Actif, Inactif, En maintenance, Commandé |
| **Emplacement** | Localisation physique ou adresse IP |
| **Coût unitaire** | Prix d'achat |

---

## Ajouter un équipement

### Manuellement
1. Cliquer **"Ajouter"**
2. Remplir : Nom, Catégorie, Référence, Quantité, Coût, Fournisseur, Emplacement
3. Sauvegarder

### Par découverte automatique
1. Aller dans **"Découverte intelligente"** (`/smart-inventory`)
2. Choisir le type de scan : **Réseau**, **Bluetooth**, ou **USB**
3. Pour le réseau, entrer la plage IP (ex: `192.168.1.0/24`)
4. Cliquer **"Lancer la découverte"**
5. L'agent scanne le réseau et trouve les appareils
6. Cocher les appareils à importer
7. Cliquer **"Ajouter à l'inventaire"**

### Via l'Agent Helpyx (recommandé en production)
Installer l'agent sur une machine du réseau client :
```bash
curl -fsSL https://votre-helpyx.io/api/agents/download | bash
helpyx-agent init
helpyx-agent scan
```
L'agent scanne le réseau réel et pousse les résultats dans l'inventaire automatiquement.

---

## Seuil d'alerte

Chaque équipement a un **seuil d'alerte** de stock. Quand la quantité passe en dessous, une notification est envoyée à l'admin.

---

## Lien avec les tickets

Quand un agent crée un ticket, il peut **lier un équipement** de l'inventaire. Cela permet de :
- Voir l'historique des incidents sur cet équipement
- Savoir rapidement si un matériel est récurrent en panne
- Planifier la maintenance préventive
