# LTS Reparatur - iOS App

Flutter-basierte iOS-App zum Erfassen und Verwalten von Reparaturformularen. Die App synchronisiert Formulare mit einem Raspberry Pi Backend (Django REST API).

## Features

- Reparaturformulare erstellen, bearbeiten und loeschen
- Offline-faehig: lokale SQLite-Datenbank mit automatischer Synchronisation
- Verbindung zum Raspberry Pi Backend ueber lokales Netzwerk (mDNS / IP)
- Pending-Sync-Anzeige fuer noch nicht synchronisierte Formulare

## Architektur

```
lib/
  main.dart                  # App-Einstiegspunkt, Routing, Theme
  api/
    reparatur_api.dart       # HTTP-Client (Dio) fuer das Backend
  models/
    repair_form.dart         # Datenmodell RepairForm
  screens/
    list_screen.dart         # Uebersicht aller Formulare
    form_screen.dart         # Formular erstellen/bearbeiten
    settings_screen.dart     # API-URL konfigurieren
  services/
    sync_service.dart        # SQLite + Sync-Logik (offline-first)
```

## Voraussetzungen

- macOS mit Xcode (26+)
- Flutter SDK (3.41+)
- CocoaPods
- Apple Developer Account (kostenlos reicht fuer Geraetetests)
- iPhone mit USB-Kabel

## Setup

```bash
# 1. Abhaengigkeiten installieren
cd lts_reparatur
flutter pub get

# 2. iOS-Pods installieren
cd ios
pod install
cd ..

# 3. Xcode oeffnen fuer Signing
open ios/Runner.xcworkspace
```

In Xcode:
1. Runner in der Sidebar auswaehlen
2. Tab **Signing & Capabilities**
3. **Automatically manage signing** aktivieren
4. Team auswaehlen (Apple ID hinzufuegen unter Xcode > Settings > Accounts)
5. Bundle Identifier: `com.lts.ltsReparatur`

## Auf iPhone ausfuehren

```bash
# iPhone per USB verbinden und "Vertrauen" bestaetigen

# Build erstellen
flutter build ios --debug

# Auf Geraet installieren
xcrun devicectl device install app \
  --device <DEVICE-UDID> \
  build/ios/iphoneos/Runner.app

# App starten
xcrun devicectl device process launch \
  --device <DEVICE-UDID> \
  com.lts.ltsReparatur
```

Geraete-UDID ermitteln mit: `flutter devices`

## Konfiguration

In der App unter **Settings** die API-URL des Raspberry Pi eingeben:

- Per Hostname: `http://raspberrypi.local:8000`
- Per IP-Adresse: `http://192.168.1.xxx:8000`

iPhone und Raspberry Pi muessen im selben Netzwerk sein.

## Backend API

Die App kommuniziert mit dem Django-Backend auf dem Raspberry Pi:

| Methode | Endpoint           | Beschreibung            |
|---------|--------------------|-------------------------|
| GET     | /reparatur/        | Alle Formulare abrufen  |
| POST    | /reparatur/        | Neues Formular anlegen  |
| PUT     | /reparatur/{id}    | Formular aktualisieren  |
| DELETE  | /reparatur/{id}    | Formular loeschen       |

## Offline-Modus

Formulare werden immer zuerst lokal in SQLite gespeichert (`pending_sync = 1`).
Bei bestehender Verbindung zum Server werden sie automatisch synchronisiert.
Fehlgeschlagene Syncs werden beim naechsten App-Start oder manuell (Sync-Button) wiederholt.
