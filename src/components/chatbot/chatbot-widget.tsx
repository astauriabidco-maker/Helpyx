'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MessageCircle, X, Send, Bot, User, Sparkles,
    Minimize2, Maximize2, ThumbsUp, ThumbsDown,
    Ticket, ExternalLink, Loader2,
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: {
        intent?: string;
        suggestedActions?: ChatAction[];
        diagnosticStep?: number;
        confidence?: number;
    };
}

interface ChatAction {
    type: 'link' | 'button' | 'ticket' | 'escalate' | 'rate';
    label: string;
    value: string;
}

export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [showPulse, setShowPulse] = useState(true);
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Message de bienvenue
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: "Bonjour ! 👋 Je suis **Helix**, l'assistant IA de Helpyx.\n\nComment puis-je vous aider ?\n\n• 🖨️ Problème d'imprimante\n• 🌐 Problème réseau / internet\n• 🔑 Mot de passe oublié\n• 💻 Problème matériel\n• 🛡️ Vérifier ma garantie\n• 🔄 Retourner un produit (RMA)",
                timestamp: new Date().toISOString(),
                metadata: {
                    suggestedActions: [
                        { type: 'button', label: '🖨️ Imprimante', value: 'Mon imprimante ne marche plus' },
                        { type: 'button', label: '🌐 Réseau', value: 'Je n\'ai plus internet' },
                        { type: 'button', label: '🛡️ Garantie', value: 'Est-ce que mon appareil est encore sous garantie ?' },
                        { type: 'button', label: '🔄 Retour SAV', value: 'Je veux retourner un produit en panne' },
                    ],
                },
            }]);
        }
    }, [isOpen, messages.length]);

    const sendMessage = async (text: string, action?: string) => {
        if (!text.trim() && !action) return;

        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        };

        if (!action) {
            setMessages(prev => [...prev, userMessage]);
        }
        setInput('');
        setLoading(true);
        setTyping(true);

        try {
            // Simuler le délai de "typing"
            await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    conversationId,
                    action,
                }),
            });

            const data = await response.json();
            setConversationId(data.conversationId);
            setMessages(prev => [...prev, data.message]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: `err_${Date.now()}`,
                role: 'assistant',
                content: "Désolé, je rencontre un problème technique. Veuillez réessayer ou créer un ticket manuellement.",
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setLoading(false);
            setTyping(false);
        }
    };

    const handleActionClick = (action: ChatAction) => {
        if (action.type === 'button') {
            sendMessage(action.value);
        } else if (action.type === 'link') {
            window.location.href = action.value;
        } else if (action.type === 'ticket') {
            sendMessage('Créer un ticket', 'create_ticket');
        } else if (action.type === 'rate') {
            sendMessage('', 'rate');
            setMessages(prev => [...prev, {
                id: `rate_${Date.now()}`,
                role: 'system',
                content: '⭐ Merci pour votre évaluation !',
                timestamp: new Date().toISOString(),
            }]);
        } else if (action.type === 'escalate') {
            sendMessage('Je veux parler à un agent', 'create_ticket');
        }
    };

    const formatContent = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
            .replace(/• /g, '<span style="margin-left:8px">• </span>')
            .replace(/```([\s\S]*?)```/g, '<pre style="background:#1e293b;padding:8px;border-radius:6px;font-size:12px;overflow-x:auto;margin:4px 0">$1</pre>');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const resetConversation = () => {
        setMessages([]);
        setConversationId(null);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => { setIsOpen(true); setShowPulse(false); }}
                className="fixed bottom-6 right-6 z-50 group"
                aria-label="Ouvrir le chatbot"
            >
                {/* Pulse animation */}
                {showPulse && (
                    <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping" />
                )}
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl hover:scale-110 transition-all duration-300">
                    <Bot className="w-7 h-7" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                    💬 Besoin d'aide ? Parlez à Helix !
                </div>
            </button>
        );
    }

    return (
        <div
            className={`fixed z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized
                ? 'bottom-6 right-6 w-80 h-14'
                : 'bottom-6 right-6 w-[420px] h-[600px] max-h-[80vh]'
                }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm leading-tight">Helix — Assistant IA</h3>
                        <div className="flex items-center gap-1.5 text-xs text-blue-100">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            En ligne 24/7
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); resetConversation(); }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition" title="Nouvelle conversation">
                        <Sparkles className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition">
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-gray-50 dark:bg-gray-950">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'system' ? (
                                    <div className="text-center text-xs text-gray-500 py-1">{msg.content}</div>
                                ) : (
                                    <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        {/* Avatar */}
                                        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                                            }`}>
                                            {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                                        </div>

                                        <div>
                                            {/* Bulle */}
                                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-br-md'
                                                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                                            />

                                            {/* Actions suggérées */}
                                            {msg.metadata?.suggestedActions && msg.metadata.suggestedActions.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {msg.metadata.suggestedActions.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleActionClick(action)}
                                                            className={`text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105 ${action.type === 'ticket' || action.type === 'escalate'
                                                                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-300'
                                                                : action.type === 'rate'
                                                                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
                                                                    : action.type === 'link'
                                                                        ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-300'
                                                                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300'
                                                                }`}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Timestamp */}
                                            <span className="text-[10px] text-gray-400 mt-1 block">
                                                {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {typing && (
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                                    <Bot className="w-3.5 h-3.5" />
                                </div>
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={loading}
                                placeholder="Décrivez votre problème..."
                                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white placeholder:text-gray-400"
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={loading || !input.trim()}
                                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-50 transition-all hover:scale-105"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] text-gray-400">
                                Propulsé par <strong>Helix AI</strong> · Helpyx
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
