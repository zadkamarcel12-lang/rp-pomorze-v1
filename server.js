const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Pozwala na połączenia z Twojej strony GitHub Pages
        methods: ["GET", "POST"]
    }
});

const players = {};

io.on('connection', (socket) => {
    console.log(`Gracz połączył się: ${socket.id}`);

    // Gdy gracz wysyła swój nick i pozycję po kliknięciu "Zaloguj"
    socket.on('joinGame', (playerData) => {
        players[socket.id] = {
            id: socket.id,
            nick: playerData.nick,
            x: playerData.x,
            y: playerData.y,
            kierunek: "dol",
            ubranyWNomex: false,
            stopien: "st_strazak"
        };

        // Wyślij listę obecnych graczy do nowego gracza
        socket.emit('currentPlayers', players);

        // Powiadom innych graczy o nowym uczestniku
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    // Gdy gracz zmienia pozycję / porusza się
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].kierunek = movementData.kierunek;
            players[socket.id].ubranyWNomex = movementData.ubranyWNomex;
            players[socket.id].stopien = movementData.stopien;

            // Wyślij informację o ruchu do wszystkich *innych* graczy
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Obsługa rozłączenia
    socket.on('disconnect', () => {
        console.log(`Gracz się rozłączył: ${socket.id}`);
        delete players[socket.id];
        // Powiadom wszystkich, że gracz wyszedł
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});