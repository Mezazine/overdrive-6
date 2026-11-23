# OVERDRIVE-6
## Shadowrun 6 Web-Dashboard & Rigger-Zentrale (Mobile-Ready & PWA)

### 📁 Verzeichnisstruktur
- **`docs/rules/`**: Lege hier deine SR6-Regelwerk-PDFs ab (z. B. *Grundregelwerk.pdf*, *Schattenkompendium.pdf*).
- **`src/engine/specs/`**: Extrahierte Formeln und Regelspezifikationen aus den PDF-Quelldaten.
- **`src/engine/`**: Reine Berechnungs-Engine (`SR6RulesEngine.js`) mit Audit-Tooltips (Wert + Formel + Regelreferenz).
- **`src/schemas/`**: `character_schema.json` – wird auf Basis der Regelanalyse formalisiert und validiert.
- **`src/ui/`**: Responsive Cyberpunk-Dashboard (PWA-fähig für Smartphone/Tablet & Desktop).
- **`data/`**: Charakter- und Testdaten (z. B. `sample_buck_v10.json`).

### 📱 Mobile-First & App-Architektur
1. **Responsive Touch-UI**: Optimiert für Desktop und Smartphone (inkl. Bottom-Bar-Navigation).
2. **PWA (Progressive Web App)**: Installierbar direkt vom Browser auf den Homescreen (Android / iOS) mit Offline-Cache.
3. **Capacitor-Ready**: Kann bei Bedarf jederzeit in eine native Android/iOS-App gewrappt werden.
4. **Touch-Tooltips**: Berechnungs-Tooltips öffnen sich auf mobilen Geräten per Fingertipp (BottomSheet/Modal) statt reinem Hover.

