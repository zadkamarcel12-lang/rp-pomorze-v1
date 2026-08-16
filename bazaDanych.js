class BazaDanych {
    constructor() {
        this.dbName = "RPPomorzeDB";
        this.dbVersion = 1;
        this.db = null;
    }

    otworzBaze() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("gracze")) {
                    db.createObjectStore("gracze", { keyPath: "login" });
                }
            };

            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(true);
            };

            request.onerror = (e) => {
                console.error("Błąd bazy danych:", e.target.error);
                reject(false);
            };
        });
    }

    zarejestruj(login, haslo) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction("gracze", "readwrite");
            const store = tx.objectStore("gracze");

            const reqGet = store.get(login);
            reqGet.onsuccess = () => {
                if (reqGet.result) {
                    resolve({ sukces: false, wiadomosc: "Taki gracz już istnieje!" });
                } else {
                    const nowyGracz = {
                        login: login,
                        haslo: haslo,
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                        ubranyWNomex: false
                    };
                    store.add(nowyGracz);
                    resolve({ sukces: true, wiadomosc: "Konto utworzone! Możesz się zalogować." });
                }
            };
        });
    }

    zaloguj(login, haslo) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction("gracze", "readonly");
            const store = tx.objectStore("gracze");

            const reqGet = store.get(login);
            reqGet.onsuccess = () => {
                const gracz = reqGet.result;
                if (!gracz) {
                    resolve({ sukces: false, wiadomosc: "Nie znaleziono takiego gracza!" });
                } else if (gracz.haslo !== haslo) {
                    resolve({ sukces: false, wiadomosc: "Nieprawidłowe hasło!" });
                } else {
                    resolve({ sukces: true, dane: gracz });
                }
            };
        });
    }

    zapiszStan(login, x, y, ubranyWNomex) {
        return new Promise((resolve) => {
            const tx = this.db.transaction("gracze", "readwrite");
            const store = tx.objectStore("gracze");

            const reqGet = store.get(login);
            reqGet.onsuccess = () => {
                const gracz = reqGet.result;
                if (gracz) {
                    gracz.x = x;
                    gracz.y = y;
                    gracz.ubranyWNomex = ubranyWNomex;
                    store.put(gracz);
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
        });
    }
}

window.baza = new BazaDanych();