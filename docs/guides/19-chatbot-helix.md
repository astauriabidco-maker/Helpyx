# 🤖 Chatbot Helix — Assistant IA

> **Localisation** : Widget flottant en bas à droite (toutes les pages)  
> **Rôle requis** : Tous (même sans être connecté)  
> **Composants** : `chatbot-widget.tsx`, `chatbot-engine.ts`, `/api/chatbot`

---

## À quoi ça sert ?

**Helix** est un assistant IA conversationnel disponible 24/7 qui :
- Résout les problèmes courants **sans intervention humaine** (L1 automatisé)
- Guide l'utilisateur étape par étape avec des arbres de diagnostic
- Crée automatiquement un **ticket pré-rempli** s'il ne peut pas résoudre le problème
- Réduit le volume de tickets L1 de **30 à 50%**

---

## Comment l'utiliser

1. Cliquer sur la **bulle bleue/violette** en bas à droite 💬
2. Décrire votre problème en français (ex: "Mon imprimante ne marche plus")
3. Helix identifie le type de problème et lance un **diagnostic guidé**
4. Suivez les étapes en cliquant sur les **boutons suggérés**
5. Si le problème est résolu → 🎉 Terminé !
6. Si non → Helix crée un ticket automatiquement avec tout le contexte

---

## Problèmes que Helix peut résoudre

| Catégorie | Exemples | Taux de résolution estimé |
|-----------|----------|--------------------------|
| 🖨️ **Imprimante** | N'imprime plus, bourrage, qualité | ~60% |
| 🌐 **Réseau** | Pas d'internet, WiFi, VPN, lenteur | ~40% |
| 🔑 **Mot de passe** | Oublié, réinitialisation, compte bloqué | ~70% |
| 📧 **Email** | Plus de réception, envoi, pièces jointes | ~50% |
| 💻 **Logiciel** | Crash, installation, mise à jour | ~45% |
| 🖥️ **Matériel** | PC, écran, clavier, batterie | ~35% |
| 📦 **Demande** | Nouveau PC, écran, téléphone | → Ticket auto |

---

## Flux de diagnostic (exemple : imprimante)

```
Utilisateur: "Mon imprimante ne marche plus"
    ↓
Helix: "Quel est le problème exact ?"
  [🚫 N'imprime plus] [📄 Bourrage] [🎨 Qualité] [⚠️ Erreur]
    ↓ (clic)
Helix: "L'imprimante est-elle allumée, voyant vert ?"
  [✅ Oui] [❌ Non] [🟠 Orange]
    ↓ (clic "Non")
Helix: "Allumez l'imprimante et vérifiez. C'est résolu ?"
  [✅ Oui !] → 🎉 Résolu sans ticket
  [❌ Non]  → 🎫 Ticket créé automatiquement
```

---

## Escalade automatique

Si Helix ne peut pas résoudre :
1. Il résume **tout le contexte** de la conversation
2. Il crée un ticket avec :
   - La catégorie détectée
   - Les étapes de diagnostic déjà tentées
   - L'historique complet de la conversation
3. Un agent reçoit le ticket **pré-qualifié** → gain de temps

---

## Fonctionnalités UX

- 🌗 **Dark mode** supporté
- 📱 **Responsive** (mobile/tablette)
- ⏳ **Animation de frappe** (3 points qui rebondissent)
- 🔘 **Boutons cliquables** pour les réponses rapides
- ⭐ **Notation** de la conversation
- ✨ **Nouvelle conversation** (bouton étoile)
- 📌 **Minimisable** (barre de titre cliquable)

---

## Stats pour l'Admin

Endpoint : `GET /api/chatbot`

Retourne :
- Nombre total de conversations
- Taux de résolution (sans escalade)
- Taux d'escalade (tickets créés)
- Nombre moyen de messages par conversation
- Historique des 10 dernières conversations
