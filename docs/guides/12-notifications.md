# 🔔 Notifications

> **Route** : `/notifications`  
> **Rôle requis** : Tous  
> **Composants** : `notification-bell.tsx`, `notifications/notification-center.tsx`

---

## À quoi ça sert ?

Le centre de notifications regroupe toutes les alertes en temps réel : nouveau ticket assigné, SLA bientôt dépassé, changement de statut, alerte infrastructure...

---

## Types de notifications

| Icône | Type | Exemple |
|-------|------|---------|
| 🎫 | Ticket | "Nouveau ticket TK-042 assigné à vous" |
| ⏱️ | SLA | "SLA bientôt dépassé sur TK-039 (2h restantes)" |
| 💬 | Commentaire | "Nouveau commentaire sur TK-041" |
| 🔴 | Alerte | "Serveur APP-01 : CPU à 95%" |
| 👤 | Utilisateur | "Nouvel utilisateur créé : Marie D." |
| 🏆 | Gamification | "Badge débloqué : Speed Demon !" |

---

## Comment ça fonctionne

### Cloche dans le header
- Le nombre de notifications non lues apparaît en badge rouge
- Cliquer sur 🔔 ouvre un dropdown avec les 10 dernières notifications
- Cliquer sur une notification redirige vers l'élément concerné

### Page complète
- `/notifications` affiche toutes les notifications avec filtres
- Marquer comme lu / non lu
- Supprimer individuellement ou en masse
- Filtrer par type

### Temps réel
Les notifications utilisent **Socket.IO**. Elles apparaissent instantanément sans rafraîchir la page. Un son discret accompagne les alertes critiques.

---

## Configuration

Dans **Paramètres** → **Notifications** :
- Activer/désactiver par type
- Choisir les canaux : In-app, Email, SMS
- Définir les heures de "Ne pas déranger"
