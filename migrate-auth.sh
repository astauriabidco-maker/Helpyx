#!/bin/bash

# Script de migration vers l'authentification unifiée NextAuth.js
# Ce script aide à migrer depuis le système double (NextAuth + SimpleSession)

echo "🚀 Migration vers l'authentification unifiée NextAuth.js"
echo "=========================================================="

# Vérifier si nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

# Créer des sauvegardes
echo "📦 Création des sauvegardes..."
backup_dir="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$backup_dir"

# Sauvegarder les fichiers d'authentification existants
files_to_backup=(
    "src/lib/auth.ts"
    "src/middleware.ts"
    "src/providers/session-provider.tsx"
    "src/providers/simple-session-provider.tsx"
    "src/hooks/use-simple-session.tsx"
)

for file in "${files_to_backup[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$backup_dir/"
        echo "✅ Sauvegardé: $file"
    fi
done

echo ""
echo "🔧 Étapes de migration manuelles:"
echo "================================="

echo ""
echo "1. Mettre à jour les imports dans les composants:"
echo "   Remplacer:"
echo "   import { useSimpleSession } from '@/providers/simple-session-provider'"
echo "   Par:"
echo "   import { useUnifiedAuth } from '@/hooks/use-unified-auth'"

echo ""
echo "2. Mettre à jour l'utilisation des hooks:"
echo "   Remplacer:"
echo "   const { user, login, logout, isLoading } = useSimpleSession()"
echo "   Par:"
echo "   const { user, login, logout, isLoading } = useUnifiedAuth()"

echo ""
echo "3. Mettre à jour les pages de connexion:"
echo "   Utiliser /auth/signin/unified-page.tsx comme modèle"

echo ""
echo "4. Vérifier les variables d'environnement:"
echo "   NEXTAUTH_SECRET doit être configuré"
echo "   Les providers OAuth sont optionnels en développement"

echo ""
echo "5. Tester la migration:"
echo "   - Visiter /auth-test-unified pour tester"
echo "   - Vérifier la connexion avec les comptes démo"
echo "   - Tester les redirections selon les rôles"

echo ""
echo "📁 Fichiers créés par la migration:"
echo "=================================="
echo "✅ src/lib/auth-unified.ts - Configuration NextAuth unifiée"
echo "✅ src/providers/unified-auth-provider.tsx - Provider unique"
echo "✅ src/hooks/use-unified-auth.ts - Hook unifié"
echo "✅ src/middleware.ts - Middleware mis à jour"
echo "✅ src/app/auth/signin/unified-page.tsx - Page de connexion unifiée"
echo "✅ src/app/auth-test-unified/page.tsx - Page de test"

echo ""
echo "🧪 Fichiers à supprimer après validation:"
echo "======================================="
echo "src/lib/auth.ts (ancien)"
echo "src/providers/session-provider.tsx"
echo "src/providers/simple-session-provider.tsx"
echo "src/hooks/use-simple-session.tsx"
echo "src/middleware-old.ts"

echo ""
echo "⚠️  Points d'attention:"
echo "===================="
echo "- Les sessions existantes seront invalidées"
echo "- Les utilisateurs devront se reconnecter"
echo "- Testez bien en environnement de développement avant"

echo ""
echo "🎉 Migration préparée avec succès!"
echo "================================="
echo "Prochaine étape: Tester avec /auth-test-unified"
echo "Sauvegardes créées dans: $backup_dir"