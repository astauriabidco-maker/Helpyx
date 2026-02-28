# 🏥 Audit Matériel — Diagnostic de santé PC

> **Localisation** : Via l'agent CLI (`helpyx-agent audit`) + UI Dashboard  
> **API** : `POST /api/audit`, `GET /api/audit`  
> **Composants** : `agent/src/auditor.ts`, `src/components/audit/audit-report.tsx`

---

## À quoi ça sert ?

L'audit matériel permet de **scanner l'état de santé** de chaque composant d'un PC reconditionné :

| Composant | Ce qu'on mesure | Score |
|-----------|----------------|-------|
| 🔵 **CPU** | Modèle, cœurs, fréquence, température | 0-100 |
| 🟢 **RAM** | Capacité, type (DDR4/5), vitesse, erreurs mémoire | 0-100 |
| 🟡 **SSD/HDD** | Santé SMART, TBW (données écrites), secteurs défectueux, vitesse r/w | 0-100 |
| 🔴 **Batterie** | Cycles de charge, capacité restante vs design original | 0-100 |
| 🖥️ **Écran** | Résolution, type (IPS/TN/OLED), pixels morts | 0-100 |
| 🎮 **GPU** | Modèle, VRAM, température | 0-100 |
| 🌐 **Réseau** | Type (WiFi/Ethernet), latence, vitesse | 0-100 |
| ⌨️ **Clavier** | Test fonctionnel | 0-100 |
| 🔌 **USB/Webcam/Audio** | Détection des périphériques | 0-100 |

Le **score global** est une moyenne pondérée (le SSD et la batterie pèsent plus lourd).

---

## Comment l'utiliser

### 1. Via l'agent CLI (sur le PC à tester)

```bash
# Audit rapide
helpyx-agent audit

# Audit détaillé avec sauvegarde
helpyx-agent audit --verbose --output rapport.json

# Audit lié à un équipement de l'inventaire
helpyx-agent audit --inventory-id "clw1234567890"
```

**Résultat dans le terminal :**

```
╔══════════════════════════════════════════════╗
║       HELPYX AGENT — Audit Matériel          ║
╚══════════════════════════════════════════════╝

🔬 Démarrage de l'audit matériel complet...

  ✅ CPU:      85/100
  ✅ RAM:      90/100
  ✅ SSD:      78/100
  ✅ Batterie: 62/100
  ✅ GPU:      85/100
  ✅ Écran:    85/100
  ✅ Réseau:   95/100
  ✅ KEYBOARD  90/100
  ✅ USB       90/100
  ✅ WEBCAM    90/100
  ✅ AUDIO     90/100

══════════════════════════════════════════════
🏥 RAPPORT DE SANTÉ MATÉRIEL
══════════════════════════════════════════════
  Machine:     Lenovo ThinkPad T480
  N° série:    PF1234AB
  OS:          Darwin 24.3.0
  Durée audit: 3.2s

  Score global: ████████████████░░░░ 82/100
  Verdict:      🔵 BON

  Composant      Score  Status
  ───────────── ────── ──────────
  CPU            85/100 ████████░░ ✅ Intel Core i5-8350U
  RAM            90/100 █████████░ ✅ 16 Go DDR4
  SSD            78/100 ████████░░ ✅ Samsung 860 EVO 256GB
  BATTERY        62/100 ██████░░░░ ⚠️ 62% — 487 cycles
  GPU            85/100 ████████░░ ✅ Intel UHD 620
  SCREEN         85/100 ████████░░ ✅ 1920x1080 IPS
  NETWORK        95/100 █████████░ ✅ Ethernet (1000 Mbps)
  KEYBOARD       90/100 █████████░ ✅ Clavier intégré
  USB            90/100 █████████░ ✅ 4 périphérique(s)
  ───────────── ────── ──────────
```

### 2. Via l'API

```bash
# Obtenir tous les audits
GET /api/audit?companyId=xxx

# Obtenir un audit spécifique
GET /api/audit?id=xxx

# Audits par numéro de série
GET /api/audit?serialNumber=PF1234AB

# Audits d'un équipement
GET /api/audit?inventoryId=xxx
```

---

## Verdicts

| Score | Verdict | Signification | Action |
|-------|---------|---------------|--------|
| 90-100 | 🟢 **EXCELLENT** | Comme neuf | Vente directe Grade A |
| 70-89 | 🔵 **BON** | Très bon état | Vente Grade A/B |
| 50-69 | 🟡 **CORRECT** | Usure normale | Vente Grade B/C, vérifier composants |
| 30-49 | 🟠 **ATTENTION** | Composants dégradés | Réparation avant vente |
| 0-29 | 🔴 **CRITIQUE** | Défaillance(s) | Remise en état ou pièces détachées |

---

## Pondération des composants

Les composants les plus importants pèsent plus dans le score global :

| Composant | Poids |
|-----------|-------|
| SSD/HDD | 20 |
| Batterie | 20 |
| CPU | 15 |
| RAM | 15 |
| Écran | 10 |
| Ventilation | 5 |
| GPU | 5 |
| Réseau | 5 |
| Clavier/Touchpad | 3 chacun |
| USB/Webcam/Audio | 1-2 |

---

## Cas d'usage

### Avant la vente
1. Le technicien lance `helpyx-agent audit` sur le PC
2. Le rapport montre que la batterie est à 45% → **Remplacement recommandé**
3. Après remplacement → Nouveau score **92/100** → Grade A ✅

### Transparence client
Le rapport d'audit peut être **montré au client** comme certificat de qualité, renforçant la confiance dans le matériel reconditionné.

### Suivi dans le temps
Pour un même numéro de série, on peut comparer les audits successifs et **détecter la dégradation** d'un composant.
