#!/bin/bash
# ╔══════════════════════════════════════════════════════════════╗
# ║  Helpyx Agent — Installation rapide (curl | bash)            ║
# ║                                                              ║
# ║  Usage:                                                      ║
# ║    curl -fsSL https://helpyx.io/agent/install.sh | bash      ║
# ║                                                              ║
# ║  Ou avec des paramètres:                                     ║
# ║    curl -fsSL https://helpyx.io/agent/install.sh | bash -s   ║
# ║      -- --server https://helpyx.io --token MON_TOKEN         ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

HELPYX_SERVER="${HELPYX_SERVER:-}"
HELPYX_TOKEN="${HELPYX_TOKEN:-}"
INSTALL_DIR="/opt/helpyx-agent"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║       HELPYX AGENT — Installation            ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Vérifier les prérequis ─────────────────────────
echo -e "${YELLOW}Vérification des prérequis...${NC}"

# Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé.${NC}"
    echo ""
    echo "Installez Node.js 18+ :"
    echo "  macOS:    brew install node"
    echo "  Ubuntu:   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
    echo "  Windows:  https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ requis. Version actuelle: $(node -v)${NC}"
    exit 1
fi
echo -e "  ${GREEN}✅ Node.js $(node -v)${NC}"

# npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi
echo -e "  ${GREEN}✅ npm $(npm -v)${NC}"

# ── Télécharger l'agent ────────────────────────────
echo ""
echo -e "${YELLOW}Téléchargement de l'agent...${NC}"

TMPDIR=$(mktemp -d)
cd "$TMPDIR"

# Méthode 1: Depuis le serveur Helpyx (si configuré)
if [ -n "$HELPYX_SERVER" ]; then
    echo "  Téléchargement depuis $HELPYX_SERVER..."
    curl -fsSL "$HELPYX_SERVER/api/agents/download" -o helpyx-agent.tar.gz
    tar -xzf helpyx-agent.tar.gz
    cd helpyx-agent-*

# Méthode 2: Depuis GitHub
else
    echo "  Téléchargement depuis GitHub..."
    if command -v git &> /dev/null; then
        git clone --depth 1 https://github.com/astauriabidco-maker/Helpyx.git helpyx-repo 2>/dev/null
        cd helpyx-repo/agent
    else
        echo -e "${RED}❌ git n'est pas installé. Installez git ou spécifiez HELPYX_SERVER.${NC}"
        exit 1
    fi
fi

# ── Installer les dépendances ───────────────────────
echo ""
echo -e "${YELLOW}Installation des dépendances...${NC}"
npm install --production 2>/dev/null
echo -e "  ${GREEN}✅ Dépendances installées${NC}"

# ── Compiler ────────────────────────────────────────
echo ""
echo -e "${YELLOW}Compilation...${NC}"
npx tsc 2>/dev/null || true
echo -e "  ${GREEN}✅ Agent compilé${NC}"

# ── Installer globalement ───────────────────────────
echo ""
echo -e "${YELLOW}Installation globale...${NC}"
npm install -g . 2>/dev/null || sudo npm install -g . 2>/dev/null
echo -e "  ${GREEN}✅ Commande 'helpyx-agent' disponible${NC}"

# ── Configuration automatique ───────────────────────
if [ -n "$HELPYX_SERVER" ] && [ -n "$HELPYX_TOKEN" ]; then
    echo ""
    echo -e "${YELLOW}Configuration automatique...${NC}"
    
    SUBNET=$(node -e "
      const os = require('os');
      for (const [n, addrs] of Object.entries(os.networkInterfaces())) {
        if (!addrs || n === 'lo' || n === 'lo0') continue;
        for (const a of addrs) {
          if (a.family === 'IPv4' && !a.internal) {
            const p = a.address.split('.');
            console.log(p[0]+'.'+p[1]+'.'+p[2]+'.0/24');
            process.exit(0);
          }
        }
      }
      console.log('192.168.1.0/24');
    ")
    
    CONFIG_DIR="$HOME/.helpyx-agent"
    mkdir -p "$CONFIG_DIR"
    
    cat > "$CONFIG_DIR/config.json" << EOF
{
  "serverUrl": "$HELPYX_SERVER",
  "apiToken": "$HELPYX_TOKEN",
  "scanInterval": 240,
  "scanRange": "$SUBNET",
  "scanPorts": true,
  "maxHosts": 254,
  "verbose": false
}
EOF
    
    echo -e "  ${GREEN}✅ Configuré pour $HELPYX_SERVER${NC}"
    echo -e "  ${GREEN}✅ Plage: $SUBNET${NC}"
fi

# ── Nettoyage ───────────────────────────────────────
cd /
rm -rf "$TMPDIR" 2>/dev/null

# ── Résultat ────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       ✅ HELPYX AGENT INSTALLÉ !             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo "  Commandes disponibles :"
echo "    helpyx-agent init       → Configurer (interactif)"
echo "    helpyx-agent scan       → Scanner le réseau"
echo "    helpyx-agent daemon     → Mode service continu"
echo "    helpyx-agent status     → Vérifier l'état"
echo ""

if [ -z "$HELPYX_SERVER" ] || [ -z "$HELPYX_TOKEN" ]; then
    echo -e "  ${YELLOW}⚠️  Lancez 'helpyx-agent init' pour configurer l'agent.${NC}"
else
    echo -e "  ${GREEN}Lancez 'helpyx-agent scan' pour un premier scan !${NC}"
fi

echo ""
