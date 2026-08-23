# Liebesbriefe für Chantal

Eine statische OnePage-Webseite als digitaler Liebesbrief. Sie benötigt nur HTML, CSS und JavaScript und wird über GitHub Pages veröffentlicht.

## Lokal ansehen

`index.html` direkt im Browser öffnen oder in Visual Studio Code Insiders die Erweiterung „Live Server“ verwenden.

## Briefe hinzufügen und anpassen

Alle Briefe stehen am Anfang von `js/script.js` in der Liste `letters`. Für einen neuen Tagesbrief einen Eintrag kopieren und `id`, `date`, `time`, `title`, `salutation`, `paragraphs`, `closing` und `signature` anpassen. Die Uhrzeit wird als `time: "22:47"` eingetragen; fehlt das Feld, wird nur das Datum angezeigt. Jeder Eintrag in `paragraphs` wird als eigener Absatz angezeigt.

Die wichtigsten Farben befinden sich am Anfang von `css/style.css` unter `:root`. Dauer und Ablauf der Animationen lassen sich bei `break-seal`, `open-flap`, `reveal-scroll` und `roll-down` anpassen.

## GitHub Pages

In den Repository-Einstellungen unter `Settings → Pages` den Branch `main` und den Ordner `/ (root)` als Quelle auswählen.
