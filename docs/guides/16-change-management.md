# 🔄 Change Management (ITIL)

> **Route** : `/admin/changes`  
> **Rôle requis** : ADMIN  
> **Standard** : ITIL v4 Change Management

---

## À quoi ça sert ?

Le module Change Management gère les changements planifiés dans votre infrastructure selon le cadre ITIL : mise à jour de serveur, migration de base de données, déploiement d'application... Chaque changement suit un processus d'approbation formel pour minimiser les risques.

---

## Cycle de vie d'un changement (RFC)

```
Demande → Évaluation → Approbation → Planification → Implémentation → Revue → Clôture
```

### 1. Demande (RFC = Request For Change)
- Décrire le changement : quoi, pourquoi, quand
- Évaluer l'impact : critiques, utilisateurs affectés
- Plan de retour arrière (rollback)

### 2. Évaluation des risques
Le système calcule un **score de risque** basé sur :
- Complexité technique
- Nombre d'utilisateurs impactés
- Disponibilité requise (heures ouvrées vs week-end)
- Historique des changements similaires

### 3. Approbation
Selon le niveau de risque :

| Risque | Approbation requise |
|--------|-------------------|
| 🟢 Faible | Auto-approuvé |
| 🟡 Moyen | Approbation manager |
| 🔴 Élevé | CAB (Change Advisory Board) |
| ⚫ Critique | Directeur IT + CAB |

### 4. Implémentation
- Checklist d'implémentation étape par étape
- Assignation des techniciens
- Créneau de maintenance défini
- Notifications automatiques aux utilisateurs impactés

### 5. Revue post-implémentation (PIR)
Après le changement :
- Le changement a-t-il réussi ? ✅/❌
- Incidents survenus pendant l'implémentation ?
- Leçons apprises
- Documentation mise à jour ?

---

## Types de changement

| Type | Description | Exemple |
|------|-------------|---------|
| **Standard** | Pré-approuvé, procédure documentée | Ajout d'un utilisateur AD |
| **Normal** | Suit le processus complet d'approbation | Mise à jour serveur |
| **Urgent** | Processus accéléré (approbation orale) | Patch de sécurité critique |

---

## Calendrier des changements

Le calendrier affiche tous les changements planifiés sur une vue Gantt. Les conflits (deux changements sur le même système simultanément) sont détectés et signalés automatiquement.
