#!/bin/bash
# ╔══════════════════════════════════════════════╗
# ║  Helpyx Agent — Script de packaging          ║
# ║  Crée un tarball distribuable de l'agent     ║
# ╚══════════════════════════════════════════════╝

set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
VERSION=$(node -p "require('./package.json').version")
OUTPUT_DIR="$SCRIPT_DIR/dist-package"
ARCHIVE_NAME="helpyx-agent-v${VERSION}"

echo "📦 Packaging Helpyx Agent v${VERSION}..."
echo ""

# Nettoyer
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/$ARCHIVE_NAME"

# Compiler TypeScript
echo "🔨 Compilation TypeScript..."
npx tsc

# Copier les fichiers nécessaires
echo "📋 Copie des fichiers..."
cp -r dist/ "$OUTPUT_DIR/$ARCHIVE_NAME/dist/"
cp package.json "$OUTPUT_DIR/$ARCHIVE_NAME/"
cp README.md "$OUTPUT_DIR/$ARCHIVE_NAME/"

# Créer un package.json allégé (sans devDependencies)
node -e "
const pkg = require('./package.json');
delete pkg.devDependencies;
delete pkg.scripts.dev;
pkg.scripts.start = 'node dist/index.js';
require('fs').writeFileSync(
  '$OUTPUT_DIR/$ARCHIVE_NAME/package.json',
  JSON.stringify(pkg, null, 2)
);
"

# Créer le script d'installation
cat > "$OUTPUT_DIR/$ARCHIVE_NAME/install.sh" << 'INSTALL_SCRIPT'
#!/bin/bash
# Helpyx Agent — Script d'installation rapide
set -e

echo "🔧 Installation de Helpyx Agent..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installez-le depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Installer les dépendances
npm install --production

# Installer globalement
npm install -g .

echo ""
echo "✅ Helpyx Agent installé !"
echo ""
echo "Commandes disponibles :"
echo "  helpyx-agent init       → Configurer l'agent"
echo "  helpyx-agent scan       → Scanner le réseau"
echo "  helpyx-agent daemon     → Mode service"
echo "  helpyx-agent status     → Vérifier l'état"
echo ""
echo "Lancez 'helpyx-agent init' pour commencer."
INSTALL_SCRIPT

chmod +x "$OUTPUT_DIR/$ARCHIVE_NAME/install.sh"

# Windows batch
cat > "$OUTPUT_DIR/$ARCHIVE_NAME/install.bat" << 'INSTALL_BAT'
@echo off
echo Installing Helpyx Agent...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed. Download it from https://nodejs.org
    pause
    exit /b 1
)

echo Node.js found: 
node -v

npm install --production
npm install -g .

echo.
echo Helpyx Agent installed!
echo Run: helpyx-agent init
pause
INSTALL_BAT

# Créer les archives
echo "📦 Création des archives..."
cd "$OUTPUT_DIR"

# tar.gz (Linux / macOS)
tar -czf "${ARCHIVE_NAME}.tar.gz" "$ARCHIVE_NAME/"
echo "  ✅ ${ARCHIVE_NAME}.tar.gz"

# zip (Windows)
if command -v zip &> /dev/null; then
    zip -rq "${ARCHIVE_NAME}.zip" "$ARCHIVE_NAME/"
    echo "  ✅ ${ARCHIVE_NAME}.zip"
fi

# Taille
echo ""
echo "📊 Résultat :"
ls -lh "${ARCHIVE_NAME}".*
echo ""
echo "🎉 Packaging terminé !"
echo "   Les archives sont dans: $OUTPUT_DIR/"
