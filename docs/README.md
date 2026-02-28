# 📚 Helpyx — Documentation Complète

> Guide d'utilisation et d'explication de chaque module de la plateforme Helpyx.

---

## 🏠 Table des Matières

### Guides Utilisateur

| # | Module | Guide | Rôle cible |
|---|--------|-------|------------|
| 1 | [Dashboard Admin](guides/01-dashboard.md) | Tableau de bord principal, KPIs et statistiques | Admin |
| 2 | [Gestion des Tickets](guides/02-tickets.md) | Créer, suivre et résoudre les tickets | Tous |
| 3 | [Gestion des Utilisateurs](guides/03-utilisateurs.md) | Ajouter, modifier et gérer les comptes | Admin |
| 4 | [Inventaire & CMDB](guides/04-inventaire.md) | Gérer le parc informatique | Admin, Agent |
| 5 | [Base de Connaissances](guides/05-knowledge-base.md) | Rédiger et consulter les articles KB | Tous |
| 6 | [Knowledge Graph](guides/06-knowledge-graph.md) | Graphe interactif des relations IT | Admin, Agent |
| 7 | [Digital Twin 3D](guides/07-digital-twin.md) | Jumeau numérique de l'infrastructure | Admin |
| 8 | [Marketplace d'Experts](guides/08-marketplace.md) | Trouver et engager des spécialistes | Tous |
| 9 | [Gamification](guides/09-gamification.md) | Système XP, badges et leaderboard | Agent |
| 10 | [Facturation & Billing](guides/10-billing.md) | Abonnements, factures et paiements | Admin |
| 11 | [IA Comportementale](guides/11-ia-comportementale.md) | Détection d'émotions et adaptation | Admin |
| 12 | [Notifications](guides/12-notifications.md) | Centre d'alertes en temps réel | Tous |
| 13 | [Paramètres](guides/13-parametres.md) | Configuration de l'entreprise | Admin |
| 14 | [Workflow Builder](guides/14-workflows.md) | Automatisations No-Code | Admin |
| 15 | [Hub d'Intégrations](guides/15-integrations.md) | Connecteurs tiers (Slack, Jira...) | Admin |
| 16 | [Change Management](guides/16-change-management.md) | Gestion des changements ITIL | Admin |
| 17 | [Reporting IA](guides/17-reporting-ia.md) | Rapports en langage naturel | Admin |
| 18 | [Agent Réseau](guides/18-agent-reseau.md) | Découverte automatique du parc | Admin |

### Guides Techniques

| Guide | Description |
|-------|-------------|
| [Architecture Technique](../helpyx_architecture.md) | Stack, modèle de données, API |
| [Agent README](../agent/README.md) | Installation et utilisation de l'agent réseau |

---

## 🚀 Démarrage Rapide

### Première connexion
1. Accédez à `http://votre-helpyx.io/auth/signin`
2. Connectez-vous avec vos identifiants (fournis par votre administrateur)
3. Vous arriverez sur le dashboard correspondant à votre rôle

### Rôles disponibles
| Rôle | Accès |
|------|-------|
| **ADMIN** | Accès complet à tous les modules |
| **AGENT** | Tickets, Inventaire, KB, Gamification |
| **CLIENT** | Mes tickets, KB, Profil |

---

## ❓ Besoin d'aide ?

- **Email** : support@helpyx.io
- **Documentation API** : `/api/docs`
- **Statut serveur** : `/api/health`
