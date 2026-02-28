import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/agents/download
 * 
 * Sert le script d'installation de l'agent.
 * L'admin copie la commande depuis /admin/integrations et la colle
 * sur la machine du réseau client.
 * 
 * Utilisation:
 *   curl -fsSL https://helpyx.io/api/agents/download?format=sh | bash
 *   curl -fsSL https://helpyx.io/api/agents/download?format=ps1 | powershell
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'sh';
    const token = searchParams.get('token') || '';
    const serverUrl = `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;

    if (format === 'ps1') {
        // Script PowerShell pour Windows
        const ps1Script = generatePowershellInstaller(serverUrl, token);
        return new NextResponse(ps1Script, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Content-Disposition': 'attachment; filename="install-helpyx-agent.ps1"',
            },
        });
    }

    // Script Bash pour macOS / Linux
    const bashScript = generateBashInstaller(serverUrl, token);
    return new NextResponse(bashScript, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': 'attachment; filename="install-helpyx-agent.sh"',
        },
    });
}

function generateBashInstaller(serverUrl: string, token: string): string {
    return `#!/bin/bash
# ╔══════════════════════════════════════════════╗
# ║  Helpyx Agent — Installation automatique     ║
# ╚══════════════════════════════════════════════╝
set -e

echo ""
echo "🔍 Installation de Helpyx Agent..."
echo "   Serveur: ${serverUrl}"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ requis. Installez-le depuis https://nodejs.org"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Créer un dossier temporaire
TMPDIR=$(mktemp -d)
cd "$TMPDIR"

# Cloner uniquement le dossier agent
if command -v git &> /dev/null; then
    git clone --depth 1 --filter=blob:none --sparse https://github.com/astauriabidco-maker/Helpyx.git helpyx 2>/dev/null
    cd helpyx
    git sparse-checkout set agent 2>/dev/null
    cd agent
else
    echo "❌ git requis. Installez-le avec: brew install git (macOS) ou apt install git (Linux)"
    exit 1
fi

# Installer
npm install --production 2>/dev/null
npx tsc 2>/dev/null || true
npm install -g . 2>/dev/null || sudo npm install -g .

# Configurer automatiquement si token fourni
${token ? `
mkdir -p $HOME/.helpyx-agent
SUBNET=$(node -e "const os=require('os');for(const[n,a]of Object.entries(os.networkInterfaces())){if(!a||n==='lo'||n==='lo0')continue;for(const i of a){if(i.family==='IPv4'&&!i.internal){const p=i.address.split('.');console.log(p[0]+'.'+p[1]+'.'+p[2]+'.0/24');process.exit(0)}}}console.log('192.168.1.0/24')")
cat > $HOME/.helpyx-agent/config.json << EOF
{"serverUrl":"${serverUrl}","apiToken":"${token}","scanInterval":240,"scanRange":"$SUBNET","scanPorts":true,"maxHosts":254,"verbose":false}
EOF
echo "✅ Configuré automatiquement"
` : ''}

# Nettoyage
cd / && rm -rf "$TMPDIR"

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║       ✅ HELPYX AGENT INSTALLÉ !             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  helpyx-agent init    → Configurer"
echo "  helpyx-agent scan    → Scanner le réseau"
echo "  helpyx-agent daemon  → Mode service"
echo ""
${token ? 'echo "Agent pré-configuré. Lancez: helpyx-agent scan"' : 'echo "Lancez: helpyx-agent init"'}
`;
}

function generatePowershellInstaller(serverUrl: string, token: string): string {
    return `# Helpyx Agent — Installation Windows (PowerShell)
# Exécutez ce script en tant qu'Administrateur

Write-Host ""
Write-Host "🔍 Installation de Helpyx Agent..." -ForegroundColor Cyan
Write-Host "   Serveur: ${serverUrl}"
Write-Host ""

# Vérifier Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 18+ requis. Téléchargez-le depuis https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Dossier temporaire
$tmpDir = Join-Path $env:TEMP "helpyx-agent-install"
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null
Set-Location $tmpDir

# Cloner
git clone --depth 1 https://github.com/astauriabidco-maker/Helpyx.git helpyx 2>$null
Set-Location helpyx\\agent

# Installer
npm install --production 2>$null
npx tsc 2>$null
npm install -g . 2>$null

${token ? `
# Configuration automatique
$configDir = Join-Path $env:USERPROFILE ".helpyx-agent"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null
@"
{"serverUrl":"${serverUrl}","apiToken":"${token}","scanInterval":240,"scanPorts":true,"maxHosts":254,"verbose":false}
"@ | Set-Content (Join-Path $configDir "config.json")
Write-Host "✅ Configuré automatiquement" -ForegroundColor Green
` : ''}

# Nettoyage
Set-Location $env:USERPROFILE
Remove-Item -Recurse -Force $tmpDir 2>$null

Write-Host ""
Write-Host "✅ HELPYX AGENT INSTALLÉ !" -ForegroundColor Green
Write-Host ""
Write-Host "  helpyx-agent init    -> Configurer"
Write-Host "  helpyx-agent scan    -> Scanner le réseau"  
Write-Host "  helpyx-agent daemon  -> Mode service"
Write-Host ""
`;
}
