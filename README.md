# Portail SAV Matériel Informatique

Une application web moderne pour la gestion des tickets de service après-vente (SAV) pour le matériel informatique.

## 🚀 Fonctionnalités

### MVP Complet
- ✅ **Création de tickets** : Formulaire simple pour décrire les pannes
- ✅ **Upload de photos** : Possibilité d'ajouter des images pour illustrer les problèmes
- ✅ **Liste des tickets** : Affichage de tous les tickets avec statuts
- ✅ **Gestion des statuts** : 3 états possibles (Ouvert, En cours, Fermé)
- ✅ **Mise à jour en temps réel** : Modification instantanée des statuts
- ✅ **Suppression de tickets** : Pour les agents SAV
- ✅ **Design responsive** : Fonctionne sur mobile et desktop

### Stack Technique
- **Frontend** : Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : API Routes Next.js + Prisma ORM
- **Base de données** : SQLite (développement) / PostgreSQL (production)
- **Upload** : Stockage local des images

## 📋 Structure des Tickets

Chaque ticket contient :
- **ID** : Identifiant unique
- **Description** : Texte décrivant la panne
- **Statut** : `ouvert` | `en_cours` | `fermé`
- **Photo** : Image optionnelle (JPG, PNG, GIF, WebP)
- **Date de création** : Timestamp automatique

## 🛠️ Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd sav-mvp-nextjs

# Installer les dépendances
npm install

# Initialiser la base de données
npm run db:push
```

### Démarrage
```bash
# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 📡 API Endpoints

### Tickets
- `GET /api/tickets` - Lister tous les tickets
- `POST /api/tickets` - Créer un nouveau ticket
- `PUT /api/tickets/[id]` - Mettre à jour le statut d'un ticket
- `DELETE /api/tickets/[id]` - Supprimer un ticket

### Photos
- `GET /api/tickets/photo/[...filename]` - Servir les images uploadées

### Démo
- `POST /api/demo` - Créer des tickets de démonstration

## 🎯 Utilisation

### Pour les Clients
1. Remplir le formulaire de création de ticket
2. Décrire clairement la panne rencontrée
3. Ajouter une photo si possible (très recommandé)
4. Soumettre et noter le numéro de ticket

### Pour les Agents SAV
1. Consulter la liste des tickets
2. Utiliser le menu déroulant pour changer le statut
3. Mettre à jour "En cours" lors de la prise en charge
4. Passer à "Fermé" une fois le problème résolu

## 📱 Interface

### Page d'accueil
- **Formulaire de création** : À gauche, permet de créer de nouveaux tickets
- **Liste des tickets** : À droite, affiche tous les tickets existants
- **Badges de statut** : Code couleur pour identifier rapidement l'état
- **Actions rapides** : Menu déroulant et bouton de suppression

### Design
- Interface moderne et épurée avec shadcn/ui
- Responsive design pour mobile et desktop
- Feedback visuel lors des actions
- Loading states et gestion d'erreurs

## 🔧 Configuration

### Base de données
Le projet utilise SQLite par défaut pour le développement. Pour passer à PostgreSQL :

1. Modifier `prisma/schema.prisma`
2. Mettre à jour `DATABASE_URL` dans `.env`
3. Lancer `npm run db:push`

### Upload d'images
Les images sont stockées dans `public/uploads/`. Taille maximale : 5MB par défaut.

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Autres plateformes
L'application peut être déployée sur n'importe quelle plateforme supportant Next.js.

## 📈 Évolutions Possibles

### Version 2.0
- 🔐 Authentification des utilisateurs et agents
- 📧 Notifications par email
- 💬 Système de commentaires sur les tickets
- 📊 Tableau de bord statistique
- 🔍 Recherche et filtrage avancé
- 📱 Application mobile (PWA)

### Version 3.0
- 🏢 Gestion multi-clients
- 🤖 IA pour la classification automatique
- 📋 Templates de tickets
- 🔄 Intégration avec systèmes externes
- 📈 Rapports et analytics

## 🤝 Contribuer

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour les détails.

---

**Développé avec ❤️ using Next.js 15, TypeScript et Tailwind CSS**