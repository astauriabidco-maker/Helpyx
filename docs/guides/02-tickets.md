# 🎫 Gestion des Tickets

> **Route** : `/admin/tickets` (Admin/Agent) · `/tickets` (Client)  
> **Rôle requis** : Tous  
> **Composants** : `enhanced-ticket-list.tsx`, `advanced-ticket-form.tsx`, `ticket-update-form.tsx`

---

## À quoi ça sert ?

Le système de tickets est le cœur de Helpyx. Il permet aux utilisateurs de signaler des incidents, de faire des demandes, et aux agents de suivre et résoudre ces demandes de manière structurée.

---

## Créer un ticket

1. Cliquer sur **"Nouveau ticket"**
2. Remplir le formulaire multi-étapes :
   - **Étape 1 — Type** : Incident, Demande de service, Problème, Changement
   - **Étape 2 — Détails** : Titre, description détaillée
   - **Étape 3 — Classification** : Catégorie (Réseau, Logiciel, Matériel...), Priorité (Basse → Critique)
   - **Étape 4 — Pièces jointes** : Photos, captures d'écran, fichiers
3. Cliquer sur **"Soumettre"**

### Suggestion IA
Pendant la saisie, l'IA analyse votre description et peut :
- Suggérer la catégorie et la priorité
- Proposer des articles KB existants qui répondent déjà à votre question
- Identifier les équipements potentiellement concernés

---

## Liste des tickets

La vue liste affiche tous les tickets avec :

| Colonne | Description |
|---------|-------------|
| **Référence** | Numéro unique (ex: TK-2024-0042) |
| **Titre** | Résumé court du problème |
| **Statut** | Nouveau → En cours → En attente → Résolu → Fermé |
| **Priorité** | 🟢 Basse · 🟡 Moyenne · 🟠 Haute · 🔴 Critique |
| **Assigné à** | Agent responsable |
| **Créé le** | Date de création |
| **SLA** | Temps restant avant dépassement |

### Filtres disponibles
- Par statut (Ouvert, En cours, Résolu...)
- Par priorité
- Par assignation (Mes tickets, Non assignés)
- Par catégorie
- Recherche texte libre

---

## Détail d'un ticket

En cliquant sur un ticket, vous accédez à sa fiche détaillée :

- **Informations complètes** : Titre, description, pièces jointes
- **Timeline** : Historique complet des actions (création, commentaires, changements de statut)
- **Commentaires** : Discussion entre l'agent et le client (commentaires internes possibles)
- **Équipements liés** : Matériel concerné par le ticket (lié à l'inventaire)
- **Actions rapides** : Changer le statut, la priorité, l'assignation

### Mettre à jour un ticket
1. Changer le **statut** via le sélecteur
2. Ajouter un **commentaire** (public ou interne)
3. **Réassigner** à un autre agent
4. Modifier la **priorité** si nécessaire
5. **Fermer** le ticket une fois résolu

---

## Cycle de vie ITIL

```
Nouveau → En cours → En attente → Résolu → Fermé
                 ↑         │
                 └─────────┘
              (si le client relance)
```

---

## Astuce

Un ticket marqué **"Critique"** déclenche automatiquement une notification SMS à l'agent assigné et au manager (si configuré dans les Paramètres).
