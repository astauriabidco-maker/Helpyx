# 🖥️ Digital Twin 3D

> **Route** : `/digital-twin`  
> **Rôle requis** : ADMIN  
> **Technologie** : Three.js + react-force-graph-3d

---

## À quoi ça sert ?

Le Digital Twin (Jumeau Numérique) est une représentation 3D interactive de toute votre infrastructure IT. Chaque serveur, switch, routeur et poste de travail est un nœud dans un graphe 3D. Les connexions réseau sont les liens entre les nœuds.

---

## Ce que vous voyez

### Nœuds
Chaque nœud représente un équipement. Sa couleur indique son état :
- 🟢 **Vert** : Fonctionnel, métriques normales
- 🟡 **Jaune** : Warning (CPU > 70%, RAM > 80%)
- 🔴 **Rouge clignotant** : Critique (serveur down, CPU > 95%)
- ⚫ **Gris** : Hors ligne / non monitoré

### Métriques temps réel
En cliquant sur un nœud :
- **CPU** : Utilisation en pourcentage
- **RAM** : Mémoire utilisée / totale
- **Disque** : Espace occupé
- **Uptime** : Temps depuis le dernier redémarrage
- **Trafic réseau** : Entrée / Sortie

---

## Actions rapides

Depuis le panneau de détail d'un nœud :

| Action | Ce qu'elle fait |
|--------|----------------|
| 🎫 **Créer un incident** | Ouvre un ticket pré-rempli avec les infos de l'équipement |
| 🔄 **Reboot** | Envoie une commande de redémarrage (si l'agent est connecté) |
| 💻 **SSH** | Ouvre une session SSH vers le serveur |
| 📊 **Historique** | Affiche les métriques sur 24h/7j/30j |

---

## Alertes visuelles

Quand un seuil est dépassé, le nœud concerné :
1. Change de couleur (jaune → rouge)
2. **Clignote** pour attirer l'attention
3. Une notification push est envoyée via Socket.IO
4. Un tooltip s'affiche avec le détail de l'alerte

---

## Limitation actuelle

Le Digital Twin affiche actuellement des données simulées. Pour des métriques réelles, il faut connecter un outil de monitoring (Datadog, Zabbix, Prometheus) via le Hub d'Intégrations.
