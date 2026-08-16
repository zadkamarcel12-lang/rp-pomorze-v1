// Podmień na swój adres z Rendera!
const socket = io("https://rp-pomorze-serwer.onrender.com");

const inniGracze = {};

// === TWORZENIE WŁASNEJ KONSOLI NA EKRANIE ===
const debugBox = document.createElement("div");
debugBox.style.position = "fixed";
debugBox.style.bottom = "10px";
debugBox.style.left = "10px";
debugBox.style.width = "320px";
debugBox.style.height = "120px";
debugBox.style.background = "rgba(0, 0, 0, 0.85)";
debugBox.style.color = "#00ff00";
debugBox.style.fontFamily = "monospace";
debugBox.style.fontSize = "11px";
debugBox.style.padding = "8px";
debugBox.style.borderRadius = "5px";
debugBox.style.zIndex = "99999";
debugBox.style.overflowY = "auto";
debugBox.style.pointerEvents = "none";
debugBox.innerHTML = "<b>[SYSTEM]</b> Inicjalizacja sieci...<br>";
document.body.appendChild(debugBox);

function logDoKonsoli(wiadomosc) {
    const czas = new Date().toLocaleTimeString();
    debugBox.innerHTML += `[${czas}] ${wiadomosc}<br>`;
    debugBox.scrollTop = debugBox.scrollHeight;
}

// === DIAGNOSTYKA SOCKET.IO ===
socket.on("connect", () => {
    logDoKonsoli(`Połączono z serwerem! ID: ${socket.id}`);
});

socket.on("connect_error", (err) => {
    logDoKonsoli(`<span style="color:red;">Błąd połączenia: ${err.message}</span>`);
});

socket.on("disconnect", (reason) => {
    logDoKonsoli(`<span style="color:yellow;">Rozłączono: ${reason}</span>`);
});

// Obsługa przycisku logowania
document.getElementById("btnZaloguj").addEventListener("click", () => {
    const nick = document.getElementById("inputLogin").value.trim();
    
    if (nick.length > 0) {
        document.getElementById("ekranLogowania").classList.add("ukryty");
        document.getElementById("uiGry").classList.remove("ukryty");
        document.getElementById("nazwaZalogowanego").innerText = nick;

        if (typeof gracz !== 'undefined') {
            gracz.nick = nick;
        }

        const posX = typeof gracz !== 'undefined' ? gracz.x : 100;
        const posY = typeof gracz !== 'undefined' ? gracz.y : 100;
        
        logDoKonsoli(`Wysyłam joinGame: ${nick} (${Math.round(posX)}, ${Math.round(posY)})`);
        socket.emit("joinGame", { nick: nick, x: posX, y: posY });
    } else {
        alert("Wpisz nazwę gracza!");
    }
});

// === NASŁUCHIWANIE ZDARZEŃ SIECIOWYCH ===

socket.on("currentPlayers", (players) => {
    logDoKonsoli(`Otrzymano currentPlayers: ${Object.keys(players).length} graczy`);
    Object.keys(players).forEach((id) => {
        if (id !== socket.id) {
            inniGracze[id] = players[id];
        }
    });
});

socket.on("newPlayer", (playerInfo) => {
    logDoKonsoli(`Nowy gracz dołączył: ${playerInfo.nick} (${playerInfo.id})`);
    inniGracze[playerInfo.id] = playerInfo;
});

socket.on("playerMoved", (playerInfo) => {
    if (inniGracze[playerInfo.id]) {
        inniGracze[playerInfo.id].x = playerInfo.x;
        inniGracze[playerInfo.id].y = playerInfo.y;
        inniGracze[playerInfo.id].kierunek = playerInfo.kierunek;
        inniGracze[playerInfo.id].ubranyWNomex = playerInfo.ubranyWNomex;
        inniGracze[playerInfo.id].stopien = playerInfo.stopien;
    }
});

socket.on("playerDisconnected", (id) => {
    logDoKonsoli(`Gracz wyszedł: ${id}`);
    delete inniGracze[id];
});

// === FUNKCJA WYSYŁAJĄCA RUCH ===
function wyslijRuch() {
    if (typeof gracz !== 'undefined' && socket.connected) {
        socket.emit("playerMovement", { 
            x: gracz.x, 
            y: gracz.y,
            kierunek: gracz.kierunek,
            ubranyWNomex: gracz.ubranyWNomex,
            stopien: gracz.stopien
        });
    }
}

// === FUNKCJA RYSUJĄCA INNYCH GRACZY ===
function rysujInnychGraczy(ctx) {
    Object.keys(inniGracze).forEach((id) => {
        const g = inniGracze[id];
        
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.scale(1.3, 1.3);

        // Cień
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 50, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ubiór drugiego gracza
        if (g.ubranyWNomex) {
            ctx.fillStyle = "#c8ab84";
            ctx.beginPath();
            ctx.roundRect(-18, -28, 36, 42, 4);
            ctx.fill();
        } else {
            ctx.fillStyle = "#3182ce";
            ctx.beginPath();
            ctx.roundRect(-16, -28, 32, 40, 4);
            ctx.fill();
        }

        // Głowa
        ctx.fillStyle = "#d89b6b";
        ctx.beginPath();
        ctx.roundRect(-12, -48, 24, 22, 4);
        ctx.fill();

        ctx.restore();

        // Rysowanie nicku nad postacią
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(g.nick || "Druh", g.x, g.y - 65);
    });
}
     