export const LANGUAGE_LOCALES = {
  ro: "ro-RO",
  en: "en-US",
  de: "de-DE",
};

export const translations = {
  ro: {
    appName: "Preload System",
    layout: {
      navigationAria: "Navigare principala",
      nav: {
        home: "Principal",
        dashboard: "Dashboard",
        graph: "Grafic",
        status: "Status",
        settings: "Setari",
      },
    },
    home: {
      title: "Pagina Principala",
      subtitle: "Frontend-ul este organizat pe o pagina centrala si ramuri clare de navigatie.",
      branches: {
        dashboard: {
          title: "Dashboard",
          description: "Citire live, cu comenzi Start, Stop si Tare.",
        },
        graph: {
          title: "Grafic",
          description: "Grafic live pentru evolutia greutatii cu export PDF.",
        },
        status: {
          title: "Status",
          description: "Monitorizare conexiune Wi-Fi si timp de actualizare.",
        },
        settings: {
          title: "Setari",
          description: "",
        },
      },
    },
    dashboard: {
      liveWeight: "Greutate Live",
      actions: {
        tare: "Tare",
        start: "Start",
        stop: "Stop",
      },
      messages: {
        started: "Citirea live a pornit",
        stopped: "Citirea a fost oprita",
        tareDone: "Tarare efectuata",
        tareFailed: "Tarare esuata",
      },
    },
    graph: {
      title: "Grafic Greutate",
      subtitle: "Vizualizare in timp real a evolutiei greutatii.",
      chartTitle: "Evolutie greutate",
      ariaLabel: "Grafic evolutie greutate live",
      empty: "Porneste citirea live pentru a construi graficul.",
      actions: {
        export: "Export PDF",
      },
      messages: {
        exportDone: "PDF exportat",
        exportFailed: "Export PDF esuat",
      },
    },
    status: {
      title: "Status Sistem",
      wifiSignal: "Semnal Wi-Fi",
      lastUpdate: "Ultima actualizare",
      refreshNote: "Refresh automat la 5 secunde",
      wifiQuality: {
        excellent: "Foarte bun",
        good: "Bun",
        medium: "Mediu",
        low: "Slab",
        critical: "Critic",
      },
    },
    settings: {
      title: "Setari si Structura",
      subtitle: "Pentru backend configurabil, poti seta variabila de mediu",
      language: "Alegere limba",
      selectedLanguage: "Limba selectata",
      appearance: "Aspect",
      selectedTheme: "Mod selectat",
      routes: "Ramuri frontend",
      routeDescriptions: {
        home: "Pagina principala",
        dashboard: "Citire live + comenzi cantar",
        graph: "Grafic live + export PDF",
        status: "Indicatori sistem si conectivitate",
        settings: "Setari frontend si organizare rute",
      },
      languageNames: {
        ro: "Romana",
        en: "Engleza",
        de: "Germana",
      },
      themeNames: {
        day: "Mod de zi",
        night: "Mod de noapte",
      },
      userRoles: {
        admin: "Admin",
        restricted: "Restrans",
      },
      users: {
        title: "Utilizatori",
        subtitle: "Admin are drepturi depline: poate adauga sau sterge utilizatori.",
        loading: "Se incarca utilizatorii...",
        activeUser: "Utilizator activ",
        none: "Niciun utilizator disponibil",
        usernameLabel: "Nume utilizator",
        usernamePlaceholder: "ex: operator_1",
        roleLabel: "Rol",
        actions: {
          add: "Adauga utilizator",
          delete: "Sterge",
        },
        messages: {
          loadError: "Nu am putut incarca utilizatorii.",
          noRights: "Utilizatorul activ are drepturi restranse si nu poate administra utilizatori.",
          invalidName: "Numele trebuie sa aiba 3-32 caractere si doar litere, cifre, punct, underscore sau minus.",
          created: "Utilizator adaugat.",
          createError: "Nu am putut adauga utilizatorul.",
          confirmDelete: "Stergi utilizatorul",
          deleted: "Utilizator sters.",
          deleteError: "Nu am putut sterge utilizatorul.",
        },
      },
    },
    notFound: {
      title: "Pagina negasita",
      subtitle: "Ruta ceruta nu exista in structura curenta.",
      backHome: "Intoarcere la pagina principala",
    },
  },
  en: {
    appName: "Preload System",
    layout: {
      subtitle: "Clear structure with main page and dedicated branches",
      navigationAria: "Main navigation",
      nav: {
        home: "Home",
        dashboard: "Dashboard",
        graph: "Graph",
        status: "Status",
        settings: "Settings",
      },
    },
    home: {
      title: "Main Page",
      subtitle: "",
      branches: {
        dashboard: {
          title: "Dashboard",
          description: "Live weight with Start, Stop, and Tare controls.",
        },
        graph: {
          title: "Graph",
          description: "Live weight trend chart with PDF export.",
        },
        status: {
          title: "Status",
          description: "Wi-Fi connectivity and update monitoring.",
        },
        settings: {
          title: "Settings",
          description: "",
        },
      },
    },
    dashboard: {
      liveWeight: "Live Weight",
      actions: {
        tare: "Tare",
        start: "Start",
        stop: "Stop",
      },
      messages: {
        started: "Live reading started",
        stopped: "Reading stopped",
        tareDone: "Tare completed",
        tareFailed: "Tare failed",
      },
    },
    graph: {
      title: "Weight Graph",
      subtitle: "Real-time visualization of weight trend.",
      chartTitle: "Weight trend",
      ariaLabel: "Live weight trend chart",
      empty: "Start live reading to build the chart.",
      actions: {
        export: "Export PDF",
      },
      messages: {
        exportDone: "PDF exported",
        exportFailed: "PDF export failed",
      },
    },
    status: {
      title: "System Status",
      wifiSignal: "Wi-Fi Signal",
      lastUpdate: "Last update",
      refreshNote: "Automatic refresh every 5 seconds",
      wifiQuality: {
        excellent: "Excellent",
        good: "Good",
        medium: "Medium",
        low: "Weak",
        critical: "Critical",
      },
    },
    settings: {
      title: "Settings and Structure",
      subtitle: "For a configurable backend, set the environment variable",
      language: "Language selection",
      selectedLanguage: "Selected language",
      appearance: "Appearance",
      selectedTheme: "Selected mode",
      routes: "Frontend branches",
      routeDescriptions: {
        home: "Main page",
        dashboard: "Live readout + scale controls",
        graph: "Live chart + PDF export",
        status: "System and connectivity indicators",
        settings: "Frontend settings and route organization",
      },
      languageNames: {
        ro: "Romanian",
        en: "English",
        de: "German",
      },
      themeNames: {
        day: "Day mode",
        night: "Night mode",
      },
      userRoles: {
        admin: "Admin",
        restricted: "Restricted",
      },
      users: {
        title: "Users",
        subtitle: "Admins have full rights and can add or delete users.",
        loading: "Loading users...",
        activeUser: "Active user",
        none: "No user available",
        usernameLabel: "Username",
        usernamePlaceholder: "e.g. operator_1",
        roleLabel: "Role",
        actions: {
          add: "Add user",
          delete: "Delete",
        },
        messages: {
          loadError: "Could not load users.",
          noRights: "The active user has restricted rights and cannot manage users.",
          invalidName: "Username must be 3-32 chars and only letters, numbers, dot, underscore or minus.",
          created: "User created.",
          createError: "Could not create user.",
          confirmDelete: "Delete user",
          deleted: "User deleted.",
          deleteError: "Could not delete user.",
        },
      },
    },
    notFound: {
      title: "Page not found",
      subtitle: "The requested route does not exist in the current structure.",
      backHome: "Back to main page",
    },
  },
  de: {
    appName: "Preload System",
    layout: {
      subtitle: "Klare Struktur mit Hauptseite und zugehorigen Bereichen",
      navigationAria: "Hauptnavigation",
      nav: {
        home: "Startseite",
        dashboard: "Dashboard",
        graph: "Grafik",
        status: "Status",
        settings: "Einstellungen",
      },
    },
    home: {
      title: "Hauptseite",
      subtitle: "Das Frontend ist mit einer zentralen Seite und klaren Navigationsbereichen aufgebaut.",
      branches: {
        dashboard: {
          title: "Dashboard",
          description: "Live-Gewichtsanzeige mit Start-, Stopp- und Tara-Steuerung.",
        },
        graph: {
          title: "Grafik",
          description: "Live-Trendgrafik des Gewichts mit PDF-Export.",
        },
        status: {
          title: "Status",
          description: "Ueberwachung von WLAN-Verbindung und Aktualisierung.",
        },
        settings: {
          title: "Einstellungen",
          description: "Routenabbildung und Konfigurationspunkte fuer Frontend/API.",
        },
      },
    },
    dashboard: {
      liveWeight: "Live-Gewicht",
      actions: {
        tare: "Tara",
        start: "Start",
        stop: "Stopp",
      },
      messages: {
        started: "Live-Messung gestartet",
        stopped: "Messung gestoppt",
        tareDone: "Tara ausgefuehrt",
        tareFailed: "Tara fehlgeschlagen",
      },
    },
    graph: {
      title: "Gewichtsgrafik",
      subtitle: "Echtzeit-Visualisierung des Gewichtsverlaufs.",
      chartTitle: "Gewichtsverlauf",
      ariaLabel: "Live-Gewichtsverlauf als Grafik",
      empty: "Starte die Live-Messung, um die Grafik aufzubauen.",
      actions: {
        export: "PDF exportieren",
      },
      messages: {
        exportDone: "PDF exportiert",
        exportFailed: "PDF-Export fehlgeschlagen",
      },
    },
    status: {
      title: "Systemstatus",
      wifiSignal: "WLAN-Signal",
      lastUpdate: "Letzte Aktualisierung",
      refreshNote: "Automatische Aktualisierung alle 5 Sekunden",
      wifiQuality: {
        excellent: "Sehr gut",
        good: "Gut",
        medium: "Mittel",
        low: "Schwach",
        critical: "Kritisch",
      },
    },
    settings: {
      title: "Einstellungen und Struktur",
      subtitle: "Fuer ein konfigurierbares Backend setze die Umgebungsvariable",
      language: "Sprachauswahl",
      selectedLanguage: "Ausgewaehlte Sprache",
      appearance: "Darstellung",
      selectedTheme: "Ausgewaehlter Modus",
      routes: "Frontend-Bereiche",
      routeDescriptions: {
        home: "Hauptseite",
        dashboard: "Live-Anzeige + Waagensteuerung",
        graph: "Live-Grafik + PDF-Export",
        status: "System- und Verbindungsindikatoren",
        settings: "Frontend-Einstellungen und Routenstruktur",
      },
      languageNames: {
        ro: "Rumaenisch",
        en: "Englisch",
        de: "Deutsch",
      },
      themeNames: {
        day: "Tagesmodus",
        night: "Nachtmodus",
      },
      userRoles: {
        admin: "Admin",
        restricted: "Eingeschraenkt",
      },
      users: {
        title: "Benutzer",
        subtitle: "Admins haben volle Rechte und koennen Benutzer hinzufuegen oder loeschen.",
        loading: "Benutzer werden geladen...",
        activeUser: "Aktiver Benutzer",
        none: "Kein Benutzer verfuegbar",
        usernameLabel: "Benutzername",
        usernamePlaceholder: "z. B. operator_1",
        roleLabel: "Rolle",
        actions: {
          add: "Benutzer hinzufuegen",
          delete: "Loeschen",
        },
        messages: {
          loadError: "Benutzer konnten nicht geladen werden.",
          noRights: "Der aktive Benutzer hat eingeschraenkte Rechte und kann keine Benutzer verwalten.",
          invalidName: "Benutzername muss 3-32 Zeichen haben und darf nur Buchstaben, Zahlen, Punkt, Unterstrich oder Minus enthalten.",
          created: "Benutzer hinzugefuegt.",
          createError: "Benutzer konnte nicht hinzugefuegt werden.",
          confirmDelete: "Benutzer loeschen",
          deleted: "Benutzer geloescht.",
          deleteError: "Benutzer konnte nicht geloescht werden.",
        },
      },
    },
    notFound: {
      title: "Seite nicht gefunden",
      subtitle: "Die angeforderte Route existiert in der aktuellen Struktur nicht.",
      backHome: "Zurueck zur Hauptseite",
    },
  },
};
