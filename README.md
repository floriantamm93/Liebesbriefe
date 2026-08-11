# Ein Brief für Chantal

Eine kleine statische OnePage-Webseite als digitaler Liebesbrief. Sie benötigt nur HTML, CSS und JavaScript und ist für GitLab Pages vorbereitet.

## Lokal ansehen

`index.html` direkt im Browser öffnen oder in Visual Studio Code Insiders die Erweiterung „Live Server“ verwenden.

## Briefe hinzufügen und anpassen

Alle Briefe stehen am Anfang von `js/script.js` in der Liste `letters`. Für einen neuen Tagesbrief den obersten Eintrag kopieren und `id`, `date`, `title`, `salutation`, `paragraphs`, `closing` und `signature` anpassen. Jeder Eintrag in `paragraphs` wird als eigener Absatz angezeigt. Der oberste Brief ist automatisch vorausgewählt.

Die wichtigsten Farben befinden sich am Anfang von `css/style.css` unter `:root`. Dauer und Ablauf der Animationen lassen sich bei `break-seal`, `open-flap`, `reveal-scroll` und `roll-down` anpassen.

## GitLab Pages

Projekt in ein GitLab-Repository übertragen und auf den Standard-Branch pushen. Die mitgelieferte `.gitlab-ci.yml` kopiert die statischen Dateien in das Pages-Artefakt `public`.
