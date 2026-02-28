# 🔍 Helpyx Agent — Network Discovery Agent

Agent de découverte réseau autonome pour la plateforme **Helpyx ITSM**.  
S'installe sur **une seule machine** du réseau client, scanne le réseau local, et envoie l'inventaire au serveur Helpyx.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────┐
│             RÉSEAU DU CLIENT                    │
│                                                  │
│   PC  ──┐                                        │
│   Srv ──┤                                        │
│   AP  ──┼── Réseau local (192.168.x.x)          │
│   Prn ──┤                                        │
│   IoT ──┘                                        │
│          ↑                                       │
│   ┌──────┴──────────────────┐                    │
│   │ helpyx-agent            │                    │
│   │                         │                    │
│   │ Phase 1: ARP Table      │                    │
│   │ Phase 2: Ping Sweep     │                    │
│   │ Phase 3: Port Scan TCP  │                    │
│   │ Phase 4: DNS Reverse    │                    │
│   │ Phase 5: OS Guessing    │                    │
│   └──────┬──────────────────┘                    │
│          │ HTTPS (JSON)                          │
└──────────┼───────────────────────────────────────┘
           ▼
   ┌───────────────────┐
   │ Serveur Helpyx    │
   │ POST /api/agents/ │
   │ scan-results      │
   │                   │
   │ → Import auto     │
   │   dans inventaire │
   └───────────────────┘
```

---

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/astauriabidco-maker/Helpyx.git
cd Helpyx/agent

# Installer les dépendances
npm install

# Configurer l'agent
npm run dev -- init
```

### Installation globale (production)
```bash
cd agent
npm run build
npm install -g .

# L'agent est maintenant disponible en tant que commande globale
helpyx-agent init
```

---

## 🚀 Utilisation

### Configuration initiale
```bash
helpyx-agent init
```
Vous serez guidé pour configurer :
- URL du serveur Helpyx
- Token API (généré dans `/admin/integrations`)
- Plage IP à scanner
- Intervalle entre les scans

La configuration est sauvegardée dans `~/.helpyx-agent/config.json`.

### Scan unique
```bash
# Scan avec la config par défaut
helpyx-agent scan

# Scan d'une plage spécifique
helpyx-agent scan --range 10.0.1.0/24

# Scan sans envoi au serveur (affichage local)
helpyx-agent scan --no-push

# Sauvegarder en JSON
helpyx-agent scan -o results.json

# Logs détaillés
helpyx-agent scan -v
```

### Mode Daemon (service continu)
```bash
# Lancer en tant que service (scan toutes les 4h par défaut)
helpyx-agent daemon

# Avec un intervalle personnalisé (toutes les 30 minutes)
helpyx-agent daemon --interval 30
```

### Vérifier le statut
```bash
helpyx-agent status
```

### Renvoyer les scans en attente
```bash
helpyx-agent push
```

---

## 🔧 Commandes

| Commande | Description |
|----------|-------------|
| `helpyx-agent init` | Configuration interactive |
| `helpyx-agent scan` | Scan réseau unique |
| `helpyx-agent daemon` | Mode service (scans périodiques) |
| `helpyx-agent status` | État de l'agent + test connexion |
| `helpyx-agent push` | Renvoyer les résultats en attente |

---

## 📡 Méthodes de Découverte

| Phase | Méthode | Ce qu'elle détecte | Temps |
|-------|---------|-------------------|-------|
| 1 | **Table ARP** | Appareils déjà connus du réseau | ~1s |
| 2 | **Ping Sweep** | Tous les hôtes actifs (ICMP) | ~5-15s |
| 3 | **Port Scan TCP** | Services ouverts (SSH, HTTP, RDP...) | ~5-10s |
| 4 | **DNS Reverse** | Noms d'hôtes | intégré |
| 5 | **OS Guessing** | Système d'exploitation | intégré |

### Ports scannés par défaut
`22 (SSH), 80 (HTTP), 443 (HTTPS), 445 (SMB), 3389 (RDP), 9100 (Imprimante), 631 (CUPS), 8080 (HTTP-Alt), 161 (SNMP), 5900 (VNC)`

### Fabricants reconnus (par préfixe MAC OUI)
Dell, Apple, HP/HPE, Cisco, VMware, Google, Microsoft, TP-Link, Ubiquiti, Synology, Raspberry Pi, QNAP, VirtualBox, QEMU/KVM, Hyper-V

---

## 🔒 Sécurité

- **Authentification** : Token API Bearer transmis dans chaque requête
- **Chiffrement** : HTTPS en production
- **Stockage local** : Config dans `~/.helpyx-agent/` (permissions user)
- **Pas d'écoute** : L'agent n'ouvre aucun port. Il se connecte uniquement au serveur (push + pull)
- **Scan non-intrusif** : Uniquement ARP/ICMP/TCP connect (pas d'exploitation)

---

## 📁 Structure

```
agent/
├── package.json          # Dépendances (commander, node-fetch)
├── tsconfig.json         # Config TypeScript (cible Node.js)
├── README.md             # Ce fichier
└── src/
    ├── index.ts          # CLI (commander) — point d'entrée
    ├── scanner.ts        # Moteur de scan (ARP, Ping, Ports, DNS)
    └── client.ts         # Client API Helpyx (auth, push, retry)
```

---

## 🖥️ Systèmes supportés

| OS | Support | Commande ARP | Notes |
|----|---------|-------------|-------|
| **macOS** | ✅ | `arp -a` | Testé |
| **Linux** | ✅ | `ip neigh` / `arp -n` | Testé |
| **Windows** | ✅ | `arp -a` | Format différent, supporté |

---

## 🔄 Mode hors-ligne

Si le serveur Helpyx est injoignable :
1. Les résultats sont sauvegardés dans `~/.helpyx-agent/pending/`
2. Au prochain scan, l'agent tente d'abord de renvoyer les résultats en attente
3. Commande manuelle : `helpyx-agent push`

---

## 🐳 Déploiement Docker (optionnel)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY agent/ ./
RUN npm install && npm run build
CMD ["node", "dist/index.js", "daemon"]
```

```bash
docker run -d \
  --name helpyx-agent \
  --network host \
  -e HELPYX_SERVER=https://helpyx.io \
  -e HELPYX_TOKEN=xxx \
  helpyx-agent
```
