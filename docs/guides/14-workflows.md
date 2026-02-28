# ⚡ Workflow Builder (Automatisations No-Code)

> **Route** : `/admin/workflows`  
> **Rôle requis** : ADMIN  
> **Technologie** : @xyflow/react (ReactFlow)

---

## À quoi ça sert ?

Le Workflow Builder permet de créer des automatisations visuellement, sans écrire de code. Vous définissez des règles "Si X alors Y" avec un éditeur Drag & Drop.

---

## Concepts clés

### Blocs (Nœuds)

| Type | Couleur | Description | Exemples |
|------|---------|-------------|----------|
| **Déclencheur** | 🟢 Vert | L'événement qui démarre le workflow | Nouveau ticket, SLA dépassé, Ticket critique |
| **Condition** | 🟡 Jaune | Un test vrai/faux | Priorité = Critique ?, Catégorie = Réseau ? |
| **Action** | 🔵 Bleu | Ce qui est exécuté | Assigner à l'agent N2, Envoyer un SMS, Changer la priorité |

### Connexions (Arêtes)
Les flèches relient les blocs entre eux. Une condition a deux sorties : **Oui** et **Non**.

---

## Créer un workflow

1. Aller dans `/admin/workflows`
2. Cliquer **"Nouveau Workflow"**
3. **Glisser-déposer** les blocs depuis la palette de gauche
4. **Relier** les blocs avec des flèches
5. **Configurer** chaque bloc (cliquer dessus pour ouvrir les options)
6. **Nommer** le workflow
7. **Activer** le workflow

---

## Exemples de workflows

### Escalade automatique des tickets critiques
```
[Nouveau Ticket Créé]
        ↓
[Priorité = Critique ?]
   Oui ↓          Non ↓
[Assigner N2]    [Rien]
   ↓
[Envoyer SMS Manager]
   ↓
[Créer alerte Slack]
```

### Auto-réponse KB
```
[Nouveau Ticket Créé]
        ↓
[Article KB trouvé ?]
   Oui ↓              Non ↓
[Envoyer article      [Assigner à
 au client]            la file d'attente]
   ↓
[Marquer "En attente
 validation client"]
```

### Relance SLA
```
[SLA bientôt dépassé (80%)]
        ↓
[Envoyer rappel à l'agent]
        ↓
[Si SLA dépassé]
        ↓
[Escalader au manager]
   ↓
[Envoyer email au client avec excuses]
```

---

## Actions disponibles

| Action | Description |
|--------|-------------|
| Assigner à un agent | Choisir un agent spécifique ou "prochain disponible" |
| Changer la priorité | Augmenter ou diminuer la priorité |
| Changer le statut | Passer en "En cours", "En attente", etc. |
| Envoyer un email | Email au client ou à l'agent avec template |
| Envoyer un SMS | Via Twilio (si configuré) |
| Envoyer sur Slack | Message dans un channel Slack |
| Ajouter un commentaire | Commentaire interne automatique |
| Créer un sous-ticket | Ticket enfant lié au ticket parent |
| Webhook | Appeler une URL externe |
