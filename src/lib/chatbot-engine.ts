/**
 * Helpyx AI Chatbot Engine
 * 
 * Moteur conversationnel intelligent qui :
 * 1. Analyse l'intention de l'utilisateur (NLU simplifié)
 * 2. Cherche dans la KB les articles pertinents
 * 3. Guide l'utilisateur avec des questions de diagnostic
 * 4. Résout automatiquement les problèmes courants
 * 5. Escalade vers un agent humain si nécessaire
 * 6. Crée un ticket pré-rempli avec tout le contexte
 */

// ============================================================
//  Types
// ============================================================

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
        intent?: string;
        kbArticles?: KBMatch[];
        suggestedActions?: ChatAction[];
        diagnosticStep?: number;
        confidence?: number;
        emotion?: string;
    };
}

export interface ChatAction {
    type: 'link' | 'button' | 'ticket' | 'escalate' | 'rate';
    label: string;
    value: string;
    icon?: string;
}

export interface KBMatch {
    title: string;
    excerpt: string;
    relevance: number;
    articleId?: string;
}

export interface ConversationState {
    id: string;
    messages: ChatMessage[];
    intent: string | null;
    category: string | null;
    diagnosticFlow: string | null;
    diagnosticStep: number;
    resolved: boolean;
    escalated: boolean;
    ticketCreated: string | null;
    userInfo: {
        name?: string;
        email?: string;
        company?: string;
    };
    context: Record<string, any>;
    startedAt: string;
}

// ============================================================
//  Intention Detection (NLU simplifié)
// ============================================================

interface IntentPattern {
    intent: string;
    category: string;
    patterns: RegExp[];
    confidence: number;
    diagnosticFlow?: string;
}

const INTENT_PATTERNS: IntentPattern[] = [
    // --- Imprimante ---
    {
        intent: 'printer_issue',
        category: 'Matériel',
        patterns: [
            /imprimante/i, /imprimer/i, /impression/i, /printer/i,
            /bourrage/i, /papier\s*coinc/i, /toner/i, /cartouche/i,
            /n'imprime\s*(plus|pas)/i, /plus\s*d'encre/i,
        ],
        confidence: 0.9,
        diagnosticFlow: 'printer',
    },
    // --- Réseau / Internet ---
    {
        intent: 'network_issue',
        category: 'Réseau',
        patterns: [
            /internet/i, /réseau/i, /wifi/i, /wi-fi/i, /connexion/i,
            /pas\s*de\s*(réseau|connexion|internet)/i, /déconnect/i,
            /lent/i, /vitesse/i, /ping/i, /vpn/i, /pas\s*accès/i,
        ],
        confidence: 0.9,
        diagnosticFlow: 'network',
    },
    // --- Mot de passe ---
    {
        intent: 'password_reset',
        category: 'Accès',
        patterns: [
            /mot\s*de\s*passe/i, /password/i, /mdp/i, /oublié.*pass/i,
            /réinitialiser/i, /reset.*pass/i, /bloqu.*compte/i,
            /accès.*bloqu/i, /ne.*arrive.*connecter/i, /login/i,
        ],
        confidence: 0.95,
        diagnosticFlow: 'password',
    },
    // --- Email ---
    {
        intent: 'email_issue',
        category: 'Logiciel',
        patterns: [
            /email/i, /mail/i, /outlook/i, /messagerie/i,
            /envoyer.*mail/i, /recevoir.*mail/i, /boîte.*réception/i,
            /pièce\s*jointe/i, /spam/i,
        ],
        confidence: 0.85,
        diagnosticFlow: 'email',
    },
    // --- Logiciel ---
    {
        intent: 'software_issue',
        category: 'Logiciel',
        patterns: [
            /logiciel/i, /application/i, /programme/i, /installer/i,
            /mise\s*à\s*jour/i, /update/i, /crash/i, /plante/i,
            /ne\s*(s'ouvre|démarre|fonctionne)\s*plus/i, /erreur/i,
            /bug/i, /licence/i, /office/i, /excel/i, /word/i,
        ],
        confidence: 0.8,
        diagnosticFlow: 'software',
    },
    // --- Matériel / PC ---
    {
        intent: 'hardware_issue',
        category: 'Matériel',
        patterns: [
            /ordinateur/i, /pc/i, /écran/i, /clavier/i, /souris/i,
            /ne\s*s'allume\s*plus/i, /écran\s*noir/i, /bruit/i,
            /surchauffe/i, /batterie/i, /chargeur/i, /port\s*usb/i,
            /lent/i, /rame/i, /bloqué/i, /figé/i, /freeze/i,
        ],
        confidence: 0.8,
        diagnosticFlow: 'hardware',
    },
    // --- Demande de matériel ---
    {
        intent: 'equipment_request',
        category: 'Demande',
        patterns: [
            /besoin\s*d[e']/i, /commander/i, /nouveau.*poste/i,
            /nouveau.*pc/i, /nouveau.*écran/i, /remplacer/i,
            /changer.*matériel/i,
        ],
        confidence: 0.75,
        diagnosticFlow: 'request',
    },
    // --- Salutations ---
    {
        intent: 'greeting',
        category: 'Autre',
        patterns: [
            /^(bonjour|salut|hello|hi|hey|bonsoir|coucou)/i,
        ],
        confidence: 1.0,
    },
    // --- Remerciement ---
    {
        intent: 'thanks',
        category: 'Autre',
        patterns: [
            /merci/i, /thank/i, /super/i, /parfait/i, /génial/i, /cool/i,
        ],
        confidence: 1.0,
    },
    // --- Statut ticket ---
    {
        intent: 'ticket_status',
        category: 'Suivi',
        patterns: [
            /statut.*ticket/i, /où\s*en\s*est/i, /suivi/i,
            /mon\s*ticket/i, /avancement/i,
        ],
        confidence: 0.85,
    },
];

export function detectIntent(message: string): { intent: string; category: string; confidence: number; diagnosticFlow?: string } {
    let bestMatch = { intent: 'unknown', category: 'Autre', confidence: 0, diagnosticFlow: undefined as string | undefined };

    for (const pattern of INTENT_PATTERNS) {
        for (const regex of pattern.patterns) {
            if (regex.test(message)) {
                if (pattern.confidence > bestMatch.confidence) {
                    bestMatch = {
                        intent: pattern.intent,
                        category: pattern.category,
                        confidence: pattern.confidence,
                        diagnosticFlow: pattern.diagnosticFlow,
                    };
                }
            }
        }
    }

    return bestMatch;
}

// ============================================================
//  Diagnostic Flows (arbres de décision)
// ============================================================

interface DiagnosticStep {
    question: string;
    options?: { label: string; value: string; nextStep: number | 'resolved' | 'escalate' }[];
    freeText?: boolean;
    resolution?: string;
}

const DIAGNOSTIC_FLOWS: Record<string, DiagnosticStep[]> = {
    printer: [
        {
            question: "Quel est le problème exact avec votre imprimante ?",
            options: [
                { label: "🚫 Elle n'imprime plus du tout", value: "no_print", nextStep: 1 },
                { label: "📄 Bourrage papier", value: "jam", nextStep: 4 },
                { label: "🎨 Qualité d'impression mauvaise", value: "quality", nextStep: 5 },
                { label: "⚠️ Message d'erreur", value: "error", nextStep: 6 },
            ],
        },
        {
            question: "L'imprimante est-elle allumée et le voyant est-il vert ?",
            options: [
                { label: "✅ Oui, allumée et voyant vert", value: "on", nextStep: 2 },
                { label: "❌ Non, elle est éteinte", value: "off", nextStep: 'resolved' },
                { label: "🟠 Le voyant clignote orange", value: "orange", nextStep: 'escalate' },
            ],
        },
        {
            question: "Avez-vous essayé de la redémarrer (éteindre, attendre 30 secondes, rallumer) ?",
            options: [
                { label: "✅ Oui, déjà fait", value: "yes", nextStep: 3 },
                { label: "❌ Non, je vais essayer", value: "no", nextStep: 'resolved' },
            ],
        },
        {
            question: "L'imprimante est-elle bien connectée ? Vérifiez le câble USB ou que le WiFi est activé.",
            options: [
                { label: "✅ Tout est branché", value: "connected", nextStep: 'escalate' },
                { label: "🔌 Le câble était débranché !", value: "cable", nextStep: 'resolved' },
            ],
        },
        {
            question: "Pour le bourrage papier :\n1. Ouvrez le capot de l'imprimante\n2. Retirez délicatement le papier coincé (sans le déchirer)\n3. Vérifiez qu'il ne reste pas de morceaux\n4. Refermez et relancez\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Oui, ça remarche !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Non, toujours coincé", value: "stuck", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour la qualité d'impression, essayez :\n1. Lancez un nettoyage des têtes (dans les paramètres de l'imprimante)\n2. Vérifiez le niveau de toner/encre\n3. Essayez d'imprimer une page test\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Oui, meilleure qualité", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Non, toujours mauvais", value: "bad", nextStep: 'escalate' },
            ],
        },
        {
            question: "Quel message d'erreur voyez-vous exactement ? (Écrivez-le ci-dessous)",
            freeText: true,
            options: [
                { label: "📝 Message noté, je vais escalader", value: "noted", nextStep: 'escalate' },
            ],
        },
    ],

    network: [
        {
            question: "Quel est le problème réseau ?",
            options: [
                { label: "🌐 Pas d'internet du tout", value: "no_internet", nextStep: 1 },
                { label: "🐌 Internet très lent", value: "slow", nextStep: 3 },
                { label: "🔒 VPN ne fonctionne pas", value: "vpn", nextStep: 4 },
                { label: "📡 WiFi ne se connecte pas", value: "wifi", nextStep: 2 },
            ],
        },
        {
            question: "D'autres collègues autour de vous ont-ils le même problème ?",
            options: [
                { label: "✅ Oui, tout le monde est coupé", value: "all", nextStep: 'escalate' },
                { label: "❌ Non, juste moi", value: "just_me", nextStep: 2 },
            ],
        },
        {
            question: "Essayez ces étapes :\n1. Désactiver puis réactiver le WiFi\n2. Oublier le réseau et se reconnecter\n3. Redémarrer votre PC\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Oui, ça remarche !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Non, toujours pas", value: "still", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour la lenteur, quelques vérifications :\n1. Fermez les onglets inutiles\n2. Vérifiez si un téléchargement est en cours\n3. Essayez un autre navigateur\n4. Testez sur https://fast.com\n\nQuelle est votre vitesse ?",
            freeText: true,
            options: [
                { label: "📊 Vitesse notée", value: "noted", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour le VPN :\n1. Fermez complètement le client VPN\n2. Vérifiez votre connexion internet (sans VPN)\n3. Relancez le VPN\n4. Si échec, essayez un autre serveur VPN\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Oui, VPN connecté !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Non, échec connexion", value: "fail", nextStep: 'escalate' },
            ],
        },
    ],

    password: [
        {
            question: "Quel service est concerné ?",
            options: [
                { label: "💻 Windows / Session PC", value: "windows", nextStep: 1 },
                { label: "📧 Email / Outlook", value: "email", nextStep: 2 },
                { label: "🌐 Application web", value: "web", nextStep: 3 },
                { label: "🔐 VPN", value: "vpn", nextStep: 2 },
            ],
        },
        {
            question: "Pour Windows, voici la procédure :\n1. Sur l'écran de connexion, cliquez \"Mot de passe oublié\"\n2. Vérifiez votre email professionnel pour le lien de réinitialisation\n3. Si pas d'email, contactez votre administrateur\n\nAvez-vous réussi ?",
            options: [
                { label: "✅ Oui, mot de passe changé !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Pas de lien reçu", value: "no_email", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour le mot de passe email :\n1. Allez sur https://account.microsoft.com (ou votre portail)\n2. Cliquez \"Mot de passe oublié\"\n3. Suivez les instructions (vérification SMS ou email secondaire)\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Oui, accès retrouvé !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Impossible de réinitialiser", value: "fail", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour une application web :\n1. Cliquez \"Mot de passe oublié\" sur la page de connexion\n2. Entrez votre email professionnel\n3. Vérifiez votre boîte mail (et le dossier spam)\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Oui, c'est bon !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Pas de lien reçu", value: "no_email", nextStep: 'escalate' },
            ],
        },
    ],

    email: [
        {
            question: "Quel est le problème avec votre messagerie ?",
            options: [
                { label: "📩 Je ne reçois plus d'emails", value: "no_receive", nextStep: 1 },
                { label: "📤 Je ne peux plus envoyer", value: "no_send", nextStep: 2 },
                { label: "📎 Problème de pièce jointe", value: "attachment", nextStep: 3 },
                { label: "🐌 Outlook est très lent", value: "slow", nextStep: 4 },
            ],
        },
        {
            question: "Vérifications pour la réception :\n1. Vérifiez le dossier Spam / Courrier indésirable\n2. Vérifiez que votre boîte n'est pas pleine\n3. Demandez à un collègue de vous envoyer un test\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ J'ai trouvé mes emails dans le spam", value: "spam", nextStep: 'resolved' },
                { label: "📦 Ma boîte est pleine", value: "full", nextStep: 'resolved' },
                { label: "❌ Toujours rien", value: "nothing", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour l'envoi d'emails :\n1. Vérifiez votre connexion internet\n2. Regardez dans la boîte d'envoi (Outbox) s'il y a des messages bloqués\n3. Essayez via webmail (outlook.office.com)\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Oui, emails envoyés", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Non, erreur d'envoi", value: "error", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour les pièces jointes :\n- Taille max : 25 Mo pour la plupart des messageries\n- Formats bloqués : .exe, .bat, .cmd\n- Alternative : utilisez OneDrive/SharePoint et envoyez un lien\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ J'ai envoyé un lien à la place", value: "link", nextStep: 'resolved' },
                { label: "❌ Autre problème", value: "other", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour Outlook lent :\n1. Fermez et relancez Outlook\n2. Videz le dossier Éléments supprimés\n3. Archivez les anciens emails\n4. Si persistant, réparez via Panneau de configuration > Programmes > Office > Réparer\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ C'est plus rapide !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Toujours lent", value: "slow", nextStep: 'escalate' },
            ],
        },
    ],

    software: [
        {
            question: "Quel problème rencontrez-vous ?",
            options: [
                { label: "💥 L'application plante / crash", value: "crash", nextStep: 1 },
                { label: "📥 Besoin d'installer un logiciel", value: "install", nextStep: 2 },
                { label: "🔄 Mise à jour nécessaire", value: "update", nextStep: 3 },
                { label: "🔑 Problème de licence", value: "license", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour un crash :\n1. Redémarrez l'application\n2. Redémarrez votre PC\n3. Vérifiez les mises à jour de l'application\n4. Si Word/Excel : essayez en \"Mode sans échec\" (maintenir Ctrl au lancement)\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Ça remarche !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Ça plante encore", value: "still", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour installer un logiciel, je vais créer un ticket pour que l'équipe IT l'installe. Quel logiciel avez-vous besoin ?",
            freeText: true,
            options: [
                { label: "📝 Créer le ticket", value: "ticket", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour les mises à jour :\n1. Windows Update : Paramètres > Mise à jour > Rechercher\n2. Office : Fichier > Compte > Options de mise à jour\n3. Redémarrez après la mise à jour\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Mis à jour !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Erreur de mise à jour", value: "error", nextStep: 'escalate' },
            ],
        },
    ],

    hardware: [
        {
            question: "Quel équipement pose problème ?",
            options: [
                { label: "💻 Ordinateur / PC", value: "pc", nextStep: 1 },
                { label: "🖥️ Écran", value: "screen", nextStep: 2 },
                { label: "⌨️ Clavier / Souris", value: "periph", nextStep: 3 },
                { label: "🔋 Batterie / Chargeur", value: "battery", nextStep: 4 },
            ],
        },
        {
            question: "Quel est le symptôme ?\n- Écran noir au démarrage → Maintenez le bouton 10s, puis rallumez\n- PC très lent → Redémarrez et fermez les programmes inutiles\n- Bruit anormal → Vérifiez que les ventilateurs ne sont pas obstrués",
            options: [
                { label: "✅ Résolu avec ces conseils", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Le problème persiste", value: "persist", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour l'écran :\n1. Vérifiez que le câble est bien branché\n2. Essayez un autre câble/port\n3. Testez l'écran sur un autre PC\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ C'était le câble !", value: "cable", nextStep: 'resolved' },
                { label: "❌ L'écran ne fonctionne pas", value: "broken", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour clavier/souris :\n1. Vérifiez les piles/charge (si sans fil)\n2. Essayez un autre port USB\n3. Redémarrez le PC\n\nLe problème est-il résolu ?",
            options: [
                { label: "✅ Ça remarche !", value: "fixed", nextStep: 'resolved' },
                { label: "❌ Toujours rien", value: "dead", nextStep: 'escalate' },
            ],
        },
        {
            question: "Pour la batterie :\n- Ne charge plus → Essayez un autre chargeur / prise\n- Se décharge vite → Réduisez la luminosité, fermez les apps en fond\n- Gonflement → ⚠️ ARRÊTEZ d'utiliser le PC immédiatement !",
            options: [
                { label: "✅ Résolu", value: "fixed", nextStep: 'resolved' },
                { label: "⚠️ Batterie gonflée !", value: "swollen", nextStep: 'escalate' },
                { label: "❌ Autre problème", value: "other", nextStep: 'escalate' },
            ],
        },
    ],

    request: [
        {
            question: "Quel type de demande souhaitez-vous faire ?",
            options: [
                { label: "💻 Nouveau poste de travail", value: "workstation", nextStep: 'escalate' },
                { label: "🖥️ Nouvel écran", value: "screen", nextStep: 'escalate' },
                { label: "📱 Téléphone / Mobile", value: "phone", nextStep: 'escalate' },
                { label: "📦 Autre équipement", value: "other", nextStep: 'escalate' },
            ],
        },
    ],
};

// ============================================================
//  Réponses du Chatbot
// ============================================================

const GREETING_RESPONSES = [
    "Bonjour ! 👋 Je suis **Helix**, l'assistant IA de Helpyx. Comment puis-je vous aider aujourd'hui ?\n\nVoici ce que je peux faire :\n• 🖨️ Problème d'imprimante\n• 🌐 Problème réseau / internet\n• 🔑 Mot de passe oublié\n• 📧 Problème de messagerie\n• 💻 Problème matériel\n• 📦 Demande de matériel",
    "Salut ! 😊 Je suis **Helix**, votre assistant support. Décrivez-moi votre problème et je vais essayer de le résoudre !",
];

const THANKS_RESPONSES = [
    "De rien ! 😊 N'hésitez pas à revenir si vous avez d'autres questions. Bonne journée !",
    "Avec plaisir ! 🎉 Je suis là 24/7 si besoin. À bientôt !",
];

const UNKNOWN_RESPONSES = [
    "Je n'ai pas bien compris votre demande. 🤔 Pourriez-vous la reformuler ?\n\nVous pouvez me demander de l'aide pour :\n• 🖨️ Imprimante\n• 🌐 Réseau / Internet\n• 🔑 Mot de passe\n• 📧 Email\n• 💻 Matériel\n• 📦 Demande de matériel\n\nOu si vous préférez, je peux **créer un ticket** directement pour vous.",
];

const RESOLVED_RESPONSES = [
    "Super, content d'avoir pu vous aider ! 🎉\n\nVotre problème est-il vraiment résolu ?",
    "Excellent ! 🎊 Problème résolu sans intervention humaine — c'est la magie de l'IA !\n\nEst-ce que tout fonctionne bien maintenant ?",
];

const ESCALATE_RESPONSES = [
    "Je comprends, ce problème nécessite l'intervention d'un technicien. 👨‍💻\n\nJe vais créer un **ticket** avec tout le contexte de notre conversation pour qu'un agent puisse vous aider rapidement.",
];

// ============================================================
//  Moteur de conversation
// ============================================================

export function processMessage(
    state: ConversationState,
    userMessage: string
): { response: ChatMessage; updatedState: ConversationState } {
    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // Si on est dans un flow de diagnostic
    if (state.diagnosticFlow && state.diagnosticStep >= 0) {
        return processDiagnosticStep(state, userMessage, msgId);
    }

    // Détecter l'intention
    const { intent, category, confidence, diagnosticFlow } = detectIntent(userMessage);

    // Greeting
    if (intent === 'greeting') {
        const response = createMessage(msgId, 'assistant',
            GREETING_RESPONSES[Math.floor(Math.random() * GREETING_RESPONSES.length)],
            { intent, confidence }
        );
        return { response, updatedState: { ...state, intent } };
    }

    // Thanks
    if (intent === 'thanks') {
        const response = createMessage(msgId, 'assistant',
            THANKS_RESPONSES[Math.floor(Math.random() * THANKS_RESPONSES.length)],
            {
                intent, confidence, suggestedActions: [
                    { type: 'rate', label: '⭐ Noter cette conversation', value: 'rate' },
                ]
            }
        );
        return { response, updatedState: { ...state, intent, resolved: true } };
    }

    // Ticket status
    if (intent === 'ticket_status') {
        const response = createMessage(msgId, 'assistant',
            "Pour consulter le statut de vos tickets, rendez-vous sur la page **Mes Tickets**.\n\nSi vous avez un numéro de ticket (ex: TK-2024-0042), communiquez-le moi et je vérifierai pour vous.",
            {
                intent, confidence, suggestedActions: [
                    { type: 'link', label: '🎫 Voir mes tickets', value: '/tickets' },
                ]
            }
        );
        return { response, updatedState: { ...state, intent } };
    }

    // Problème identifié → lancer le flow de diagnostic
    if (diagnosticFlow && DIAGNOSTIC_FLOWS[diagnosticFlow]) {
        const flow = DIAGNOSTIC_FLOWS[diagnosticFlow];
        const firstStep = flow[0];

        const response = createMessage(msgId, 'assistant',
            `J'ai compris, vous avez un problème lié à **${category}**. Laissez-moi vous guider. 🔍\n\n${firstStep.question}`,
            {
                intent,
                confidence,
                diagnosticStep: 0,
                suggestedActions: firstStep.options?.map(opt => ({
                    type: 'button' as const,
                    label: opt.label,
                    value: opt.value,
                })),
            }
        );

        return {
            response,
            updatedState: {
                ...state,
                intent,
                category,
                diagnosticFlow,
                diagnosticStep: 0,
            },
        };
    }

    // Intention inconnue
    const response = createMessage(msgId, 'assistant',
        UNKNOWN_RESPONSES[Math.floor(Math.random() * UNKNOWN_RESPONSES.length)],
        {
            intent: 'unknown',
            confidence: 0,
            suggestedActions: [
                { type: 'button', label: '🎫 Créer un ticket', value: 'create_ticket' },
                { type: 'button', label: '👤 Parler à un agent', value: 'escalate' },
            ],
        }
    );

    return { response, updatedState: state };
}

function processDiagnosticStep(
    state: ConversationState,
    userMessage: string,
    msgId: string
): { response: ChatMessage; updatedState: ConversationState } {
    const flow = DIAGNOSTIC_FLOWS[state.diagnosticFlow!];
    if (!flow) {
        return {
            response: createMessage(msgId, 'assistant', "Une erreur est survenue. Reprenons depuis le début."),
            updatedState: { ...state, diagnosticFlow: null, diagnosticStep: 0 },
        };
    }

    const currentStep = flow[state.diagnosticStep];

    // Trouver la prochaine étape
    let nextStep: number | 'resolved' | 'escalate' = 'escalate';

    if (currentStep.options) {
        // Chercher l'option choisie
        const chosen = currentStep.options.find(opt =>
            userMessage.toLowerCase().includes(opt.value) ||
            userMessage.toLowerCase().includes(opt.label.toLowerCase().replace(/[^\w\s]/g, '').trim())
        );
        if (chosen) {
            nextStep = chosen.nextStep;
        } else {
            // Si texte libre ou option non trouvée, prendre la dernière option
            nextStep = currentStep.options[currentStep.options.length - 1].nextStep;
        }
    }

    // Résolu !
    if (nextStep === 'resolved') {
        const response = createMessage(msgId, 'assistant',
            RESOLVED_RESPONSES[Math.floor(Math.random() * RESOLVED_RESPONSES.length)],
            {
                intent: state.intent || 'resolved',
                confidence: 1.0,
                suggestedActions: [
                    { type: 'rate', label: '⭐ Oui, tout est résolu !', value: 'resolved_yes' },
                    { type: 'button', label: '❌ Non, je veux parler à un agent', value: 'escalate' },
                ],
            }
        );
        return {
            response,
            updatedState: { ...state, resolved: true, diagnosticFlow: null },
        };
    }

    // Escalade
    if (nextStep === 'escalate') {
        const ticketContext = buildTicketContext(state, userMessage);

        const response = createMessage(msgId, 'assistant',
            `${ESCALATE_RESPONSES[0]}\n\n📋 **Résumé pour le technicien :**\n- Catégorie : ${state.category}\n- Problème : ${state.intent}\n- Étapes tentées : ${state.diagnosticStep + 1} étapes de diagnostic\n- Dernier contexte : "${userMessage}"\n\nJe crée le ticket maintenant...`,
            {
                intent: 'escalate',
                confidence: 1.0,
                suggestedActions: [
                    { type: 'ticket', label: '🎫 Ticket créé !', value: ticketContext },
                ],
            }
        );

        return {
            response,
            updatedState: { ...state, escalated: true, diagnosticFlow: null },
        };
    }

    // Étape suivante du diagnostic
    if (typeof nextStep === 'number' && flow[nextStep]) {
        const nextQuestion = flow[nextStep];

        const response = createMessage(msgId, 'assistant', nextQuestion.question, {
            intent: state.intent || undefined,
            diagnosticStep: nextStep,
            suggestedActions: nextQuestion.options?.map(opt => ({
                type: 'button' as const,
                label: opt.label,
                value: opt.value,
            })),
        });

        return {
            response,
            updatedState: { ...state, diagnosticStep: nextStep },
        };
    }

    // Fallback
    return {
        response: createMessage(msgId, 'assistant', "Je vais créer un ticket pour qu'un technicien vous aide."),
        updatedState: { ...state, escalated: true, diagnosticFlow: null },
    };
}

function createMessage(id: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: any): ChatMessage {
    return { id, role, content, timestamp: new Date().toISOString(), metadata };
}

function buildTicketContext(state: ConversationState, lastMessage: string): string {
    return JSON.stringify({
        category: state.category,
        intent: state.intent,
        diagnosticSteps: state.diagnosticStep + 1,
        lastMessage,
        conversationId: state.id,
    });
}

export function createNewConversation(): ConversationState {
    return {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
        messages: [],
        intent: null,
        category: null,
        diagnosticFlow: null,
        diagnosticStep: -1,
        resolved: false,
        escalated: false,
        ticketCreated: null,
        userInfo: {},
        context: {},
        startedAt: new Date().toISOString(),
    };
}
