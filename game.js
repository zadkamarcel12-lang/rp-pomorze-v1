const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function dopasujEkran() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", dopasujEkran);
dopasujEkran();

window.szafka = new SzafkaOSP(300, 300);
const gracz = new Gracz();

let graAktywna = false;
let zalogowanyUzytkownik = null;

// Inicjalizacja bazy i podpięcie interfejsu
window.baza.otworzBaze().then(() => {
    console.log("Baza danych gotowa.");
});

// Elementy UI
const ekranLogowania = document.getElementById("ekranLogowania");
const uiGry = document.getElementById("uiGry");
const komunikatAuth = document.getElementById("komunikatAuth");
const inputLogin = document.getElementById("inputLogin");
const inputHaslo = document.getElementById("inputHaslo");
const nazwaZalogowanego = document.getElementById("nazwaZalogowanego");

document.getElementById("btnZarejestruj").addEventListener("click", async () => {
    const login = inputLogin.value.trim();
    const haslo = inputHaslo.value.trim();

    if (!login || !haslo) {
        pokazKomunikat("Wpisz login i hasło!", "blad");
        return;
    }

    const res = await window.baza.zarejestruj(login, haslo);
    pokazKomunikat(res.wiadomosc, res.sukces ? "sukces" : "blad");
});

document.getElementById("btnZaloguj").addEventListener("click", async () => {
    const login = inputLogin.value.trim();
    const haslo = inputHaslo.value.trim();

    if (!login || !haslo) {
        pokazKomunikat("Wpisz login i hasło!", "blad");
        return;
    }

    const res = await window.baza.zaloguj(login, haslo);
    if (res.sukces) {
        zalogowanyUzytkownik = res.dane.login;
        gracz.wczytajDane(res.dane);
        
        nazwaZalogowanego.innerText = zalogowanyUzytkownik;
        ekranLogowania.classList.add("ukryty");
        uiGry.classList.remove("ukryty");
        graAktywna = true;
    } else {
        pokazKomunikat(res.wiadomosc, "blad");
    }
});

document.getElementById("btnZapisz").addEventListener("click", async () => {
    if (zalogowanyUzytkownik) {
        await window.baza.zapiszStan(zalogowanyUzytkownik, gracz.x, gracz.y, gracz.ubranyWNomex);
        alert("Stan gry został zapisany!");
    }
});

document.getElementById("btnWyloguj").addEventListener("click", () => {
    graAktywna = false;
    zalogowanyUzytkownik = null;
    uiGry.classList.add("ukryty");
    ekranLogowania.classList.remove("ukryty");
    inputHaslo.value = "";
});

function pokazKomunikat(tekst, typ) {
    komunikatAuth.innerText = tekst;
    komunikatAuth.className = "komunikat " + typ;
}

gracz.inicjalizujSterowanie([window.szafka]);

function petlaGry() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (graAktywna) {
        window.szafka.rysuj(ctx, gracz);
        gracz.aktualizuj(canvas);
        gracz.rysuj(ctx);
    }

    requestAnimationFrame(petlaGry);
}

petlaGry();