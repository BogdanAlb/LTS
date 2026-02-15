export const LANGUAGE_LOCALES = {
  ro: "ro-RO",
  en: "en-US",
  de: "de-DE",
};

export const translations = {
  ro: {
    appName: "LTS Weight Monitor",
    layout: {
      subtitle: "Structura clara pe pagina principala si ramuri",
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
          description: "Citire live pentru greutate, cu comenzi Start, Stop si Tare.",
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
          description: "Mapare rute si puncte de configurare pentru frontend/API.",
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
    },
    notFound: {
      title: "Pagina negasita",
      subtitle: "Ruta ceruta nu exista in structura curenta.",
      backHome: "Intoarcere la pagina principala",
    },
  },
  en: {
    appName: "LTS Weight Monitor",
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
      subtitle: "The frontend is organized with one central page and clear navigation branches.",
      branches: {
        dashboard: {
          title: "Dashboard",
          description: "Live weight reading with Start, Stop, and Tare controls.",
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
          description: "Route mapping and frontend/API configuration points.",
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
    },
    notFound: {
      title: "Page not found",
      subtitle: "The requested route does not exist in the current structure.",
      backHome: "Back to main page",
    },
  },
  de: {
    appName: "LTS Gewichtsmonitor",
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
    },
    notFound: {
      title: "Seite nicht gefunden",
      subtitle: "Die angeforderte Route existiert in der aktuellen Struktur nicht.",
      backHome: "Zurueck zur Hauptseite",
    },
  },
};
