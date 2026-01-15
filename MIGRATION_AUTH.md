# Migration vers l'Authentification Unifiée NextAuth.js

## 🎯 Objectif

Unifier les deux systèmes d'authentification (NextAuth.js + SimpleSession) en une seule solution robuste et maintenable.

## 📋 Avantages de la migration

1. **Simplification** : Un seul système à maintenir
2. **Sécurité** : Meilleure gestion des sessions JWT
3. **Performance** : Moins de code à charger
4. **Maintenabilité** : Un seul point de mise à jour
5. **Extensibilité** : Support OAuth natif

## 🏗️ Architecture unifiée

```
src/
├── lib/
│   └── auth-unified.ts              # Configuration NextAuth unifiée
├── providers/
│   └── unified-auth-provider.tsx    # Provider unique
├── hooks/
│   └── use-unified-auth.ts          # Hook unifié
├── middleware.ts                    # Middleware mis à jour
└── app/
    ├── api/auth/[...nextauth]/      # Route NextAuth
    ├── auth/signin/
    │   └── unified-page.tsx         # Page de connexion unifiée
    └── auth-test-unified/
        └── page.tsx                 # Page de test
```

## 🔄 Étapes de migration

### 1. Fichiers créés

- ✅ `src/lib/auth-unified.ts` - Configuration NextAuth adaptative
- ✅ `src/providers/unified-auth-provider.tsx` - Provider unique
- ✅ `src/hooks/use-unified-auth.ts` - Hook unifié avec mode démo
- ✅ `src/middleware.ts` - Middleware mis à jour pour NextAuth
- ✅ `src/app/auth/signin/unified-page.tsx` - Page de connexion moderne
- ✅ `src/app/auth-test-unified/page.tsx` - Page de test complète

### 2. Modifications apportées

- ✅ `src/app/layout.tsx` - Utilise maintenant `UnifiedAuthProvider`
- ✅ `src/app/api/auth/[...nextauth]/route.ts` - Utilise `auth-unified.ts`

### 3. Étapes manuelles requises

#### a) Mettre à jour les imports dans les composants

**Avant :**
```typescript
import { useSimpleSession } from '@/providers/simple-session-provider'
```

**Après :**
```typescript
import { useUnifiedAuth } from '@/hooks/use-unified-auth'
```

#### b) Mettre à jour l'utilisation des hooks

**Avant :**
```typescript
const { user, login, logout, isLoading } = useSimpleSession()
```

**Après :**
```typescript
const { user, login, logout, isLoading, isDemoMode } = useUnifiedAuth()
```

#### c) Mettre à jour les pages de connexion

Remplacer les pages de connexion existantes par `unified-page.tsx` ou adapter le code existant pour utiliser `useUnifiedAuth`.

## 🧪 Tests de validation

### 1. Page de test

Visitez `/auth-test-unified` pour tester :

- ✅ Connexion avec comptes démo
- ✅ Affichage des informations utilisateur
- ✅ Déconnexion
- ✅ Métadonnées de session

### 2. Tests manuels

1. **Connexion** : Tester avec les 3 comptes démo
2. **Redirections** : Vérifier les redirections selon les rôles
3. **Sessions** : Vérifier la persistance des sessions
4. **Middleware** : Tester les routes protégées

### 3. Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Client | client@exemple.com | password123 |
| Agent | agent@exemple.com | password123 |
| Admin | admin@exemple.com | password123 |

## 🌍 Gestion multi-environnements

### Développement
- Comptes démo automatiquement disponibles
- Debug activé
- Sessions de 24h

### Preview (Vercel)
- Utilisateur preview automatique
- Mode démo actif
- Sessions de 24h

### Production
- Authentification complète
- Providers OAuth (Google, GitHub, Azure)
- Sessions de 1h
- bcrypt pour les mots de passe

## 📦 Variables d'environnement

```bash
# Obligatoire
NEXTAUTH_SECRET=your-secret-key

# Optionnels (OAuth)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
```

## 🗑️ Fichiers à supprimer (après validation)

```bash
# Anciens fichiers
src/lib/auth.ts
src/providers/session-provider.tsx
src/providers/simple-session-provider.tsx
src/hooks/use-simple-session.tsx
src/middleware-old.ts

# Anciennes pages (si remplacées)
src/app/auth/signin/page.tsx
```

## ⚠️ Points d'attention

1. **Sessions invalidées** : Tous les utilisateurs devront se reconnecter
2. **Tests requis** : Valider en environnement de développement d'abord
3. **Backups** : Conservez les anciens fichiers jusqu'à validation complète
4. **Déploiement** : Déployez progressivement (canary si possible)

## 🚀 Déploiement

1. **Développement** : Testez localement avec `npm run dev`
2. **Preview** : Vérifiez sur Vercel Preview
3. **Production** : Déployez après validation complète

## 📞 Support

En cas de problème :

1. Vérifiez les logs dans la console
2. Testez avec `/auth-test-unified`
3. Validez les variables d'environnement
4. Consultez les fichiers de backup si nécessaire

---

**Migration préparée avec succès ! 🎉**