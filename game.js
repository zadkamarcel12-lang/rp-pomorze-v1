// Podmień na swój adres z Rendera!
const socket = io("https://rp-pomorze-serwer.onrender.com");

const inniGracze = {};

// Obsługa przycisku logowania
document.getElementById("btnZaloguj").addEventListener("click", () => {
    const nick = document.getElementById("inputLogin").value.trim();
    
    if (nick.length > 0) {
        // Ukrywamy panel logowania, pokazujemy UI gry
        document.getElementById("ekranLogowania").classList.add("ukryty");
        document.getElementById("uiGry").classList.remove("ukryty");
        document.getElementById("nazwaZalogowanego").innerText = nick;

        // Przypisujemy nick do obiektu gracza (zakładając, że obiekt 'gracz' jest zdefiniowany w gracz.js)
        if (typeof gracz !== 'undefined') {
            gracz.nick = nick;
        }

        // Informujemy serwer o dołączeniu do gry
        const posX = typeof gracz !== 'undefined' ? gracz.x : 100;
        const posY = typeof gracz !== 'undefined' ? gracz.y : 100;
        socket.emit("joinGame", { nick: nick, x: posX, y: posY });
    } else {
        alert("Wpisz nazwę gracza!");
    }
});

// === NASŁUCHIWANIE ZDARZEŃ SIECIOWYCH ===

socket.on("currentPlayers", (players) => {
    Object.keys(players).forEach((id) => {
        if (id !== socket.id) {
            inniGracze[id] = players[id];
        }
    });
});

socket.on("newPlayer", (playerInfo) => {
    inniGracze[playerInfo.id] = playerInfo;
});

socket.on("playerMoved", (playerInfo) => {
    if (inniGracze[playerInfo.id]) {
        inniGracze[playerInfo.id].x = playerInfo.x;
        inniGracze[playerInfo.id].y = playerInfo.y;
    }
});

socket.on("playerDisconnected", (id) => {
    delete inniGracze[id];
});

// === FUNKCJA WYSYŁAJĄCA RUCH ===
// Wywołuj tę funkcję w swojej pętli gry, gdy gracz się porusza:
function wyslijRuch() {
    if (typeof gracz !== 'undefined' && socket.connected) {
        socket.emit("playerMovement", { x: gracz.x, y: gracz.y });
    }
}

// === FUNKCJA RYSUJĄCA INNYCH GRACZY ===
// Wywołuj tę funkcję w swojej głównej funkcji rysującej (np. w pętli renderowania na canvasie):
function rysujInnychGraczy(ctx) {
    Object.keys(inniGracze).forEach((id) => {
        const g = inniGracze[id];
        
        // Rysowanie kwadratu/postaci drugiego gracza
        ctx.fillStyle = "red";
        ctx.fillRect(g.x, g.y, 32, 32);

        // Rysowanie nicku nad postacią
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(g.nick || "Druh", g.x + 16, g.y - 6);
    });
}