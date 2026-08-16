const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const players = {};

io.on("connection", (socket) => {
  console.log("Gracz połączony:", socket.id);

  // Domyślna pozycja nowego gracza
  players[socket.id] = { x: 100, y: 100, id: socket.id };

  // Wysyłamy nowemu graczowi listę wszystkich obecnych graczy
  socket.emit("currentPlayers", players);

  // Informujemy resztę, że dołączył ktoś nowy
  socket.broadcast.emit("newPlayer", players[socket.id]);

  // Odbieramy ruch od gracza i rozsyłamy go innym
  socket.on("playerMovement", (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      socket.broadcast.emit("playerMoved", players[socket.id]);
    }
  });

  // Gdy gracz wyjdzie ze strony
  socket.on("disconnect", () => {
    console.log("Gracz rozłączony:", socket.id);
    delete players[socket.id];
    io.emit("playerDisconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});