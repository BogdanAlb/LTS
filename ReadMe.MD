# LTS — Sistem de Masurare Precarcare

Acesta este un program de masurare a greutatii in timp real, creat pentru **Raspberry Pi 4**.
Programul ruleaza automat la pornirea dispozitivului si afiseaza pe ecran o interfata grafica
prin care poti vedea greutatea curenta, un grafic al evolutiei si poti exporta datele ca PDF.

---

## De ce ai nevoie inainte sa incepi

### Hardware (componente fizice)
- Un **Raspberry Pi 4**
- Un **senzor de greutate HX711** conectat la Raspberry Pi
- Un **ecran** conectat la Raspberry Pi
- Acces la **internet** (doar pentru instalare)

### Software (sistem de operare)
- **Raspberry Pi OS Bookworm 64-bit — varianta Desktop**

> Daca nu ai instalat inca sistemul de operare, descarca-l de pe site-ul oficial Raspberry Pi
> si urmeaza instructiunile de acolo inainte sa continui.

---

## Conectare senzor HX711 la Raspberry Pi

Inainte sa instalezi programul, conecteaza fizic senzorul la Raspberry Pi conform tabelului:

| Pin pe senzorul HX711 | Pin pe Raspberry Pi 4 |
|-----------------------|----------------------|
| VCC (alimentare) | 5V — Pin fizic 2 |
| GND (masa) | GND — Pin fizic 6 |
| DT / DOUT (date) | GPIO 5 — Pin fizic 29 |
| SCK (ceas) | GPIO 6 — Pin fizic 31 |

> Daca nu esti sigur care pin este care pe Raspberry Pi, cauta pe Google imaginea
> "Raspberry Pi 4 GPIO pinout" — vei gasi un diagrama colorata cu numerele pinilor.

---

## Instalare pas cu pas

Deschide un terminal pe Raspberry Pi (aplicatia Terminal din meniu) si urmeaza pasii de mai jos.
**Copiaza si lipeste** fiecare comanda exact asa cum apare.

---

### Pasul 1 — Actualizare sistem

Mai intai asigura-te ca sistemul de operare este la zi:

```bash
sudo apt update && sudo apt upgrade -y
```

> Aceasta comanda poate dura cateva minute. Asteapta sa se termine inainte sa continui.

---

### Pasul 2 — Instalare programe necesare

Instaleaza toate programele de care are nevoie aplicatia:

```bash
sudo apt install -y \
  git \
  python3 \
  python3-pip \
  python3-venv \
  nodejs \
  npm \
  chromium \
  curl \
  netcat-openbsd \
  wireless-tools
```

> `wireless-tools` este necesar pentru afisarea puterii semnalului Wi-Fi in aplicatie.

---

### Pasul 3 — Descarca proiectul

Descarca codul aplicatiei pe Raspberry Pi:

```bash
cd ~
git clone https://github.com/<user>/LTS.git
cd LTS
```

---

### Pasul 4 — Pregateste partea de server (backend)

Aceasta parte se ocupa cu citirea senzorului si gestionarea datelor:

```bash
cd ~/LTS/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> Comanda `python3 -m venv venv` creeaza un mediu izolat pentru Python — practic un dosar
> separat unde se instaleaza librarariile aplicatiei, fara sa afecteze restul sistemului.

---

### Pasul 5 — Construieste interfata grafica (frontend)

Aceasta parte se ocupa cu ce vede utilizatorul pe ecran:

```bash
cd ~/LTS/frontend
npm install
npm run build
```

> `npm install` descarca toate librarariile necesare, iar `npm run build` le impacheteaza
> intr-o versiune optimizata pentru productie. Poate dura 1-2 minute.

---

### Pasul 6 — Instaleaza serverul pentru interfata grafica

```bash
sudo npm install -g serve
```

Verifica dupa instalare ca programul a fost gasit corect:

```bash
which serve
```

Ar trebui sa afiseze `/usr/bin/serve`. Daca afiseaza altceva, noteaza calea — o vei folosi la pasul urmator.

---

### Pasul 7 — Permisiuni script pornire

Fa scriptul de pornire a aplicatiei executabil:

```bash
chmod +x ~/LTS/start-kiosk.sh
```

---

### Pasul 8 — Configurare pornire automata (servicii systemd)

Acesti pasi fac ca aplicatia sa porneasca automat de fiecare data cand Raspberry Pi este pornit.

**8a. Creeaza fisierul pentru server (backend)**

```bash
sudo nano /etc/systemd/system/lts-backend.service
```

Lipeste urmatorul continut in editor, apoi apasa `Ctrl+X`, apoi `Y`, apoi `Enter` pentru a salva:

```ini
[Unit]
Description=LTS Backend (FastAPI/Uvicorn)
Wants=network-online.target
After=network-online.target

[Service]
User=bogdan
WorkingDirectory=/home/bogdan/LTS/backend
Environment=PYTHONUNBUFFERED=1
ExecStart=/home/bogdan/LTS/backend/venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**8b. Creeaza fisierul pentru interfata grafica (frontend)**

```bash
sudo nano /etc/systemd/system/lts-frontend.service
```

```ini
[Unit]
Description=LTS Frontend (static server)
Wants=network-online.target
After=network-online.target

[Service]
User=bogdan
WorkingDirectory=/home/bogdan/LTS/frontend
Environment=NODE_ENV=production
ExecStart=/usr/bin/serve -s dist -l 5173
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**8c. Creeaza fisierul pentru browser (kiosk)**

Acesta porneste automat Chromium in modul ecran complet:

```bash
mkdir -p ~/.config/systemd/user/
nano ~/.config/systemd/user/lts-kiosk.service
```

```ini
[Unit]
Description=LTS kiosk (Chromium fullscreen)
After=network-online.target graphical-session.target
Wants=network-online.target

[Service]
Type=simple
Environment=DISPLAY=:0
Environment=KIOSK=1
Environment=KIOSK_OSK=1
WorkingDirectory=/home/bogdan/LTS
ExecStart=/home/bogdan/LTS/start-kiosk.sh
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
```

**8d. Activeaza si porneste serviciile**

```bash
# Activeaza serverul si interfata grafica (pornesc la boot)
sudo systemctl daemon-reload
sudo systemctl enable lts-backend.service lts-frontend.service
sudo systemctl start lts-backend.service lts-frontend.service

# Activeaza browserul kiosk (porneste la login)
systemctl --user daemon-reload
systemctl --user enable lts-kiosk.service
systemctl --user start lts-kiosk.service

# Permite serviciului browser sa ruleze fara sa fie nevoie de login manual
sudo loginctl enable-linger bogdan
```

---

## Verificare — totul functioneaza?

Dupa ce ai terminat instalarea, poti verifica daca fiecare parte functioneaza:

```bash
# Verifica serverul backend
sudo systemctl status lts-backend.service

# Verifica interfata grafica
sudo systemctl status lts-frontend.service

# Verifica browserul kiosk
systemctl --user status lts-kiosk.service
```

Daca vrei sa testezi rapid ca serverul raspunde, ruleaza:

```bash
curl http://localhost:8000/
```

Ar trebui sa primesti raspunsul: `{"status":"LTS Backend is running"}`

Pentru a vedea jurnalul de erori al browserului:

```bash
tail -f ~/LTS/.logs/kiosk.log
```

---

## Calibrare senzor

Dupa ce ai montat fizic senzorul, este recomandat sa il calibrezi:

```bash
cd ~/LTS
python3 main.py
```

In terminal vei vedea greutatea masurata in timp real. Comenzi disponibile:
- Apasa `T` pentru a face **tare** (zerare — reseteaza greutatea la 0)
- Apasa `Q` pentru a **iesi** din program

---

## Rulare manuala (doar pentru testare / dezvoltare)

Daca vrei sa pornesti aplicatia manual fara serviciile automate:

> **Important:** Nu rula manual daca serviciile automate sunt deja active.
> Vei primi erori de tipul "adresa deja in folosinta" pe porturile 8000 sau 5173.
> Opreste mai intai serviciile cu `sudo systemctl stop lts-backend lts-frontend`.

```bash
# Porneste serverul backend
cd ~/LTS/backend
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000

# Intr-un terminal separat, porneste interfata grafica
cd ~/LTS/frontend
npm run dev
```

---

## Versiuni software folosite

| Program | Versiune |
|---------|---------|
| Python | 3.13 |
| Node.js | 20.x |
| npm | 10.x |
| FastAPI | 0.120.0 |
| Uvicorn | 0.38.0 |
| RPi.GPIO | 0.7.1 |
| Pydantic | 2.12.3 |
| React | 19.1.1 |
| Vite | 7.1.7 |
| serve (npm global) | 14.2.5 |

---

## Structura proiect

```
LTS/
├── backend/                          # Serverul aplicatiei (Python)
│   ├── app.py                        # Punctul de intrare al serverului
│   ├── requirements.txt              # Lista de librarii Python necesare
│   ├── routes/
│   │   ├── sensor.py                 # Citire greutate si semnal Wi-Fi
│   │   ├── users.py                  # Autentificare si gestionare utilizatori
│   │   └── measurements.py           # Inregistrare masuratori
│   ├── services/
│   │   └── sensor_readers/
│   │       └── hx711_reader.py       # Comunicare cu senzorul HX711
│   └── storage/
│       ├── db.py                     # Structura bazei de date
│       └── lts.db                    # Baza de date (creata automat)
├── frontend/                         # Interfata grafica (React)
│   ├── src/
│   │   ├── pages/                    # Paginile aplicatiei: Dashboard, Grafic, etc.
│   │   ├── components/               # Elemente vizuale reutilizabile
│   │   ├── api/                      # Comunicare cu serverul backend
│   │   └── i18n/                     # Traduceri: romana, engleza, germana
│   ├── package.json                  # Lista de librarii JavaScript necesare
│   └── dist/                         # Versiunea finala (generata de npm run build)
├── butonON-OFF/
│   └── power_button.py               # Script optional pentru buton fizic de pornire/oprire
├── start-kiosk.sh                    # Script de pornire a browserului in mod kiosk
├── main.py                           # Program de test si calibrare a senzorului
└── ReadMe.MD                         # Acest fisier
```
