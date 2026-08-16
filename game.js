// Połączenie z serwerem (podmień na adres swojego serwera, np. na Render.com)
const socket = io("http://localhost:3000");

const inniGracze = {};

// Obsługa przycisku zaloguj
document.getElementById("btnZaloguj").addEventListener("click", () => {
    const nick = document.getElementById("inputLogin").value.trim();
    
    if (nick.length > 0) {
        // Ukrywamy panel logowania, pokazujemy UI gry
        document.getElementById("ekranLogowania").classList.add("ukryty");
        document.getElementById("uiGry").classList.remove("ukryty");
        document.getElementById("nazwaZalogowanego").innerText = nick;

        // Powiadamiamy serwer o zalogowaniu gracza
        socket.emit("doluaczDoGry", { nick: nick, x: gracz.x, y: gracz.y });
    }
});

// === NASŁUCHIWANIE INNYCH GRACZY ===

// Odbieramy listę obecnych graczy
socket.on("aktualniGracze", (gracze) => {
    Object.keys(gracze).forEach((id) => {
        if (id !== socket.id) {
            inniGracze[id] = gracze[id];
        }
    });
});

// Nowy gracz dołącza
socket.on("nowyGracz", (daneGracza) => {
    inniGracze[daneGracza.id] = daneGracza;
});

// Inny gracz się poruszył
socket.on("graczSiePoruszyl", (daneGracza) => {
    if (inniGracze[daneGracza.id]) {
        inniGracze[daneGracza.id].x = daneGracza.x;
        inniGracze[daneGracza.id].y = daneGracza.y;
    }
});

// Gracz wyszedł z gry
socket.on("graczOdlaczony", (id) => {
    delete inniGracze[id];
});

// === WYSYŁANIE RUCHU ===
// W swojej pętli gry (tam gdzie zmieniasz gracz.x i gracz.y po wciśnięciu klawiszy):
function obslugaRuchu() {
    // np. gracz.x += predkosc;
    
    // Po zmianie pozycji wysyłamy ją na serwer:
    socket.emit("ruchGracza", { x: gracz.x, y: gracz.y });
}

// === RYSOWANIE INNYCH GRACZY NA CANVAS ===
function rysujInnychGraczy(ctx) {
    Object.keys(inniGracze).forEach((id) => {
        const g = inniGracze[id];
        
        // Rysujemy postać drugiego gracza
        ctx.fillStyle = "red";
        ctx.fillRect(g.x, g.y, 32, 32);

        // Rysujemy nick nad postacią
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(g.nick || "Druh", g.x + 16, g.y - 6);
    });
}