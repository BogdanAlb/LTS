# Diagrama Tehnica LTS

## 1. Arhitectura generala

```text
                        +------------------------------+
                        | Raspberry Pi (host)          |
                        |                              |
                        |  +------------------------+  |
LAN Browser ----------- |->| Frontend static server |  |
http://<pi>:5173        |  | serve -s dist :5173    |  |
                        |  +-----------+------------+  |
                        |              |               |
                        |              | HTTP (REST)   |
                        |              v               |
                        |  +------------------------+  |
                        |  | FastAPI + Uvicorn      |  |
                        |  | backend :8000          |  |
                        |  +-----------+------------+  |
                        |              |               |
                        |      +-------+------+        |
                        |      |              |        |
                        |      v              v        |
                        |  HX711 sensor     SQLite     |
                        |  (GPIO BCM)       lts.db     |
                        +------------------------------+
```

## 2. Runtime pe Raspberry (systemd + kiosk)

```text
Boot
 |
 +--> systemd (root)
 |     |
 |     +--> lts-backend.service
 |     |     ExecStart: uvicorn app:app --host 0.0.0.0 --port 8000
 |     |
 |     +--> lts-frontend.service
 |           ExecStart: /usr/bin/serve -s dist -l 5173
 |
 +--> systemd --user
       |
       +--> lts-kiosk.service
             ExecStart: /home/bogdan/LTS/start-kiosk.sh
                     |
                     +--> wait http://localhost:5173
                     +--> launch chromium --kiosk http://localhost:5173
```

## 3. Structura repo (logic)

```text
LTS/
├── backend/
│   ├── app.py
│   ├── routes/
│   │   ├── sensor.py
│   │   ├── users.py
│   │   └── measurements.py
│   ├── services/
│   │   └── sensor_readers/hx711_reader.py
│   └── storage/db.py
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── layouts/MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Graph.jsx
│   │   │   ├── Status.jsx
│   │   │   └── Settings.jsx
│   │   ├── auth/SessionContext.jsx
│   │   ├── i18n/LanguageContext.jsx
│   │   └── api/{users.js,sensor.js}
│   └── dist/ (build productie)
├── start-kiosk.sh
├── Documentare.md
└── Diagrama.md
```

## 4. Backend: componente si dependente

```text
app.py
 |
 +--> include_router("/sensors") -------> routes/sensor.py
 |        |                                   |
 |        |                                   +--> HX711Reader.read()
 |        |                                   +--> HX711Reader.hx.zero()
 |        |                                   +--> iwconfig wlan0 parsing
 |        |
 |        +--> GET  /sensors/hx711
 |        +--> POST /sensors/hx711/tare
 |        +--> GET  /sensors/wifi
 |
 +--> include_router("/users") ----------> routes/users.py
 |        |
 |        +--> auth PIN 4 digits + role checks (admin/restricted)
 |        +--> X-Actor-Id for privileged ops
 |
 +--> include_router("/measurements") ---> routes/measurements.py
          |
          +--> start/stop/history + websocket stream
          +--> (momentan neintegrat in frontend curent)
```

## 5. Model de date (SQLite)

### 5.1 Zona users/settings (db principala)

```text
+-------------------+         +----------------------+
| users             |         | user_settings        |
+-------------------+         +----------------------+
| id (PK)           |<---+----| user_id (PK, FK)     |
| username UNIQUE   |    |    | language             |
| role              |    |    | theme                |
| pin_hash          |    |    | updated_at           |
| created_at        |    |    +----------------------+
+-------------------+    |
                         +-- ON DELETE CASCADE
```

### 5.2 Zona measurements (modul separat)

```text
+---------------------------+
| measurements              |
+---------------------------+
| id (PK)                   |
| ts                        |
| value                     |
+---------------------------+
```

Observatie:
- users/settings folosesc `backend/storage/lts.db`;
- measurements foloseste local `backend/lts.db`.

## 6. Frontend: contexte si flux intern

```text
main.jsx
 |
 +--> <LanguageProvider>
       |
       +--> <SessionProvider>
             |
             +--> <BrowserRouter>
                   |
                   +--> <App />
```

### 6.1 Context de limba/tema

```text
LanguageContext
 |
 +--> state: language, theme
 +--> storage keys:
 |     - lts_language
 |     - lts_theme
 +--> effect:
       - document.documentElement.lang
       - document.documentElement.dataset.theme
```

### 6.2 Context de sesiune

```text
SessionContext
 |
 +--> login(user_id, pin) -> POST /users/login
 |      |
 |      +--> seteaza user + language + theme din server
 |      +--> salveaza lts_active_user_id
 |
 +--> auto-sync settings cand user schimba limba/tema
        -> PUT /users/{id}/settings (cu X-Actor-Id)
```

## 7. Fluxuri functionale principale

## 7.1 Flux login

```text
Home.jsx
  |
  +--> GET /users (lista useri)
  +--> user select + PIN (4 cifre)
  +--> POST /users/login
         |
         +--> daca OK:
               - set user in SessionContext
               - set language/theme
               - navigate /dashboard
```

## 7.2 Flux dashboard (greutate live + tare)

```text
Dashboard.jsx
  |
  +--> Start
  |    |
  |    +--> polling la 500ms:
  |          GET /sensors/hx711
  |
  +--> Stop
  |
  +--> Tare
       |
       +--> POST /sensors/hx711/tare
```

## 7.3 Flux graph + export PDF

```text
Graph.jsx
  |
  +--> polling la 500ms pe /sensors/hx711
  +--> mentine buffer local: max 120 samples
  +--> randare SVG chart
  +--> Export:
       SVG -> Canvas JPEG -> PDF Blob -> Download local
```

## 7.4 Flux status Wi-Fi

```text
Status.jsx / StatusBar.jsx
  |
  +--> polling la 5s:
       GET /sensors/wifi
           |
           +--> backend: parseaza iwconfig wlan0
           +--> map dbm -> procent 0..100
```

## 7.5 Flux admin utilizatori

```text
Settings.jsx
  |
  +--> GET /users
  +--> add user:
  |      POST /users  (X-Actor-Id admin)
  |
  +--> delete user:
         DELETE /users/{id}  (X-Actor-Id admin)
```

## 8. Endpoint map (stare curenta)

### 8.1 Senzori

```text
GET    /sensors/hx711
POST   /sensors/hx711/tare
GET    /sensors/wifi
```

### 8.2 Utilizatori

```text
GET    /users/
POST   /users/
POST   /users/login
GET    /users/{user_id}/settings
PUT    /users/{user_id}/settings
DELETE /users/{user_id}
```

### 8.3 Measurements (neintegrat in UI actual)

```text
POST   /measurements/start
POST   /measurements/stop
GET    /measurements/history
WS     /measurements/ws
```

## 9. Configurare API frontend

```text
API_BASE = VITE_API_BASE_URL ?? "http://192.168.0.183:8000"
```

Impact:
- in dev/prod fara `.env`, frontend loveste fallback-ul hardcodat.

## 10. Diagram de update productie frontend

```text
modificari in src
   |
   +--> npm run build
           |
           +--> frontend/dist/* actualizat
                   |
                   +--> systemctl restart lts-frontend.service
                           |
                           +--> serve livreaza noul bundle
                                   |
                                   +--> restart kiosk/chromium pentru reload vizual
```

## 11. Evolutie functionala (pe etape)

```text
[Hardware + citire HX711]
         |
         v
[Backend FastAPI de baza]
         |
         v
[SQLite + WAL + users/settings]
         |
         v
[Frontend: dashboard + status]
         |
         v
[Auth PIN + roluri + admin users]
         |
         v
[RO/EN/DE + teme]
         |
         v
[Graph + export PDF]
         |
         v
[Systemd + kiosk runtime]
```

## 12. Zone de risc tehnic (vizual)

```text
                         +---------------------------+
                         | CORS allow_origins = "*" |
                         +-------------+-------------+
                                       |
                                       v
                       +---------------+---------------+
                       | API expus mai larg decat minim |
                       +---------------+---------------+

 +---------------------------------------------------------------+
 | DB split: storage/lts.db (users) vs backend/lts.db (measure) |
 +---------------------------------------------------------------+

 +---------------------------------------------------------------+
 | Frontend polling (500ms) in loc de stream WS unificat         |
 +---------------------------------------------------------------+
```

## 13. Concluzie tehnica

Aplicatia este construita corect pentru un flux operational local pe Raspberry:
- UI kiosk stabil;
- backend simplu si clar;
- autentificare cu roluri;
- integrare hardware directa.

Directia naturala de maturizare:
- unificare DB;
- configurare API prin env in productie;
- consolidare securitate CORS;
- migrare graduala pe stream measurements pentru live data.
