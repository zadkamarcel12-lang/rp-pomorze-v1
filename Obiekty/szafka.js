class SzafkaOSP {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.szerokosc = 70;
        this.wysokosc = 120;
        this.zasiegInterakcji = 90;
        this.otwarta = false;
    }

    czyGraczBlisko(graczX, graczY) {
        const odleglosc = Math.hypot(this.x - graczX, this.y - graczY);
        return odleglosc <= this.zasiegInterakcji;
    }

    interakcja(gracz) {
        if (this.czyGraczBlisko(gracz.x, gracz.y)) {
            gracz.ubranyWNomex = !gracz.ubranyWNomex;
            this.otwarta = !this.otwarta;
            console.log(gracz.ubranyWNomex ? "Ubrano Nomex PSP!" : "Zdjęto Nomex.");
            return true;
        }
        return false;
    }

    rysuj(ctx, gracz) {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(0, 5, 40, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#374151";
        ctx.fillRect(-this.szerokosc / 2, -this.wysokosc, this.szerokosc, this.wysokosc);

        ctx.strokeStyle = "#1f2937";
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.szerokosc / 2, -this.wysokosc, this.szerokosc, this.wysokosc);

        ctx.beginPath();
        ctx.moveTo(0, -this.wysokosc);
        ctx.lineTo(0, 0);
        ctx.stroke();

        ctx.fillStyle = "#111827";
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(-28, -this.wysokosc + 12 + (i * 8), 20, 3);
            ctx.fillRect(8, -this.wysokosc + 12 + (i * 8), 20, 3);
        }

        ctx.fillStyle = "#9ca3af";
        ctx.fillRect(-6, -this.wysokosc / 2, 4, 16);
        ctx.fillRect(2, -this.wysokosc / 2, 4, 16);

        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(-22, -this.wysokosc + 55, 44, 14);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px Arial";
        ctx.textAlign = "center";
        ctx.fillText("OSP", 0, -this.wysokosc + 65);

        if (gracz && this.czyGraczBlisko(gracz.x, gracz.y)) {
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(-this.szerokosc / 2 - 4, -this.wysokosc - 4, this.szerokosc + 8, this.wysokosc + 8);

            ctx.fillStyle = "#111827";
            ctx.beginPath();
            ctx.roundRect(-20, -this.wysokosc - 32, 40, 22, 5);
            ctx.fill();

            ctx.fillStyle = "#facc15";
            ctx.font = "bold 13px Arial";
            ctx.textAlign = "center";
            ctx.fillText("[E]", 0, -this.wysokosc - 17);
        }

        ctx.restore();
    }
}