const socket = io("https://rp-pomorze-serwer.onrender.com");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function dopasujCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
dopasujCanvas();
window.addEventListener("resize", dopasujCanvas);

const inniGracze = {};

// Obiekt kamery śledzącej gracza
const kamera = {
    x: 0,
    y: 0
};

// Konsola debugowania na ekranie
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
debugBox.innerHTML = "<b>[SYSTEM]</b> Inicjalizacja kamery i sieci...<br>";
document.body.appendChild(debugBox);

function logDoKonsoli(wiadomosc) {
    const czas = new Date().toLocaleTimeString();
    debugBox.innerHTML += `[${czas}] ${wiadomosc}<br>`;
    debugBox.scrollTop = debugBox.scrollHeight;
}

socket.on("connect", () => {
    logDoKonsoli(`Połączono z serwerem! ID: ${socket.id}`);
});

socket.on("connect_error", (err) => {
    logDoKonsoli(`<span style="color:red;">Błąd połączenia: ${err.message}</span>`);
});

document.getElementById("btnZaloguj").addEventListener("click", () => {
    const nick = document.getElementById("inputLogin").value.trim();
    
    if (nick.length > 0) {
        document.getElementById("ekranLogowania").classList.add("ukryty");
        document.getElementById("uiGry").classList.remove("ukryty");
        document.getElementById("nazwaZalogowanego").innerText = nick;

        if (typeof gracz !== 'undefined') {
            gracz.nick = nick;
        }

        const posX = typeof gracz !== 'undefined' ? gracz.x : 1500;
        const posY = typeof gracz !== 'undefined' ? gracz.y : 1500;
        
        logDoKonsoli(`Wysyłam joinGame: ${nick} (${Math.round(posX)}, ${Math.round(posY)})`);
        socket.emit("joinGame", { nick: nick, x: posX, y: posY });
    } else {
        alert("Wpisz nazwę gracza!");
    }
});

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

// Rysowanie siatki terenu, żeby widać było ruch kamery
function rysujSiatkeTla(ctx) {
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    const rozmiarSiatki = 100;
    
    const startX = Math.floor(kamera.x / rozmiarSiatki) * rozmiarSiatki;
    const endX = startX + canvas.width + rozmiarSiatki * 2;
    const startY = Math.floor(kamera.y / rozmiarSiatki) * rozmiarSiatki;
    const endY = startY + canvas.height + rozmiarSiatki * 2;

    for (let x = startX; x < endX; x += rozmiarSiatki) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
    }
    for (let y = startY; y < endY; y += rozmiarSiatki) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

function rysujInnychGraczy(ctx) {
    Object.keys(inniGracze).forEach((id) => {
        const g = inniGracze[id];
        
        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.scale(1.3, 1.3);

        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 50, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();

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

        ctx.fillStyle = "#d89b6b";
        ctx.beginPath();
        ctx.roundRect(-12, -48, 24, 22, 4);
        ctx.fill();

        // Nick innego gracza
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(g.nick || "Druh", 0, -55);

        ctx.restore();
    });
}

let licznikRuchu = 0;

function petlaGry() {
    // Czyszczenie ekranu
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (typeof gracz !== 'undefined') {
        if (typeof gracz.aktualizuj === 'function') {
            gracz.aktualizuj();
        }
        // Kamera śledzi gracza (ustawia go na środku ekranu)
        kamera.x = gracz.x - canvas.width / 2;
        kamera.y = gracz.y - canvas.height / 2;
    }

    // === ROZPOCZĘCIE RYSOWANIA ŚWIATA ZA KAMERĄ ===
    ctx.save();
    ctx.translate(-kamera.x, -kamera.y);

    rysujSiatkeTla(ctx);

    if (typeof gracz !== 'undefined') {
        if (typeof gracz.rysuj === 'function') {
            gracz.rysuj(ctx);
        }
    }

    rysujInnychGraczy(ctx);

    ctx.restore();
    // === KONIEC RYSOWANIA ŚWIATA ===

    licznikRuchu++;
    if (licznikRuchu % 3 === 0) {
        wyslijRuch();
    }

    requestAnimationFrame(petlaGry);
}

requestAnimationFrame(petlaGry);