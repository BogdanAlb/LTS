# Documentare Aplicatie LTS

## 1. Scopul aplicatiei

Aplicatia **LTS (Preload Measuring System)** este gandita pentru rulare pe Raspberry Pi in regim kiosk si are rolul de:

- citi greutatea de la un senzor HX711;
- afisa live greutatea in UI;
- oferi control de operare (Start/Stop/Tare);
- afisa status conexiune Wi-Fi;
- permite login pe baza de utilizator + PIN;
- permite administrarea utilizatorilor (pentru rolul admin);
- exporta un grafic al greutatii in PDF.

Proiectul este organizat ca mono-repo: backend + frontend + scripturi de pornire.

## 2. Limbaje si tehnologii folosite

### Limbaje

- **Python** (backend API + logica senzor + SQLite)
- **JavaScript** (frontend React + Vite)
- **Bash** (kiosk start script)
- **SQL (SQLite)** (persistenta date)
- **HTML/CSS** (interfata web)

### Tehnologii / librarii principale

- Backend:
  - FastAPI
  - Uvicorn
  - Pydantic
  - sqlite3 (builtin Python)
  - RPi.GPIO
  - integrare HX711 (din `hx711.py`)
- Frontend:
  - React 19
  - React Router
  - Vite
  - Axios
- Runtime pe Raspberry:
  - systemd (servicii backend/frontend/kiosk)
  - Chromium in mod kiosk
  - `serve` pentru servire statica a `frontend/dist`

## 3. Arhitectura aplicatiei

### 3.1 Vedere de ansamblu

1. Frontend (React) ruleaza in browser (Chromium kiosk) pe port `5173`.
2. Backend (FastAPI) ruleaza pe port `8000`.
3. Frontend face request-uri HTTP catre backend:
   - `GET /sensors/hx711`
   - `POST /sensors/hx711/tare`
   - `GET /sensors/wifi`
   - `GET/POST/PUT/DELETE /users...`
4. Backend citeste de la HX711 si salveaza datele de utilizatori/setari in SQLite.

### 3.2 Structura proiectului

- `backend/`
  - `app.py` - aplicatia FastAPI si routerele
  - `routes/` - endpoint-uri (`sensor.py`, `users.py`, `measurements.py`)
  - `storage/db.py` - init DB, pragmas, schema users/user_settings
  - `services/sensor_readers/hx711_reader.py` - citire HX711
- `frontend/`
  - `src/main.jsx` - bootstrap app
  - `src/App.jsx` - rute
  - `src/pages/` - Home, Dashboard, Graph, Status, Settings, NotFound
  - `src/auth/` - sesiune/autentificare
  - `src/i18n/` - limbi + teme
  - `src/api/` - client API backend
  - `dist/` - build productie
- `start-kiosk.sh` - script lansare Chromium kiosk
- `ReadMe.MD` - instructiuni rapide de rulare
- `TODO.md` - roadmap de evolutie

## 4. Backend: cum este gandit

### 4.1 API FastAPI

Backend-ul este definit in `backend/app.py`:

- include CORS permisiv (`allow_origins=["*"]`);
- inregistreaza rute:
  - `/sensors`
  - `/measurements`
  - `/users`
- la startup ruleaza `init_db()` pentru SQLite.

### 4.2 Persistenta (SQLite)

Configurarea DB este in `backend/storage/db.py`:

- fisier principal DB: `backend/storage/lts.db`;
- PRAGMA importante:
  - `journal_mode=WAL`
  - `synchronous=NORMAL`
  - `foreign_keys=ON`
  - `busy_timeout=5000`
- tabele gestionate:
  - `users(id, username, role, pin_hash, created_at)`
  - `user_settings(user_id, language, theme, updated_at)`
- seed automat:
  - utilizator implicit `admin`
  - PIN implicit `0000` (hash-uit SHA256)

### 4.3 Autentificare si roluri

Rutele din `backend/routes/users.py`:

- `GET /users/` - lista utilizatori
- `POST /users/` - creare user (doar admin, prin header `X-Actor-Id`)
- `POST /users/login` - login cu `user_id + pin`
- `GET /users/{id}/settings` - citire setari user
- `PUT /users/{id}/settings` - update limba/tema
- `DELETE /users/{id}` - stergere user (doar admin, cu protectii)

Reguli principale:

- PIN valid = exact 4 cifre;
- roluri: `admin` / `restricted`;
- restricted nu poate administra utilizatori;
- un admin nu se poate sterge singur;
- trebuie sa ramana cel putin un admin.

### 4.4 Senzor HX711 si Wi-Fi

Rutele din `backend/routes/sensor.py`:

- `GET /sensors/hx711` - citire greutate curenta;
- `POST /sensors/hx711/tare` - tare;
- `GET /sensors/wifi` - procent semnal Wi-Fi din `iwconfig wlan0`.

Citirea HX711 este implementata in `backend/services/sensor_readers/hx711_reader.py`, cu:

- pini BCM: DOUT=5, SCK=6;
- zero/tare la initializare;
- scala configurata prin `scale_ratio`.

### 4.5 Modul measurements (stare curenta)

Exista si `backend/routes/measurements.py` cu start/stop/history + WebSocket:

- `POST /measurements/start`
- `POST /measurements/stop`
- `GET /measurements/history`
- `WS /measurements/ws`

Observatie importanta:

- acest modul foloseste separat un DB local `backend/lts.db` (nu `backend/storage/lts.db`);
- frontend-ul actual nu foloseste inca aceste rute, ci polling direct pe `/sensors/hx711`.

## 5. Frontend: cum este gandit

### 5.1 Structura UI si rutare

Rute in `frontend/src/App.jsx`:

- `/` - Home (login sau hub, in functie de sesiune)
- `/dashboard` - protejata
- `/grafic` - protejata
- `/status` - protejata
- `/settings` - protejata
- fallback `*` -> NotFound

`MainLayout` afiseaza:

- logo + titlu aplicatie;
- navigatie;
- status bar (ora + data + Wi-Fi);
- info sesiune + logout.

### 5.2 Flux login si sesiune

Home (`frontend/src/pages/Home.jsx`) are:

- selectie user;
- keypad numeric PIN 4 cifre;
- login prin `POST /users/login`;
- redirect la dashboard.

Sesiunea este tinuta in `SessionContext`:

- user autentificat in memorie;
- sincronizare setari user (limba/tema) catre backend;
- cheie localStorage user activ: `lts_active_user_id`.

### 5.3 i18n + teme

`LanguageContext` gestioneaza:

- limbi: `ro`, `en`, `de`;
- teme: `night`, `day`;
- persistenta in localStorage:
  - `lts_language`
  - `lts_theme`.

Textul UI este centralizat in `frontend/src/i18n/translations.js`.

### 5.4 Pagini functionale

- **Dashboard**:
  - polling la 500ms pe `/sensors/hx711`;
  - butoane Tare/Start/Stop.
- **Graph**:
  - polling la 500ms pe `/sensors/hx711`;
  - retine ultimele 120 sample-uri;
  - export PDF client-side din SVG.
- **Status**:
  - polling la 5s pe `/sensors/wifi`;
  - afiseaza procent + ultima actualizare.
- **Settings**:
  - schimbare limba/tema;
  - administrare utilizatori pentru admin.

### 5.5 Config API frontend

In `frontend/src/api/users.js` si `frontend/src/api/sensor.js`:

- `API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://192.168.0.183:8000"`

Asta inseamna:

- daca nu setezi `VITE_API_BASE_URL`, frontend-ul cade pe IP-ul hardcodat.

## 6. Configurare si rulare

### 6.1 Dezvoltare locala

Backend:

```bash
cd ~/LTS/backend
source venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd ~/LTS/frontend
npm run dev
```

### 6.2 Productie pe Raspberry (systemd)

Servicii active:

- `lts-backend.service`:
  - ruleaza uvicorn din `/home/bogdan/LTS/backend/venv/bin/uvicorn`
  - host `0.0.0.0`, port `8000`
- `lts-frontend.service`:
  - ruleaza `serve -s dist -l 5173`
  - serveste build-ul static din `frontend/dist`
- `lts-kiosk.service` (user service):
  - ruleaza `start-kiosk.sh`
  - porneste Chromium in fullscreen kiosk la `http://localhost:5173`

Restart rapid stack:

```bash
sudo systemctl restart lts-backend.service
sudo systemctl restart lts-frontend.service
systemctl --user restart lts-kiosk.service
```

### 6.3 Deploy frontend in productie

Fluxul corect de update:

```bash
cd ~/LTS/frontend
npm run build
sudo systemctl restart lts-frontend.service
pkill -x chromium || true
systemctl --user restart lts-kiosk.service
```

## 7. Cum am gandit evolutia proiectului pana aici

Din commit-uri si structura actuala, evolutia a fost incrementala, pe pasi practici:

1. **Fundatie hardware + backend minim**  
   Citirea de la HX711 si endpoint-uri de baza pentru a avea date reale din dispozitiv.

2. **Persistenta SQLite + configurare WAL**  
   Stabilizare DB pentru rulare embedded pe Raspberry (WAL, pragmas, admin implicit).

3. **UI operational (dashboard + status bar)**  
   Prioritate pe operare rapida in teren: greutate live, semnal Wi-Fi, info timp real.

4. **Conectare backend-frontend**  
   Aliniere API + frontend, poll-uri regulate, mesaje de status.

5. **Autentificare + user management**  
   Login PIN, roluri admin/restricted, administrare useri din pagina Settings.

6. **Internationalizare (RO/EN/DE) + teme**  
   Aplicatie folosibila in mai multe limbi, cu setari persistente pe utilizator.

7. **Grafic + export PDF + kiosk runtime**  
   Completare flux operativ: vizualizare trend si export document.

8. **Operationalizare pe systemd**  
   Servicii separate pentru backend/frontend/kiosk, pornire automata la boot.

## 8. Limitari curente (cunoscute)

- CORS este complet deschis (`*`), bun pentru test, mai putin strict pentru productie.
- `VITE_API_BASE_URL` are fallback pe IP hardcodat.
- Modul `measurements` exista dar nu este integrat in frontend-ul curent.
- Sunt 2 locatii DB in cod (`backend/storage/lts.db` si `backend/lts.db` in measurements).
- Nu exista in repo un fisier standard de dependente backend (`requirements.txt`/`pyproject.toml`), desi mediul virtual local este functional.

## 9. Recomandari de consolidare

1. Unificare DB pe un singur fisier (`backend/storage/lts.db`) pentru toate modulele.
2. Mutare backend API pe `127.0.0.1` daca frontend si backend ruleaza pe acelasi device.
3. Configurare `VITE_API_BASE_URL` prin `.env.production`.
4. Adaugare `requirements.txt` (sau `pyproject.toml`) pentru reproductibilitate.
5. Eventual migrare Dashboard/Graph spre `/measurements/ws` pentru stream real, in loc de polling.

---

Acest document descrie starea curenta a aplicatiei din repo-ul `LTS` la data curenta si configurarea activa pe Raspberry.
