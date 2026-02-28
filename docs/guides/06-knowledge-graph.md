# 🧠 Knowledge Graph

> **Route** : `/knowledge-graph`  
> **Rôle requis** : ADMIN, AGENT  
> **Composants** : `knowledge-graph/` (10 fichiers)

---

## À quoi ça sert ?

Le Knowledge Graph est un graphe interactif 3D qui visualise les relations entre tous les éléments de votre IT : équipements, erreurs, solutions, utilisateurs. En survolant un nœud, vous voyez instantanément à quoi il est connecté.

---

## Comment l'utiliser

### Navigation dans le graphe
- **Zoom** : Molette de souris
- **Rotation** : Clic gauche + glisser
- **Pan** : Clic droit + glisser
- **Sélectionner un nœud** : Cliquer dessus → affiche les détails dans le panneau latéral

### Types de nœuds
| Couleur | Type | Exemple |
|---------|------|---------|
| 🔵 Bleu | Équipement | Serveur-APP-01, Switch-Core |
| 🔴 Rouge | Erreur | "CPU à 100%", "Disque plein" |
| 🟢 Vert | Solution | "Redémarrer le service", "Ajouter de la RAM" |
| 🟡 Jaune | Utilisateur | Agent Thomas, Client Sophie |

### Types de relations
- **CAUSE** → Une erreur est causée par un équipement
- **RÉSOUT** → Une solution résout une erreur
- **UTILISE** → Un utilisateur utilise un équipement
- **DÉPEND_DE** → Un équipement dépend d'un autre

---

## Cas d'usage

1. **Diagnostic rapide** : "Ce serveur est tombé → quelles erreurs sont liées → quelles solutions ont marché avant ?"
2. **Impact analysis** : "Si je coupe ce switch, quels équipements sont impactés ?"
3. **Base de connaissances visuelle** : Les solutions passées sont connectées aux erreurs, formant une mémoire collective.

---

## Alimentation du graphe

Le graphe se nourrit automatiquement :
- Quand un ticket est résolu, la relation Erreur→Solution est créée
- Quand un équipement est lié à un ticket, la relation est ajoutée
- Via le connecteur de monitoring (`MonitoringConnector`) pour les données temps réel
