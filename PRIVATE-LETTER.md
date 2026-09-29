# Privater Sonderbrief

Die bestehenden Briefe bleiben unverändert. Die separate Seite liegt unter `letter/private/` und ist nicht im Archiv verlinkt. Bei GitHub Pages mit Projektpfad lautet die Adresse beispielsweise `https://NAME.github.io/REPOSITORY/letter/private/`.

## Vorbereitung

Benötigt wird Node.js 22 oder neuer, ohne zusätzliche npm-Pakete. Das Passwort ist noch nicht festgelegt und es gibt bewusst keine veröffentlichte `envelope.json`. Solange du den Brief nicht erzeugt hast, zeigt die Seite „noch nicht verfügbar“.

1. Erstelle einen privaten Ordner **außerhalb dieses Repositorys und außerhalb eines Webserver-Verzeichnisses**.
2. Kopiere `scripts/private-letter.example.json` als `brief.json` dorthin.
3. Lege deine Bilder ebenfalls in diesen privaten Ordner.
4. Bearbeite `brief.json` im Texteditor. Die mitgelieferte Vorlage enthält nur neutrale Platzhalter.

Alternativ ist `.private/` im Repository durch `.gitignore` ausgeschlossen und durch unseren lokalen Vorschau-Server gesperrt. Externe Aufbewahrung ist vorzuziehen: `.gitignore` verhindert keine Auslieferung durch einen beliebigen Webserver und schützt auch nicht vor manuellem Upload.

## Texte und Bilder bearbeiten

`intro`, `chapters[0..2].blocks` und `closing` enthalten geordnete Blocklisten. Füge beliebig viele Text- und Bildblöcke hinzu. Die Vorlage bietet drei Kapitel und markiert vier mögliche Bildpositionen. Titel sind frei anpassbar. Der letzte Abschnitt kann deine freiwillige Einladung zum Gespräch enthalten.

Textblock:

```json
{"type": "text", "text": "Erster Absatz.\n\nZweiter Absatz mit **Fettung**.\nEin einzelner Zeilenumbruch. :D 🖤 😏"}
```

Leerzeilen erzeugen Absätze. Einzelne Zeilenumbrüche, Emojis und Wortlaut bleiben erhalten. Nur `**Fettungen**` werden interpretiert; HTML wird als Text angezeigt. JSON benötigt `\"` für Anführungszeichen innerhalb eines Texts und `\n` für Zeilenumbrüche. Keine Markdown-Links oder externen Einbettungen.

Bildblock (ersetzt einen Bildplatzhalter):

```json
{"type": "image", "file": "bilder/aufnahme.jpg", "reveal": true, "caption": ""}
```

Dateipfade sind relativ zu `brief.json`. JPEG, PNG, WebP und AVIF werden unterstützt. Keine externen URLs, SVGs oder Bild-CDNs. Alle Bilddaten werden zusammen mit dem Brief verschlüsselt, niemals in einen öffentlichen Bildordner kopiert. Die wiederverwendbare Bildkomponente zeigt Bilder responsiv, lädt sie verzögert und bietet Anzeigen/Verbergen. `reveal: false` zeigt ein Bild direkt nach dem Entsperren. Standardmäßig ist ein bewusster Klick erforderlich; es gibt kein Klartext-Vorschaubild.

Audioblock:

```json
{"type": "audio", "file": "sprachnachrichten/nachricht-1.m4a", "caption": ""}
```

MP3 und M4A funktionieren auf iPhone und Android am zuverlässigsten; OGG/Opus, WAV und WebM werden ebenfalls unterstützt. Audios erscheinen erst nach Passwortfreigabe und werden dann über einen bewussten Klick gestartet. Sie werden nicht automatisch abgespielt und nicht an einen externen Dienst übertragen.

Bilder vorher auf eine angemessene Smartphone-Auflösung verkleinern (etwa 1600 Pixel lange Kante). Maximal 8 MiB pro Bild und 32 MiB für den gesamten unverschlüsselten JSON-Inhalt einschließlich Base64-Bildern. Die gesamte verschlüsselte Datei wird vor dem Entsperren geladen; Lazy Loading betrifft die Bilddarstellung, nicht die Übertragung. Bildmetadaten werden nicht automatisch entfernt; bei Bedarf vorab lokal entfernen.

## Passwort setzen oder ändern

Im Projektordner ausführen:

```powershell
node scripts/prepare-private.mjs "D:\DeinPrivaterOrdner\brief.json"
```

Das Werkzeug fragt das Passwort zweimal **unsichtbar im Terminal** ab. Es wird weder als Kommandozeilenargument noch in einer Konfigurationsdatei gespeichert. Mindestens 12 Zeichen; eine lange persönliche Passphrase verwenden. Groß-/Kleinschreibung, Leerzeichen und Unicode werden exakt verglichen. Beim unsichtbaren Tippen funktioniert die Rücktaste; Abbruch mit Strg+C.

Das Ergebnis ist `letter/private/envelope.json`. Nur dieses verschlüsselte Inhaltspaket zusammen mit den Seitendateien veröffentlichen. Jede Änderung an Text, Bild oder Passwort erfordert erneutes Ausführen des Befehls und erneutes Veröffentlichen dieser Datei. Es gibt kein Standardpasswort und keinen Wiederherstellungsmechanismus: private Quelldateien sicher aufbewahren.

Bis zu drei Hinweise in `hints` eintragen, vom kryptischen zum deutlichen Hinweis:

```json
"hints": ["Dein erster Hinweis", "Dein zweiter Hinweis", "Dein dritter Hinweis"]
```

**Hinweise sind öffentlich lesbar**, auch vor dem Entsperren. Kein Passwort oder sensible persönliche Details hineinschreiben. Ein leeres Array blendet Hinweise aus.

## Lokal testen

```powershell
node scripts/serve.mjs
```

Öffne `http://127.0.0.1:8000/letter/private/`. Strg+C stoppt den Server. Er bindet ausschließlich an localhost und liefert nur Website-Verzeichnisse aus, keine privaten Quellen, Skripte oder Git-Dateien. Für diese Seite diesen Server anstelle eines pauschalen Servers für den gesamten Repository-Ordner verwenden.

Automatische Tests ohne Zusatzpakete:

```powershell
node --test tests/private-letter.test.mjs
```

Optionaler Browser-Test mit lokal installiertem Playwright und Chromium:

```powershell
node tests/private-letter.browser.mjs
```

Der Browsertest startet einen eigenen lokalen Server auf Port 8000 und verwendet ausschließlich flüchtige neutrale Testinhalte. Dafür darf auf diesem Port noch kein Server laufen. Er prüft 280, 360, 390, 540, 768 und 1440 Pixel Breite, falsches/richtiges Passwort, Hinweise, Bildfreigabe, Schließen, Neuladen und reduzierte Bewegung. Screenshots werden ausschließlich in `.private/test-output/` gespeichert.

## Schutz und Grenzen

AES-256-GCM mit zufälligem 16-Byte-Salt und 12-Byte-IV; Schlüsselableitung über PBKDF2/SHA-256 mit 600.000 Iterationen. Das Paket enthält weder Passwort noch Klartext. Das ist echte Inhaltsverschlüsselung, keine ausgeblendete HTML-Sektion. Hosting über HTTPS ist erforderlich (localhost funktioniert ebenfalls).

Die statische Datei kann heruntergeladen und offline auf Passwörter geprüft werden. Eine lange Passphrase ist deshalb wesentlich; es gibt keine serverseitige Versuchssperre. Ein neues Passwort schützt neue Pakete, macht bereits gespeicherte alte Pakete aber nicht unlesbar. Die bestehenden normalen Briefe behalten ihre bisherige einfache Passwortabfrage; diese wird durch den Sonderbrief nicht nachträglich abgesichert.

Die Seite hat keine Analytics, Drittanbieter-Fonts, externen Medien, Social-Previews oder Nutzungsberichte. Passwort und entschlüsselte Daten werden nicht in Browser-Speicher geschrieben. Beim Schließen, Verlassen oder Wechseln in einen anderen Tab wird gesperrt; dabei werden DOM und Bild-URLs entfernt. JavaScript kann keine garantierte Löschung sämtlicher Speicherkopien erzwingen. Screenshots und Speichern durch die lesende Person bleiben technisch möglich.

`noindex`, `nofollow` und `noarchive` sind gesetzt; sie ersetzen keine Verschlüsselung. Der Hostinganbieter kann weiterhin normale HTTP-Zugriffe protokollieren. Der Seitentitel und die URL sind diskret. Auf GitHub Pages lassen sich eigene HTTP-Sicherheitsheader nicht über dieses Repository konfigurieren; die Seite verwendet eine restriktive CSP im HTML. Es gibt keine automatische Freischaltung, Datumskopplung oder Zyklus-Auswertung. Den Zugangslink teilst du selbst.
