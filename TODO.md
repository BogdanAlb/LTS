# TODO — LTS Sistem de Masurare Preincarcare (React + FastAPI + SQLite)

> Lista de lucru derivata din starea actuala a proiectului. Bifa pe masura ce finalizezi.
> Recomandate VS Code: extensia **Todo Tree** (ms-vscode.vscode-todo-tree).

---

## 0) Pregătire Raspberry Pi
- [X] Flash **Raspberry Pi OS Bookworm 64-bit Desktop**
- [X] Instalează pachete: `git`, `python3-venv`, `nodejs`, `npm`, `chromium`, `curl`, `netcat-openbsd`, `wireless-tools`
- [X] Instalează `serve` global: `sudo npm install -g serve`

## 1) Repo & structură
- [X] Inițializează repo `LTS/`
- [X] Creează directoare: `backend/`, `frontend/`, `butonON-OFF/`
- [X] `README.md`, `.gitignore`

## 2) Backend — FastAPI + SQLite
- [X] `venv` + instalează dependențe (`requirements.txt`)
- [X] Endpoint health: `GET /` → `{"status":"LTS Backend is running"}`
- [X] Structură bază de date SQLite (`storage/db.py`, `storage/lts.db`)
- [X] Citire senzor HX711 via GPIO (`services/sensor_readers/hx711_reader.py`)
- [X] Afișare putere semnal Wi-Fi (`routes/sensor.py`)
- [X] Rute: `routes/sensor.py`, `routes/users.py`, `routes/measurements.py`
- [ ] Calibrare senzor — persistă factorul de scalare în DB (acum `main.py` root a fost șters)
- [ ] Seed user admin cu parolă implicită securizată

## 3) Frontend — React + Vite
- [X] Scaffold Vite + dependențe (`package.json`)
- [X] Pagini: Dashboard, Grafic, etc. (`src/pages/`)
- [X] Componente reutilizabile (`src/components/`)
- [X] Comunicare cu backend (`src/api/`)
- [X] i18n: română, engleză, germană (`src/i18n/`)
- [X] Buton Start / Stop măsurare
- [X] Export PDF alb/negru
- [X] `npm run build` → `dist/` (producție)
- [ ] Gestionare erori offline (toast dacă backend-ul nu răspunde)

## 4) Kiosk mode & servicii systemd
- [X] `start-kiosk.sh` executabil
- [X] `lts-backend.service` (system, pornește la boot)
- [X] `lts-frontend.service` (system, pornește la boot)
- [X] `lts-kiosk.service` (user, pornește la login)
- [X] `sudo loginctl enable-linger bogdan`
- [X] Jurnal kiosk: `~/.logs/kiosk.log`

## 5) Optimizare timp de pornire
- [ ] Înlocuiește `network-online.target` → `network.target` în serviciile LTS
- [ ] Dezactivează servicii inutile (`NetworkManager-wait-online`, `cloud-init`, `bluetooth`, `avahi`, `cups`, `mosquitto` etc.)
- [ ] Verifică rezultat: `systemd-analyze` → boot < 15s

## 6) Documentație & livrabile
- [X] `README.md` — instalare pas cu pas, conectare HX711, servicii systemd, versiuni software
- [X] Secțiune optimizare boot în README
- [ ] Actualizare secțiune "Calibrare senzor" din README (referința la `main.py` root e invalidă)
- [ ] Ghid operator: workflow măsurare → export PDF

---

### Definition of Done
- [ ] Boot → UI fullscreen în **< 30s**
- [ ] 60 min rulare fără **ERROR** în journald
- [ ] Export PDF funcțional fără internet
- [ ] Calibrare senzor accesibilă (din UI sau script documentat)
