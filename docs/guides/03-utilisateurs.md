# 👥 Gestion des Utilisateurs

> **Route** : `/admin/users`  
> **Rôle requis** : ADMIN  
> **Composant** : Page admin users

---

## À quoi ça sert ?

Gérer les comptes utilisateurs de votre entreprise : créer des agents, inviter des clients, attribuer des rôles et suivre l'activité.

---

## Ajouter un utilisateur

1. Cliquer sur **"Ajouter un utilisateur"**
2. Remplir : Nom, Email, Rôle
3. Un email d'invitation est envoyé automatiquement
4. L'utilisateur clique sur le lien pour définir son mot de passe

---

## Rôles et permissions

| Rôle | Peut faire |
|------|-----------|
| **ADMIN** | Tout : paramètres, utilisateurs, facturation, modules avancés |
| **AGENT** | Gérer les tickets, inventaire, KB, voir le dashboard agent |
| **CLIENT** | Créer des tickets, consulter ses tickets, lire la KB |

---

## Actions sur un utilisateur

| Action | Description |
|--------|-------------|
| **Modifier** | Changer le rôle, l'email, le nom |
| **Désactiver** | Bloquer temporairement l'accès (sans supprimer) |
| **Supprimer** | Supprimer définitivement le compte |
| **Réinitialiser le mot de passe** | Envoie un email de réinitialisation |
| **Voir l'activité** | Historique des connexions et actions |
