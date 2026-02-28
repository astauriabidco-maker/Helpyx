# 💳 Facturation & Billing

> **Route** : `/billing`  
> **Rôle requis** : ADMIN  
> **Composants** : `billing/`, `lib/stripe-service.ts`, `lib/invoice-generator.ts`

---

## À quoi ça sert ?

Le module Billing gère les abonnements, les paiements et les factures. Helpyx utilise Stripe comme processeur de paiement.

---

## Plans d'abonnement

| Plan | Prix | Inclut |
|------|------|--------|
| **Starter** | 49€/mois | 10 users, 100 tickets, Analytics basique |
| **Professional** | 299€/mois | 50 users, tickets illimités, IA, Digital Twin, Gamification |
| **Enterprise** | Sur mesure | Illimité, tous les modules, SLA 99.99%, Account Manager |

---

## Souscrire ou changer de plan

1. **Billing** → Section "Plan actuel"
2. Cliquer **"Changer de plan"**
3. Sélectionner le nouveau plan
4. Confirmer le paiement (redirection Stripe Checkout)
5. L'abonnement est actif immédiatement

---

## Factures

- Les factures sont générées automatiquement chaque mois
- Format PDF téléchargeable
- Historique complet dans la section "Factures"
- Email automatique à l'administrateur

---

## Portail client Stripe

Cliquer **"Gérer l'abonnement"** redirige vers le portail Stripe où le client peut :
- Mettre à jour sa carte bancaire
- Annuler son abonnement
- Télécharger ses factures
- Changer de plan

---

## Mode démo

En développement, un **Mock Checkout** simule le processus Stripe sans vrai paiement. Les webhooks sont simulés localement via `/api/billing/mock-webhook`.
