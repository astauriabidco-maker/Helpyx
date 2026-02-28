# 📊 Dashboard Administrateur

> **Route** : `/admin`  
> **Rôle requis** : ADMIN  
> **Composant** : `admin-dashboard.tsx`

---

## À quoi ça sert ?

Le Dashboard est la vue d'ensemble de votre activité IT. En un coup d'œil, vous voyez l'état de santé de votre support : combien de tickets sont ouverts, le temps de résolution moyen, les SLAs respectés, et les performances de votre équipe.

---

## Ce que vous voyez à l'écran

### KPIs principaux (ligne du haut)
- **Tickets Ouverts** — Nombre de tickets non résolus
- **Temps de résolution moyen** — Durée moyenne pour fermer un ticket
- **Taux de satisfaction** — Score de satisfaction client
- **Taux SLA respecté** — Pourcentage de tickets résolus dans les délais

### Graphiques
- **Évolution des tickets** — Courbe des tickets créés vs résolus sur les 30 derniers jours
- **Répartition par catégorie** — Camembert des types de demandes (Réseau, Logiciel, Matériel...)
- **Performance des agents** — Classement des agents par nombre de tickets résolus

### Tickets récents
- Liste des 5 derniers tickets avec leur statut, priorité et assignation

---

## Actions possibles

| Action | Comment |
|--------|---------|
| Voir le détail d'un ticket | Cliquer sur le ticket dans la liste |
| Changer la période | Sélectionner 7j / 30j / 90j |
| Exporter les stats | Bouton "Exporter" (CSV) |
| Rafraîchir | Les données se mettent à jour automatiquement |

---

## Données en temps réel

Le dashboard utilise **Socket.IO** pour se mettre à jour en temps réel. Quand un agent résout un ticket, le compteur change instantanément sur votre écran sans rafraîchir la page.
