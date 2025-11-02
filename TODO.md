# TODO — Kiosk Raspberry Pi (React + FastAPI/NestJS + SQLite)

> Listă de lucru derivată din planul proiectului tău (arhitectură, pași, module). Bifează pe măsură ce finalizezi.  
> Recomandare VS Code: instalează extensia **Todo Tree** (ms-vscode.vscode-todo-tree) pentru panoul de TODO-uri.

## 0) Pregătire Raspberry Pi
- [x] Flash **Raspberry Pi OS (64-bit)**
- [x] `raspi-config` → activează **I2C**, **SPI**, **Serial**, **SSH**
- [x] Instalează pachete: `git`, `python3-venv`, `build-essential`, `cups`, `libcups2-dev`, `chromium-browser`, `wkhtmltopdf`, `mosquitto`, `mosquitto-clients`, `libopenjp2-7`, `libtiff5`
- [ ] Adaugă utilizatorul în grupuri: `lp`, `lpadmin`, `i2c`, `spi`, `gpio`
- [ ] CUPS: adaugă imprimanta și **tipărește o pagină de test**

## 1) Repo & structură mono-repo
- [ ] Inițializează repo: `pi-kiosk/` (sau **LTS/**)
- [ ] Creează directoare: `backend/`, `frontend/`, `deploy/`, `templates/`
- [x] Adaugă `.editorconfig`, `.gitignore`, `README.md`
- [x] Decide manager de pachete JS (**npm/pnpm**), stilizare și convenții

## 2) Backend — schelet (FastAPI sau NestJS/Express)
- [x] Creează **venv** și instalează dependențe (FastAPI/NestJS, SQLAlchemy/TypeORM, Alembic etc.)
- [ ] Endpoint minim: `GET /api/health`
- [ ] Configurare **SQLite (WAL)** + pragmas, conexiune thread-safe
- [ ] **Alembic** init + prima migrare

## 3) Autentificare & RBAC
- [ ] Modele: `users`, `sessions` (+ `role`: admin/operator/viewer)
- [ ] Rute: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`
- [ ] Parole hash (argon2/bcrypt), cookie **HttpOnly**, **SameSite=Strict**
- [ ] Seed user **admin** (+ parolă puternică)

## 4) Achiziție senzori & telemetrie live
- [ ] Interfață `SensorReader` (contract comun)
- [ ] Implementări după bus: **I²C**, **SPI**, **Serial/RS-485 (Modbus)**, **GPIO**
- [ ] `SensorBus` cu **asyncio** (pub/sub) sau **MQTT local** (Mosquitto)
- [ ] WebSocket: `GET /ws/live` — transmite `{sensor_id, ts, value, unit}`
- [ ] API senzori: `GET /api/sensors`, `PATCH /api/sensors/:id` (enable/disable/config)

## 5) Joburi & măsurători
- [ ] Tabele: `jobs(id,status,started_at,finished_at,created_by,params)`, `measurements(job_id,sensor_id,ts,value,unit,meta)`
- [ ] Flux: `POST /api/jobs` → rulează sampling (durată, rată, senzori selectați)
- [ ] Inserții batch (~250 ms) + stream în UI prin WS
- [ ] Sumare job: **min/avg/max**, count, durată
- [ ] API: `GET /api/jobs`, `GET /api/jobs/:id`, `GET /api/jobs/:id/measurements`

## 6) Generare PDF & tipărire
- [ ] Șablon HTML (Jinja2) → antet cu logo, meta job, tabel, sumar
- [ ] Renderer PDF: **WeasyPrint** sau **wkhtmltopdf** / **Chromium headless**
- [ ] Persistă PDF la: `/var/kiosk/pdfs/<job_id>/<timestamp>.pdf` (+ tabel `pdfs`)
- [ ] API: `POST /api/pdfs` (generează), `GET /api/pdfs`, `GET /api/pdfs/:id/download`
- [ ] Tipărire: `POST /api/pdfs/:id/print` → CUPS (`lp -d <printer> file.pdf`)

## 7) Frontend (React, UI industrial)
- [ ] Scaffold Vite + deps: `axios`, `zustand`, `socket.io-client`, `recharts`
- [ ] Pagini: **/login**, **/dashboard**, **/jobs/new**, **/jobs/:id**, **/pdfs**, **/settings**
- [ ] Integrare REST + WebSocket (auto-retry, offline toast)
- [ ] UI industrial: butoane mari, contrast, touch-friendly, numpad PIN (quick unlock)

## 8) Kiosk mode & servicii
- [ ] Servește UI (din FastAPI **/static** sau **nginx**)
- [ ] Pornește **Chromium** în kiosk: `--kiosk --noerrdialogs --incognito http://localhost:8080`
- [ ] **systemd**: `kiosk-api.service`, `kiosk-sensor.service` (opțional), `chromium-kiosk.service`
- [ ] Ordine boot: DB/migrări → API → senzori → Chromium

## 9) Backup, export, retenție
- [ ] Script backup zilnic: SQLite `.backup` + sincronizare folder **pdfs/**
- [ ] Export date: `GET /api/exports/csv?from=&to=&sensor_id=`
- [ ] Politică de retenție (ex. **măsurători 6 luni**, **PDF-uri 12 luni**)

## 10) Observabilitate & sănătate
- [ ] Endpointuri: `/api/health`, `/api/ready`
- [ ] `/metrics` (Prometheus): `job_duration_seconds`, `sensor_read_errors_total`, `pdf_generate_seconds`, `print_jobs_total`
- [ ] “Support bundle”: arhivează **logs + ultimele N joburi + config**

## 11) Securizare
- [ ] API doar pe `127.0.0.1` (UI și BE pe același dispozitiv)
- [ ] RBAC strict pe rute, CSRF pentru operații state-changing
- [ ] udev rules pt. imprimantă USB (nume stabil), auto-recover
- [ ] Retry + backoff pentru senzori și coadă pentru print dacă offline

## 12) Testare
- [ ] Unit: normalizatori senzori, validatori, guard-uri RBAC
- [ ] Integrare: FastAPI + SQLite + WS, inserții batch, PDF generare
- [ ] Hardware-in-the-loop pe Pi (senzor dev/simulator Modbus)
- [ ] E2E UI (Playwright): login → start job → live chart → stop → PDF → print

## 13) Artefacte & livrabile
- [ ] Documentație instalare (Pi + servicii)
- [ ] Ghid operator (workflow “măsurare → PDF → print”)
- [ ] Șabloane PDF branduite
- [ ] Script **run_dev.sh** (pornire backend + frontend)
- [ ] Unități **systemd** în `deploy/` + instrucțiuni

### Extra (calibrare & UX)
- [ ] Calibrare senzori + persistă coeficienți (DB `settings`)
- [ ] Debounce/filtrare semnal, downsampling pentru grafice
- [ ] Ecran unlock cu PIN operator după login inițial

### Definition of Done (DoD)
- [ ] Boot → UI fullscreen în **< 30s**
- [ ] Stop job → PDF generat & gata de print în **< 10s**
- [ ] 60 min rulare fără **ERROR** în journald
- [ ] Offline-first: funcțiile critice merg **fără internet**

---

## Cum folosești în VS Code
1. Pune acest fișier **`TODO.md`** la rădăcina repo-ului.
2. Deschide-l și bifează task-urile (checkbox-urile sunt interactive în preview).
3. Opțional: instalează extensia **Todo Tree** pentru un panou “TODOs” în sidebar.

