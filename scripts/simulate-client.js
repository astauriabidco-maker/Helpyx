const { io } = require('socket.io-client');

// Se connecter au serveur Socket.io
const socket = io('http://localhost:4001', {
    path: '/api/socketio',
    transports: ['websocket']
});

socket.on('connect', () => {
    console.log('✅ Client (Script) connecté avec succès ! ID:', socket.id);
    console.log('⏳ Simulation d\'un délai de 3 secondes avant la création...');

    setTimeout(() => {
        // Émettre un événement pour notifier le serveur qu'un ticket a été créé
        console.log('🚀 Envoi d\'une notification de nouveau ticket au serveur...');

        // Note: Dans Helpyx, les notifications Socket de création de tickets
        // passent souvent par des appels d'API (comme POST /api/tickets), 
        // ou alors par un événement direct si on l'a prévu. 
        // Simulons l'appel API HTTP de création pour déclencher la chaîne backend.

        fetch('http://localhost:4001/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Mocking user session for the API call 
                // We might need an auth token or cookie, but let's try pushing direct notification
            },
            body: JSON.stringify({
                titre: 'Problème de connexion WiFi (Simulé par Script)',
                description: 'Je n\'arrive plus à lier mon appareil au réseau de l\'entreprise.',
                priorite: 'HAUTE',
                categorie: 'Réseau',
            })
        }).then(res => {
            if (res.ok) {
                console.log('✅ Ticket créé avec succès via l\'API !');
                console.log('👀 Vérifiez votre navigateur (Tableau de bord de l\'Agent) pour voir la notification apparaître en direct !');

                setTimeout(() => {
                    socket.disconnect();
                    process.exit(0);
                }, 2000);
            } else {
                console.error('❌ Échec de la création du ticket (L\'API a pu bloquer la requête sans authentification).');
                console.log('👉 Alternative : Envoi direct via le WebSockets...');

                // Broadcast test alert if the API blocked it
                socket.emit('test_notification', {
                    userId: 'agent-demo-id', // We should broadcast to all
                    message: 'Alerte test depuis le script simulate-client.js !'
                });

                setTimeout(() => {
                    socket.disconnect();
                    process.exit(0);
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to call API:', err.message);
            socket.disconnect();
            process.exit(1);
        });

    }, 3000);
});

socket.on('connect_error', (error) => {
    console.error('❌ Erreur de connexion au Socket:', error);
});
