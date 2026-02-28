# 📖 Base de Connaissances (KB)

> **Route** : `/admin/articles`  
> **Rôle requis** : Tous (lecture) · ADMIN, AGENT (écriture)  
> **Composant** : `knowledge-base.tsx`

---

## À quoi ça sert ?

La base de connaissances est une bibliothèque d'articles qui documentent les procédures, les solutions aux problèmes courants, et les tutoriels. Elle permet aux agents de résoudre plus vite et aux clients de trouver des réponses en libre-service.

---

## Consulter un article

- Utiliser la **barre de recherche** pour trouver un article par mot-clé
- Parcourir les **catégories** : Réseau, Logiciel, Matériel, Sécurité, Procédures...
- Chaque article affiche : titre, contenu formatté (Markdown), auteur, date, nombre de vues

---

## Rédiger un article

1. Cliquer **"Nouvel article"**
2. Remplir :
   - **Titre** : Clair et recherchable (ex: "Comment réinitialiser un mot de passe Active Directory")
   - **Catégorie** : Choisir dans la liste
   - **Contenu** : Éditeur Markdown riche (titres, listes, code, images)
   - **Tags** : Mots-clés pour faciliter la recherche
   - **Visibilité** : Public (clients) ou Interne (agents uniquement)
3. **Prévisualiser** puis **Publier**

---

## Lien avec les tickets

Quand l'IA détecte qu'un article KB existant répond à un ticket, elle le suggère automatiquement à l'agent. L'agent peut alors :
- Envoyer le lien de l'article au client en un clic
- Marquer le ticket comme "Résolu par KB"

---

## Impact sur la Gamification

Rédiger un article KB rapporte des **points XP** dans le système de Gamification :
- 📝 Nouvel article publié : **+50 XP**
- ⭐ Article utile (marqué par un agent) : **+25 XP**
