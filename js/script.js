/*
 Script um Briefe hinzuzufügen
 Einfach letters kopieren und aein neues Array anhängen.
 */
function toParagraphs(text) {
    return text.trim().split(/\r?\n\s*\r?\n/);
}

const letters = [
    {
        id: "2026-08-11",
        date: "11. August 2026",
        title: "Der allererste Brief",
        salutation: "An die Person die es am meisten verdient - dich Chantal!",
        paragraphs: toParagraphs(`
Mach dich auf viele Briefe gefasst.

Hey Chantal. Dein Tag heute war sichtlich beschissen und deswegen dachte ich mir, dass ich dir etwas Schönes zukommen lasse.

Ich möchte dir auf diese Art und Weise täglich einen kleinen Brief hier hinterlassen, damit du dich jeden Tag auf etwas freuen kannst.

Ob du diese Briefe liest, ist natürlich ganz dir überlassen.

Dass du heute erfahren hast, dass die Betreuung erst mal länger funktioniert, hat mich unglaublich gefreut, weil du dich so besser auf die anderen Sachen konzentrieren kannst.

Es gibt für diesen Tag ein Wort des Tages und das lautet: Kaizen! Passend zu der heutigen Nachricht sollst du deinen Alltag dadurch besser optimieren können. Vielleicht nicht direkt heute, aber in der kommenden Zeit, damit wieder mehr Zeit für schöne Dinge bleibt!

Ich bin immer noch extrem froh darüber, mit dir Kontakt aufgenommen zu haben. Denn wer hätte erahnen können, dass hinter deinem IG-Profil eine so unglaubliche Person steckt?

Bei dem Gedanken an all die kommenden Momente mit dir muss ich unweigerlich lächeln ☺️

Damit das hier nicht ausartet, soll es für heute genügen und morgen wird der nächste Brief verfügbar sein.

Ich hoffe, du freust dich darüber 🤗
Fühl dich gedrückt und geliebt!
    `),
        closing: "Dein",
        signature: "Flo 🖤"
    },
    {
        id: "2026-08-12",
        date: "12. August 2026",
        title: "Tag 2",
        salutation: "Tag der Sonnenfinsternis",
        paragraphs: toParagraphs(`
Heute ist ein komischer Tag. Gestern hast du mir mit deinen Murmeln noch den Kopf verdreht und heute hätte ich super gern die Sonnenfinsternis mit dir gemeinsam erlebt.

Als du mich gefragt hast, ob ich sauer auf dich sei, sagte ich: Nein, ich verstehe deine Situation ja und das ist auch die Wahrheit.

Falls es dir noch nicht aufgefallen ist: Du hast schon jetzt einen besonderen Platz in meinem Leben und ich würde diesen Platz allzu gern vergrößern.

Nun ja, ich muss mich selbst drosseln, sonst schreibe ich noch stundenlang weiter.

Sei dir gewiss, ich denke öfter an dich, als du das vielleicht ahnst.

https://open.spotify.com/track/1UzTXathgPOWc8vGtrb5FY

Wie im Song beschrieben:
Baby it is not an Illusion
I just want you to stay
I don't care if it's right or wrong
I'll take you either
Tell me it's not a delusion
I'm caught in a midnight love
Won't let you slip away 💜🖤

https://www.instagram.com/reels/Db6sB0oTwtO/
    `),
        closing: "Dein",
        signature: "Flo 🖤"
    }
];

const openButton = document.querySelector("#open-letter");
const printButton = document.querySelector("#print-letter");
const backButton = document.querySelector("#back-to-archive");
const scroll = document.querySelector("#scroll");
const letterList = document.querySelector("#letter-list");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let selectedLetter = letters[0];
let openingTimer;
let focusTimer;

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function renderParagraph(paragraph, index) {
  const value = paragraph.trim();
  const safeValue = escapeHtml(value);
  const spotifyMatch = value.match(
    /^https:\/\/open\.spotify\.com\/(track|album|playlist|episode|show)\/([a-zA-Z0-9]+)/i
  );

  if (spotifyMatch) {
    const [, type, id] = spotifyMatch;

    return `
      <iframe
        class="spotify-player"
        src="https://open.spotify.com/embed/${type}/${id}"
        title="Spotify-Player"
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      ></iframe>
    `;
  }

  if (/^(?:https?:\/\/\S+|(?:\.\.\/|\.\/)?[^\s]+)\.(?:png|jpe?g|gif|webp|avif)(?:\?\S*)?$/i.test(value)) {
    return `
      <figure class="letter-image">
        <img src="${safeValue}" alt="Bild zum Brief" loading="lazy">
      </figure>
    `;
  }

  if (/^https:\/\/(?:www\.)?instagram\.com\//i.test(value)) {
    return `
      <p class="social-link">
        <a href="${safeValue}" target="_blank" rel="noopener noreferrer">
          Beitrag auf Instagram ansehen ↗
        </a>
      </p>
    `;
  }

  if (/^https?:\/\/\S+$/i.test(value)) {
    return `
      <p class="external-link">
        <a href="${safeValue}" target="_blank" rel="noopener noreferrer">${safeValue}</a>
      </p>
    `;
  }

  const placeholderClass = index === 0 && value.startsWith("[")
    ? ' class="placeholder"'
    : "";

  return `<p${placeholderClass}>${safeValue}</p>`;
}

function renderArchive() {
  letterList.innerHTML = letters.map((letter) => `
    <button class="archive-card" type="button" data-letter-id="${escapeHtml(letter.id)}"
      aria-pressed="${letter.id === selectedLetter.id}">
      <span class="archive-card__date">${escapeHtml(letter.date)}</span>
      <span class="archive-card__title">${escapeHtml(letter.title)}</span>
    </button>
  `).join("");
}

function renderLetter(letter) {
  document.querySelector(".letter-date").textContent = `${letter.date} · Für Chantal`;
  document.querySelector("#letter-title").textContent = letter.salutation;
  document.querySelector(".letter-copy").innerHTML = letter.paragraphs
    .map((paragraph, index) => renderParagraph(paragraph, index))
    .join("");
  document.querySelector(".signature").innerHTML = `${escapeHtml(letter.closing)}<br><span>${escapeHtml(letter.signature)}</span>`;
  document.title = `${letter.title} – Für Chantal`;
}

function selectLetter(id) {
  const letter = letters.find((entry) => entry.id === id);
  if (!letter) return;
  selectedLetter = letter;
  renderArchive();
  renderLetter(letter);
  openButton.focus();
}

function openLetter() {
  if (openButton.disabled) return;
  renderLetter(selectedLetter);
  openButton.disabled = true;
  openButton.classList.add("is-opening");

  openingTimer = window.setTimeout(() => {
    document.body.classList.add("letter-open");
    openButton.setAttribute("aria-expanded", "true");
    scroll.setAttribute("aria-hidden", "false");
    focusTimer = window.setTimeout(() => backButton.focus({ preventScroll: true }), reducedMotion ? 0 : 2700);
  }, reducedMotion ? 0 : 1500);
}

function returnToArchive() {
  window.clearTimeout(openingTimer);
  window.clearTimeout(focusTimer);
  document.body.classList.remove("letter-open");
  openButton.classList.remove("is-opening");
  openButton.disabled = false;
  openButton.setAttribute("aria-expanded", "false");
  scroll.setAttribute("aria-hidden", "true");
  document.title = "Flo's Briefe für Chantal";
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  window.setTimeout(() => openButton.focus({ preventScroll: true }), reducedMotion ? 0 : 500);
}

letterList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-letter-id]");
  if (card) selectLetter(card.dataset.letterId);
});

openButton.addEventListener("click", openLetter);
backButton.addEventListener("click", returnToArchive);
printButton.addEventListener("click", () => window.print());

renderArchive();
renderLetter(selectedLetter);
