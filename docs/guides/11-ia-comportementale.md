# 🧠 IA Comportementale

> **Route** : `/ai-behavioral`  
> **Rôle requis** : ADMIN  
> **Composants** : `lib/behavioral-detection.ts`, `lib/behavioral-adaptation.ts`

---

## À quoi ça sert ?

L'IA Comportementale analyse les interactions des utilisateurs en temps réel pour détecter leur état émotionnel (frustration, confusion, urgence) et adapter automatiquement l'interface et les réponses.

---

## Comment ça fonctionne

### 1. Détection des signaux
L'IA analyse :
- **Vitesse de frappe** : Frappe rapide + erreurs = frustration probable
- **Langage utilisé** : Mots forts ("urgent", "inacceptable", "depuis 3 jours")
- **Comportement de navigation** : Clics répétés, retours en arrière
- **Historique** : Nombre de tickets récents, tickets non résolus

### 2. Score émotionnel
Un score de 0 à 100 est calculé :
- **0-30** : 😊 Calme, satisfait
- **30-60** : 😐 Neutre, patient
- **60-80** : 😟 Frustré, impatient
- **80-100** : 😡 Très frustré, risque de churn

### 3. Adaptation automatique
Selon le score, Helpyx adapte :
- **Priorité du ticket** : Augmentée automatiquement si frustration détectée
- **Ton des réponses** : Plus empathique et direct
- **Escalade** : Transfert automatique au manager si score > 80
- **Interface** : Notification visuelle à l'agent "⚠️ Client frustré"

---

## Dashboard IA Comportementale

La page `/ai-behavioral` montre :
- Graphe des scores émotionnels en temps réel
- Historique des détections
- Impact sur les SLAs et la satisfaction
- Règles d'adaptation configurables

---

## Configuration

Les seuils d'adaptation sont configurables :

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| Seuil frustration | 60 | Score à partir duquel l'alerte est déclenchée |
| Seuil escalade | 80 | Score à partir duquel le ticket est escaladé |
| Adaptation auto | Activée | Activer/désactiver l'adaptation d'interface |
| Notification agent | Activée | Prévenir l'agent du score émotionnel |
