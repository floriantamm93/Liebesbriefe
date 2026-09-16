# Liebesbriefe für Chantal

Eine statische OnePage-Webseite als digitaler Liebesbrief. Sie benötigt nur HTML, CSS und JavaScript und wird über GitHub Pages veröffentlicht.

## Lokal ansehen

Die Seite verwendet ES-Module und muss über einen lokalen Webserver geöffnet werden. Ein Doppelklick auf `index.html` (`file://`) genügt dafür nicht mehr.

In Visual Studio Code die Erweiterung „Live Server“ verwenden oder im Projektordner mit installiertem Python starten:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Anschließend `http://127.0.0.1:8000` im Browser öffnen. Den Server mit `Strg+C` beenden.

## Aufbau

- `index.html`: Grundaufbau; lädt `js/script.js` als ES-Modul.
- `css/style.css`: Gestaltung, Animationen, Mobil- und Druckansicht.
- `js/script.js`: Briefauswahl, Darstellung, Öffnen, Zurückgehen und Drucken.
- `js/letters/helpers.js`: `toParagraphs` zum Aufteilen der Brieftexte.
- `js/letters/index.js`: Imports und geordnete Liste aller Briefe.
- `js/letters/YYYY-MM-DD.js`: eine Datei je Brief.

## Einen Brief hinzufügen

1. Eine vorhandene Tagesdatei unter `js/letters/` kopieren, beispielsweise als `2026-09-16.js`.
2. `id`, `date`, optional `time`, `title`, `salutation`, `paragraphs`, `closing` und `signature` anpassen. Die ID muss eindeutig sein. Ein eventuell mitkopiertes `password` entfernen oder bewusst anpassen.

```javascript
import { toParagraphs } from "./helpers.js?v=2026-09-16";

export default {
  id: "2026-09-16",
  date: "16. September 2026",
  time: "22:30",
  title: "Titel des Briefes",
  salutation: "Meine liebste Chantal,",
  paragraphs: toParagraphs(`
Hier steht der erste Absatz.

Hier steht der zweite Absatz.
  `),
  closing: "Dein",
  signature: "Flo 🖤"
};
```

3. In `js/letters/index.js` einen Import ergänzen und den Brief in `letters` eintragen:

```javascript
import letter34 from "./2026-09-16.js?v=2026-09-16";

// In der bestehenden Liste ergänzen:
// export const letters = [letter1, ..., letter33, letter34];
```

Die Reihenfolge in `letters` bestimmt die Reihenfolge im Archiv. Der erste Eintrag ist vorausgewählt. Es gibt keine automatische Datumssortierung. Bei der Migration wurde die bisherige Reihenfolge vom ältesten zum neuesten Brief beibehalten. Soll künftig der neueste vorausgewählt sein, kann sein Eintrag an den Anfang der Liste gesetzt werden.

4. Die Versionsangaben wie unten beschrieben aktualisieren und die Seite über den lokalen Webserver prüfen.

### Text, Uhrzeit und Medien

Leerzeilen trennen Absätze. Einzelne Zeilenumbrüche bleiben sichtbar, etwa bei Gedichten. Texte aus Discord können zwischen die Backticks eingefügt werden; wörtliche Backticks und die Zeichenfolge `${` müssen innerhalb eines JavaScript-Template-Strings mit einem vorangestellten Backslash maskiert werden.

`time: "22:30"` ergänzt die Uhrzeit im Archiv und im geöffneten Brief. Ohne `time` erscheint nur das Datum.

Medienlinks stehen jeweils in einem eigenen Absatz:

- Spotify-Links der Form `https://open.spotify.com/track/…` werden als Player eingebettet; unterstützt werden auch Album, Playlist, Episode und Show. Links mit `/intl-de/` werden derzeit als normale Links dargestellt.
- Instagram-Links werden als Buttons dargestellt.
- Bildpfade und Bild-URLs mit unterstützter Dateiendung werden als Bilder dargestellt.
- Andere alleinstehende HTTP-/HTTPS-URLs werden anklickbar.

Mit `password: "…"` kann ein Brief die bestehende einfache Passwortabfrage verwenden. Passwort und Brieftext bleiben dabei im Quellcode lesbar; dies ist die vereinbarte einfache Lösung. `passwordHint` und eine eigene Passwortmaske sind bislang nicht implementiert.

### Änderungen sichtbar machen (Browser-Cache)

Jedes Modul besitzt seinen eigenen URL-basierten Cache. Nur die Version von `script.js` zu ändern reicht deshalb für geänderte importierte Dateien nicht aus. Als Version eignet sich zum Beispiel `2026-09-16-2`; für jede Veröffentlichung mit Änderungen eine neue Kennung verwenden.

- **Neuer Brief:** In `js/letters/index.js` importieren und in die Liste aufnehmen. Danach die Version des Imports von `letters/index.js` in `js/script.js` und die Version von `js/script.js` in `index.html` erhöhen.
- **Vorhandenen Brief bearbeiten:** Zusätzlich die Version seines Imports in `js/letters/index.js` erhöhen. Anschließend ebenfalls die Versionen in `js/script.js` und `index.html` erhöhen.
- **`helpers.js` bearbeiten:** Die Version des Helper-Imports in allen Tagesdateien erhöhen, danach deren Import-Versionen in `js/letters/index.js` und schließlich die Versionen in `js/script.js` und `index.html` erhöhen.

Alle zusammengehörenden Dateien gemeinsam veröffentlichen. Der Dateiname bleibt immer `script.js`; nur der Wert hinter `?v=` ändert sich.

## Gestaltung

Die wichtigsten Farben befinden sich am Anfang von `css/style.css` unter `:root`. Dauer und Ablauf der Animationen lassen sich unter anderem bei `break-seal`, `open-flap`, `reveal-scroll` und `roll-down` anpassen.

## GitHub Pages

In den Repository-Einstellungen unter `Settings → Pages` den Branch `main` und den Ordner `/ (root)` als Quelle auswählen. Die ES-Module benötigen keinen Build-Schritt.
