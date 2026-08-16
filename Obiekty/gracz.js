class Gracz {
    constructor() {
        this.x = 1500; // Start na środku dużej mapy (np. 3000x3000px)
        this.y = 1500;

        this.predkosc = 3.5;
        this.klawisze = {};
        this.kierunek = "dol";
        this.chodzi = false;

        this.animacja = 0;
        this.czasAnimacji = 0;

        this.skala = 1.3;
        this.minSkala = 0.6;
        this.maxSkala = 3.0;

        this.ubranyWNomex = false;
        this.stopien = "st_strazak";
        this.zalogowany = false;
        this.nick = "";

        this.sprawdzSesje();
    }

    sprawdzSesje() {
        const zapisanaSesja = localStorage.getItem("sesjaGracza");
        if (zapisanaSesja) {
            try {
                const dane = JSON.parse(zapisanaSesja);
                this.wczytajDane(dane);
                this.zalogowany = true;
            } catch (e) {
                console.error("Błąd podczas wczytywania sesji gracza:", e);
            }
        }
    }

    zaloguj(dane) {
        this.zalogowany = true;
        this.wczytajDane(dane);
        this.zapiszSesje();
    }

    wyloguj() {
        this.zalogowany = false;
        localStorage.removeItem("sesjaGracza");
    }

    zapiszSesje() {
        const daneDoZapisu = {
            x: this.x,
            y: this.y,
            ubranyWNomex: this.ubranyWNomex,
            stopien: this.stopien
        };
        localStorage.setItem("sesjaGracza", JSON.stringify(daneDoZapisu));
    }

    wczytajDane(dane) {
        if (dane) {
            this.x = dane.x || 1500;
            this.y = dane.y || 1500;
            this.ubranyWNomex = dane.ubranyWNomex || false;
            if (dane.stopien) this.stopien = dane.stopien;
        }
    }

    inicjalizujSterowanie(obiektyInteraktywne = []) {
        window.addEventListener("keydown", e => {
            const klawisz = e.key.toLowerCase();
            this.klawisze[klawisz] = true;

            if (klawisz === "e") {
                obiektyInteraktywne.forEach(obiekt => {
                    if (typeof obiekt.interakcja === "function") {
                        obiekt.interakcja(this);
                    }
                });
            }

            if (e.key === "+" || e.key === "=") this.skala = Math.min(this.maxSkala, this.skala + 0.15);
            if (e.key === "-") this.skala = Math.max(this.minSkala, this.skala - 0.15);
        });

        window.addEventListener("keyup", e => {
            this.klawisze[e.key.toLowerCase()] = false;
        });

        window.addEventListener("wheel", e => {
            if (e.deltaY < 0) this.skala = Math.min(this.maxSkala, this.skala + 0.1);
            else this.skala = Math.max(this.minSkala, this.skala - 0.1);
        }, { passive: true });
    }

    aktualizuj() {
        let dx = 0;
        let dy = 0;

        if (this.klawisze["w"] || this.klawisze["arrowup"]) { dy -= 1; this.kierunek = "gora"; }
        if (this.klawisze["s"] || this.klawisze["arrowdown"]) { dy += 1; this.kierunek = "dol"; }
        if (this.klawisze["a"] || this.klawisze["arrowleft"]) { dx -= 1; this.kierunek = "lewo"; }
        if (this.klawisze["d"] || this.klawisze["arrowright"]) { dx += 1; this.kierunek = "prawo"; }

        this.chodzi = dx !== 0 || dy !== 0;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        this.x += dx * this.predkosc;
        this.y += dy * this.predkosc;

        // Granice świata gry (np. mapa 3000x3000 pikseli)
        this.x = Math.max(50, Math.min(3000, this.x));
        this.y = Math.max(50, Math.min(3000, this.y));

        if (this.chodzi) {
            this.czasAnimacji += 0.22;
            if (this.czasAnimacji > Math.PI * 2) this.czasAnimacji = 0;
            this.animacja = Math.sin(this.czasAnimacji);
            
            this.zapiszSesje();

            if (typeof wyslijRuch === "function") {
                wyslijRuch();
            }
        } else {
            this.animacja *= 0.8;
        }
    }

    rysuj(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.skala, this.skala);

        this.rysujCien(ctx);

        if (this.kierunek === "gora") {
            this.rysujTyl(ctx);
        } else {
            this.rysujPrzod(ctx);
        }

        // Nick nad własną postacią (wewnątrz translacji gracza)
        ctx.fillStyle = "white";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(this.nick || "Druh", 0, -55);

        ctx.restore();
    }

    rysujCien(ctx) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 50, 24, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    rysujLewaNoga(ctx, isMoving) {
        const ruchNogi = isMoving ? this.animacja * 3.5 : 0;
        ctx.save();
        ctx.translate(-8, ruchNogi);

        if (this.ubranyWNomex) {
            ctx.fillStyle = "#c8ab84";
            ctx.fillRect(-6, 10, 12, 30);
            ctx.fillStyle = "#282d35";
            ctx.fillRect(-6, 20, 12, 12);
            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-6, 34, 12, 4);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-6, 35, 12, 2);
            ctx.fillStyle = "#111111";
            ctx.fillRect(-7, 42, 14, 8);
        } else {
            ctx.fillStyle = "#2b4c7e";
            ctx.fillRect(-5, 10, 10, 32);
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(-6, 42, 12, 6);
        }

        ctx.restore();
    }

    rysujPrawaNoga(ctx, isMoving) {
        const ruchNogi = isMoving ? -this.animacja * 3.5 : 0;
        ctx.save();
        ctx.translate(8, ruchNogi);

        if (this.ubranyWNomex) {
            ctx.fillStyle = "#c8ab84";
            ctx.fillRect(-6, 10, 12, 30);
            ctx.fillStyle = "#282d35";
            ctx.fillRect(-6, 20, 12, 12);
            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-6, 34, 12, 4);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-6, 35, 12, 2);
            ctx.fillStyle = "#111111";
            ctx.fillRect(-7, 42, 14, 8);
        } else {
            ctx.fillStyle = "#2b4c7e";
            ctx.fillRect(-5, 10, 10, 32);
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(-6, 42, 12, 6);
        }

        ctx.restore();
    }

    rysujDystynkcje(ctx, x, y) {
        ctx.fillStyle = "#111111";
        ctx.fillRect(x, y, 10, 5.5);

        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 1;

        switch (this.stopien) {
            case "strazak":
                ctx.beginPath();
                ctx.moveTo(x + 1.5, y + 3.5); ctx.lineTo(x + 5, y + 1.5); ctx.lineTo(x + 8.5, y + 3.5);
                ctx.stroke();
                break;
            case "st_strazak":
                ctx.beginPath();
                ctx.moveTo(x + 1.5, y + 2.5); ctx.lineTo(x + 5, y + 1); ctx.lineTo(x + 8.5, y + 2.5);
                ctx.stroke();
                ctx.fillRect(x + 1.5, y + 3.8, 7, 1);
                break;
            default:
                ctx.fillRect(x + 1.5, y + 2, 7, 1);
                break;
        }
    }

    rysujPrzod(ctx) {
        this.rysujLewaNoga(ctx, this.chodzi);
        this.rysujPrawaNoga(ctx, this.chodzi);

        if (this.ubranyWNomex) {
            ctx.fillStyle = "#22252a";
            ctx.fillRect(-10, -32, 20, 8);

            ctx.fillStyle = "#c8ab84";
            ctx.beginPath();
            ctx.roundRect(-18, -28, 36, 42, 4);
            ctx.fill();

            ctx.fillStyle = "#222222";
            ctx.fillRect(-1.5, -28, 3, 42);

            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-18, -10, 36, 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-18, -8, 36, 2);

            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-18, 5, 36, 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-18, 7, 36, 2);

            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-15, -22, 11, 5);
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-15, -22, 11, 5);

            ctx.fillStyle = "#111111";
            ctx.font = "bold 3.8px Arial";
            ctx.textAlign = "center";
            ctx.fillText("PSP", -9.5, -18.2);

            this.rysujDystynkcje(ctx, -14.5, -15.5);

            ctx.fillStyle = "#111111";
            ctx.fillRect(7, -22, 5, 11);
            ctx.fillStyle = "#d8a600";
            ctx.fillRect(8, -20, 4, 8);
            ctx.fillStyle = "#111111";
            ctx.fillRect(7, -24, 6, 4);
            ctx.fillStyle = "#ffffaa";
            ctx.fillRect(8, -23, 4, 2);

            ctx.fillStyle = "#333333";
            ctx.fillRect(-14, 10, 2, 4);
            ctx.fillStyle = "#111111";
            ctx.beginPath();
            ctx.roundRect(-15, 14, 6, 11, 2);
            ctx.fill();
            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-15, 16, 6, 2);

            ctx.fillStyle = "#c8ab84";
            ctx.fillRect(-25, -26, 6, 20);
            ctx.fillStyle = "#282d35";
            ctx.fillRect(-26, -18, 7, 7);
            ctx.fillStyle = "#111111";
            ctx.fillRect(-26, -5, 7, 9);

            ctx.fillStyle = "#c8ab84";
            ctx.fillRect(19, -26, 6, 20);
            ctx.fillStyle = "#282d35";
            ctx.fillRect(19, -18, 7, 7);
            ctx.fillStyle = "#111111";
            ctx.fillRect(19, -5, 7, 9);
        } else {
            ctx.fillStyle = "#3182ce";
            ctx.beginPath();
            ctx.roundRect(-16, -28, 32, 40, 4);
            ctx.fill();

            ctx.fillStyle = "#3182ce";
            ctx.fillRect(-22, -26, 6, 22);
            ctx.fillRect(16, -26, 6, 22);

            ctx.fillStyle = "#d89b6b";
            ctx.fillRect(-22, -4, 6, 6);
            ctx.fillRect(16, -4, 6, 6);
        }

        ctx.fillStyle = "#d89b6b";
        ctx.beginPath();
        ctx.roundRect(-12, -48, 24, 22, 4);
        ctx.fill();

        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-6, -37, 3.5, 3.5);
        ctx.fillRect(2.5, -37, 3.5, 3.5);

        if (this.ubranyWNomex) {
            this.rysujHelmPrzod(ctx);
        } else {
            ctx.fillStyle = "#4a2e18";
            ctx.fillRect(-12, -51, 24, 6);
        }
    }

    rysujHelmPrzod(ctx) {
        let kolorSkorupy = "#d2f53d";

        ctx.fillStyle = kolorSkorupy;
        ctx.beginPath();
        ctx.arc(0, -51, 18, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = "#b81414";
        ctx.beginPath();
        ctx.moveTo(-15, -51); ctx.lineTo(-7, -58); ctx.lineTo(-4, -53); ctx.lineTo(-12, -48);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(15, -51); ctx.lineTo(7, -58); ctx.lineTo(4, -53); ctx.lineTo(12, -48);
        ctx.fill();

        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-4.5, -62, 9, 14);
        ctx.fillStyle = "#d92323";
        ctx.fillRect(-3.5, -61, 7, 3);
        ctx.fillStyle = "#ffff99";
        ctx.fillRect(-3.5, -53, 7, 3);

        ctx.fillStyle = "#141414";
        ctx.fillRect(-19, -51, 38, 4);

        ctx.fillStyle = "rgba(35, 35, 35, 0.3)";
        ctx.fillRect(-14, -47, 28, 4);
    }

    rysujTyl(ctx) {
        this.rysujLewaNoga(ctx, this.chodzi);
        this.rysujPrawaNoga(ctx, this.chodzi);

        if (this.ubranyWNomex) {
            ctx.fillStyle = "#22252a";
            ctx.fillRect(-13, -36, 26, 12);

            ctx.fillStyle = "#c8ab84";
            ctx.beginPath();
            ctx.roundRect(-18, -28, 36, 42, 4);
            ctx.fill();

            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-18, 5, 36, 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-18, 7, 36, 2);

            ctx.fillStyle = "#ccff00";
            ctx.fillRect(-16, -18, 32, 12);
            ctx.fillStyle = "#111111";
            ctx.font = "bold 3.8px Arial";
            ctx.textAlign = "center";
            ctx.fillText("PAŃSTWOWA", 0, -11);
            ctx.fillText("STRAŻ POŻARNA", 0, -7);

            ctx.fillStyle = "#c8ab84";
            ctx.fillRect(-25, -26, 6, 20);
            ctx.fillStyle = "#282d35";
            ctx.fillRect(-26, -18, 7, 7);
            ctx.fillStyle = "#111111";
            ctx.fillRect(-26, -5, 7, 9);

            ctx.fillStyle = "#c8ab84";
            ctx.fillRect(19, -26, 6, 20);
            ctx.fillStyle = "#282d35";
            ctx.fillRect(19, -18, 7, 7);
            ctx.fillStyle = "#111111";
            ctx.fillRect(19, -5, 7, 9);

            ctx.fillStyle = "#d89b6b";
            ctx.beginPath();
            ctx.roundRect(-12, -48, 24, 22, 4);
            ctx.fill();

            this.rysujHelmTyl(ctx);
        } else {
            ctx.fillStyle = "#3182ce";
            ctx.beginPath();
            ctx.roundRect(-16, -28, 32, 40, 4);
            ctx.fill();

            ctx.fillStyle = "#3182ce";
            ctx.fillRect(-22, -26, 6, 22);
            ctx.fillRect(16, -26, 6, 22);

            ctx.fillStyle = "#d89b6b";
            ctx.fillRect(-22, -4, 6, 6);
            ctx.fillRect(16, -4, 6, 6);

            ctx.fillStyle = "#d89b6b";
            ctx.beginPath();
            ctx.roundRect(-12, -48, 24, 22, 4);
            ctx.fill();

            ctx.fillStyle = "#4a2e18";
            ctx.fillRect(-12, -50, 24, 10);
        }
    }

    rysujHelmTyl(ctx) {
        let kolorSkorupy = "#d2f53d";

        ctx.fillStyle = kolorSkorupy;
        ctx.beginPath();
        ctx.arc(0, -51, 18, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = "#b81414";
        ctx.beginPath();
        ctx.moveTo(-15, -51); ctx.lineTo(-7, -58); ctx.lineTo(-4, -53); ctx.lineTo(-12, -48);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(15, -51); ctx.lineTo(7, -58); ctx.lineTo(4, -53); ctx.lineTo(12, -48);
        ctx.fill();

        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-4, -62, 8, 14);

        ctx.fillStyle = "#1e2229";
        ctx.fillRect(-19, -51, 38, 4);
    }
}

const gracz = new Gracz();
gracz.inicjalizujSterowanie();