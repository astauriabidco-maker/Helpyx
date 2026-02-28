# 🔍 Agent de Découverte Réseau

> **Installation** : Machine du réseau client  
> **Package** : `agent/` dans le repo Helpyx  
> **Rôle requis** : ADMIN (pour déployer)

---

## À quoi ça sert ?

L'Agent Helpyx est un petit programme autonome qui s'installe sur UNE machine du réseau client. Il scanne le réseau local pour découvrir automatiquement tous les appareils connectés (PC, serveurs, imprimantes, switches...) et envoie l'inventaire au serveur Helpyx.

C'est l'équivalent de GLPI Agent / FusionInventory, mais en version moderne (TypeScript, CLI ergonomique).

---

## Pourquoi un agent ?

Helpyx est un SaaS hébergé dans le cloud. Il ne peut pas "voir" le réseau local de vos clients. L'agent fait le pont :

```
Réseau du client                       Cloud
┌──────────────────┐            ┌──────────────┐
│ helpyx-agent     │───HTTPS───▶│ Serveur      │
│ (sur 1 PC)       │   JSON     │ Helpyx       │
│                  │            │              │
│ • ARP Scan       │            │ Import auto  │
│ • Ping Sweep     │            │ inventaire   │
│ • Port Scan      │            │              │
└──────────────────┘            └──────────────┘
```

---

## Installation

### Méthode rapide (macOS / Linux)
```bash
curl -fsSL https://votre-helpyx.io/api/agents/download | bash
```

### Méthode manuelle
```bash
git clone https://github.com/astauriabidco-maker/Helpyx.git
cd Helpyx/agent
npm install
npx tsx src/index.ts init
```

### Windows (PowerShell)
```powershell
irm https://votre-helpyx.io/api/agents/download?format=ps1 | iex
```

---

## Configuration

Lancez `helpyx-agent init` pour configurer interactivement :

```
🔧 Configuration de l'agent Helpyx

URL du serveur Helpyx [http://localhost:4001]: https://helpyx.monentreprise.io
Token API (depuis /admin/integrations): sk-xxxxxxxxxxxxxxxx
Plage IP à scanner [192.168.1.0/24]: 10.0.0.0/24
Intervalle entre les scans (minutes) [240]: 120
Scanner les ports TCP ? (oui/non) [oui]: oui
Nombre max d'hôtes [254]: 254
```

La config est stockée dans `~/.helpyx-agent/config.json`.

---

## Commandes

| Commande | Ce qu'elle fait |
|----------|----------------|
| `helpyx-agent init` | Configuration interactive (serveur, token, plage) |
| `helpyx-agent scan` | Scan unique → affiche les résultats → envoie au serveur |
| `helpyx-agent scan --no-push` | Scan local uniquement (pas d'envoi) |
| `helpyx-agent scan -o fichier.json` | Sauvegarde les résultats en JSON |
| `helpyx-agent daemon` | Mode service continu (scan toutes les 4h) |
| `helpyx-agent status` | Affiche l'état de l'agent et teste la connexion |
| `helpyx-agent push` | Renvoie les scans en attente (mode hors-ligne) |

---

## Phases du scan

| Phase | Méthode | Temps | Détecte |
|-------|---------|-------|---------|
| 1 | **Table ARP** | ~1s | Appareils déjà connus du réseau |
| 2 | **Ping Sweep** | 5-15s | Tous les hôtes actifs (ICMP) |
| 3 | **Fusion** | instant | Merge ARP + Ping, déduplique par IP |
| 4 | **Port Scan TCP** | 5-10s | Services ouverts (SSH, HTTP, RDP, SMB...) |
| 5 | **Enrichissement** | instant | Fabricant (via MAC OUI), OS, type d'appareil |

---

## Exemple de résultat réel

```
📊 RÉSULTATS DU SCAN
  Plage scannée:  192.168.1.0/24
  Durée:          4.2s
  Hôtes trouvés:  6

  IP              MAC                Services
  192.168.1.1     68:3F:7D:...       HTTP, HTTPS     ← Routeur
  192.168.1.13    D8:61:62:...       SMB             ← PC Windows
  192.168.1.11    60:A5:E2:...       -               ← Appareil réseau
  192.168.1.12    2C:F0:EE:...       -
  192.168.1.27    32:17:AF:...       -
```

---

## Mode hors-ligne

Si le serveur Helpyx est injoignable :
1. Les résultats sont sauvegardés dans `~/.helpyx-agent/pending/`
2. Au prochain scan, l'agent tente de renvoyer les anciens résultats
3. Commande manuelle : `helpyx-agent push`

---

## Mode Daemon (service continu)

```bash
helpyx-agent daemon --interval 120
```

Le daemon :
- Exécute un scan toutes les 2h (120 min)
- Envoie les résultats automatiquement
- Envoie un heartbeat toutes les 5 minutes (signal de vie)
- Vérifie les commandes du serveur (ex: scan forcé)
- S'arrête proprement avec Ctrl+C ou SIGTERM

### Lancer en tant que service système

#### macOS (launchd)
```bash
# Créer le fichier plist
sudo cat > /Library/LaunchDaemons/com.helpyx.agent.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.helpyx.agent</string>
  <key>ProgramArguments</key>
  <array>
    <string>helpyx-agent</string>
    <string>daemon</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict>
</plist>
EOF

sudo launchctl load /Library/LaunchDaemons/com.helpyx.agent.plist
```

#### Linux (systemd)
```bash
sudo cat > /etc/systemd/system/helpyx-agent.service << EOF
[Unit]
Description=Helpyx Network Discovery Agent
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/helpyx-agent daemon
Restart=always
User=helpyx

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable helpyx-agent
sudo systemctl start helpyx-agent
```

---

## Sécurité

- L'agent **ne reçoit aucune connexion entrante** (pas de port ouvert)
- Communication sortante uniquement, via HTTPS
- Authentification par **token Bearer** (généré dans Helpyx)
- Le scan est **non-intrusif** : uniquement ARP, ICMP et TCP connect
