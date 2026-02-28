# 🔌 Hub d'Intégrations

> **Route** : `/admin/integrations`  
> **Rôle requis** : ADMIN

---

## À quoi ça sert ?

Le Hub d'Intégrations connecte Helpyx avec vos outils existants. Au lieu de tout remplacer, Helpyx s'intègre dans votre écosystème.

---

## Intégrations disponibles

### Communication
| Outil | Statut | Ce qu'il fait |
|-------|--------|---------------|
| **Slack** | ✅ Disponible | Notifier un channel quand un ticket critique arrive |
| **Microsoft Teams** | ✅ Disponible | Même chose que Slack, pour écosystème Microsoft |

### Gestion de projet
| Outil | Statut | Ce qu'il fait |
|-------|--------|---------------|
| **Jira** | ✅ Disponible | Synchroniser les tickets Helpyx ↔ tickets Jira |
| **GitHub** | ✅ Disponible | Créer des issues GitHub depuis un ticket Helpyx |

### Monitoring
| Outil | Statut | Ce qu'il fait |
|-------|--------|---------------|
| **Datadog** | ✅ Disponible | Alertes Datadog → tickets Helpyx automatiques |
| **PagerDuty** | ✅ Disponible | Escalade cross-plateforme |
| **AWS CloudWatch** | ✅ Disponible | Alertes AWS → tickets |

### Identité
| Outil | Statut | Ce qu'il fait |
|-------|--------|---------------|
| **Azure AD** | ✅ Disponible | SSO + synchronisation des utilisateurs |
| **Okta** | 🔜 Bientôt | SSO SAML/OIDC |

### Inventaire
| Outil | Statut | Ce qu'il fait |
|-------|--------|---------------|
| **Lansweeper** | ✅ Disponible | Import de l'inventaire réseau |
| **Helpyx Agent** | ✅ Disponible | Scan réseau natif |

### Automatisation
| Outil | Statut | Ce qu'il fait |
|-------|--------|---------------|
| **Zapier** | ✅ Disponible | Connecter 5000+ outils via triggers |

---

## Connecter une intégration

1. Aller dans `/admin/integrations`
2. Trouver l'outil souhaité (recherche ou catégorie)
3. Cliquer **"Connecter"**
4. Suivre les instructions (OAuth, clé API, ou webhook URL)
5. **Tester** la connexion
6. **Configurer** les règles (quand envoyer, quoi envoyer)

---

## API REST v2

Le Hub inclut une section **API REST** pour les développeurs :
- **Documentation** interactive de tous les endpoints
- **Clé API** : Générer et révoquer des clés
- **Webhooks sortants** : Helpyx notifie votre serveur à chaque événement
- **Authentification** : OAuth2 ou Bearer Token

### Exemple génération de clé API
1. Section "API REST v2" en bas de la page
2. Cliquer **"Générer une clé API"**
3. Copier la clé (elle ne sera plus affichée)
4. Utiliser dans vos scripts : `Authorization: Bearer VOTRE_CLE`
