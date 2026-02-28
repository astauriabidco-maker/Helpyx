# ⚙️ Paramètres

> **Route** : `/admin/settings`  
> **Rôle requis** : ADMIN  
> **Composant** : `admin-settings.tsx`

---

## À quoi ça sert ?

La page Paramètres centralise toute la configuration de votre entreprise dans Helpyx : profil, sécurité, SLA, emails, rôles et intégrations.

---

## Onglets disponibles

### 1. Profil Entreprise
- **Nom de l'entreprise**
- **Logo** (affiché dans le header et les emails)
- **Adresse, téléphone, site web**
- **Timezone** et **Langue** par défaut

### 2. Sécurité
- **Mot de passe** : Changer votre mot de passe admin
- **Authentification 2FA** : Activer/désactiver (via email ou app)
- **Sessions actives** : Voir et révoquer les sessions connectées
- **Logs d'audit** : Historique des actions sensibles

### 3. Email & SLA
- **Serveur SMTP** : Configurer l'envoi d'emails (Nodemailer ou Resend)
- **Templates email** : Personnaliser les emails automatiques
- **SLA par priorité** :
  | Priorité | Temps de réponse | Temps de résolution |
  |----------|-----------------|---------------------|
  | Basse | 24h | 5 jours |
  | Moyenne | 8h | 2 jours |
  | Haute | 4h | 1 jour |
  | Critique | 1h | 4h |

### 4. Rôles & Permissions
- Voir les rôles existants (ADMIN, AGENT, CLIENT)
- Modifier les permissions de chaque rôle
- Créer des rôles personnalisés (Enterprise)

### 5. Configuration Entreprise
- **Catégories de tickets** : Personnaliser la liste
- **Étiquettes** : Créer des tags personnalisés
- **Horaires de service** : Définir les heures ouvrées (pour le calcul SLA)
- **Notifications** : Configurer les canaux par défaut
