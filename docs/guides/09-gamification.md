# 🏆 Gamification

> **Route** : `/gamification`  
> **Rôle requis** : AGENT (principal) · ADMIN (tableau de bord)  
> **Composants** : `gamification/gamification-profile.tsx`, `gamification/leaderboard.tsx`, `gamification/available-achievements.tsx`

---

## À quoi ça sert ?

La Gamification transforme le travail de support en jeu. Les agents gagnent de l'XP en résolvant des tickets, rédigeant des articles KB, et en aidant leurs collègues. L'objectif : réduire le turnover, augmenter l'engagement et récompenser les meilleurs.

---

## Système d'XP

### Comment gagner de l'XP

| Action | XP gagnés |
|--------|-----------|
| 🎫 Résoudre un ticket | +20 XP |
| 🎫 Résoudre un ticket Critique | +50 XP |
| ⏱️ Résoudre un ticket avant le SLA | +15 XP bonus |
| 📝 Rédiger un article KB | +50 XP |
| 💬 Commenter un ticket (aide collègue) | +5 XP |
| ⭐ Recevoir un avis positif client | +30 XP |
| 🔥 Streak 5 jours consécutifs | +100 XP bonus |

### Niveaux

| Niveau | XP requis | Titre |
|--------|-----------|-------|
| 1 | 0 | Débutant |
| 2 | 100 | Apprenti |
| 3 | 300 | Technicien |
| 4 | 600 | Expert |
| 5 | 1000 | Maître |
| 6 | 1500 | Légende |
| 7 | 2500 | Héros du Support |

---

## Badges / Achievements

Des badges sont débloqués automatiquement quand certaines conditions sont remplies :

| Badge | Condition |
|-------|-----------|
| 🎯 **First Blood** | Résoudre son premier ticket |
| 🔥 **Speed Demon** | Résoudre un ticket en moins de 5 minutes |
| 📚 **Encyclopédie** | Rédiger 10 articles KB |
| 🤝 **Team Player** | Aider 5 collègues via commentaires |
| 💎 **Perfectionniste** | 100% SLA respecté sur un mois |
| 🌟 **Étoile Montante** | Atteindre le Top 3 du leaderboard |

---

## Leaderboard

Le classement affiche les agents par XP totale. Il est mis à jour en temps réel :
- 🥇 **1er** : Badge doré + titre "Champion du Mois"
- 🥈 **2ème** : Badge argenté
- 🥉 **3ème** : Badge bronze

Le leaderboard se réinitialise chaque mois mais l'XP totale est conservée.

---

## Pour l'Admin

Le dashboard Gamification montre :
- La répartition des XP par agent
- Les badges les plus débloqués
- L'impact mesurable : temps de résolution moyen avant/après gamification
