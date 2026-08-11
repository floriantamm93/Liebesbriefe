/*
 Script um Briefe hinzuzufügen
 Einfach letters kopieren und aein neues Array anhängen.
 */
const letters = [
  {
    id: "2026-08-11",
    date: "11. August 2026",
    title: "Der allererste Brief",
    salutation: "An die Person die es am meisten verdient - dich Chantal!",
    paragraphs: [
      "Mach dich auf viele Briefe gefasst.",
        "Hey Chantal. Dein Tag heute war sichtlich beschissen und deswegen dachte ich mir, dass ich dir etwas schönes zukommen lasse.",
        "Ich möchte dir auf diese Art und Weise täglich einen kleinen Brief hier hinterlassen für dich damit du dich jeden Tag auf etwas freuen kannst.",
        "Ob du diese Briefe liest ist natürlich ganz dir überlassen.",
        "Das du heute erfahren hast, dass die Betreuung erstmal länger funktioniert hat mich unglaublich gefreut weil du so dich auf die anderen Sachen besser konzentrieren kannst",
        "Es gibt für diesen Tag ein Wort des Tages und das lautet: !Kaizen! Passend zu der heutigen Nachricht sollst du deinen Alltag dadurch besser optimieren können. Vielleicht nicht direkt heute aber in der kommenden Zeit damit wieder mehr Zeit für schöne Dinge bleibt!",
        "Ich bin immer noch extrem froh darüber mit dir Kontakt aufgenommen zu haben. Denn wer hätte erahnen können, dass hinter deinem IG Profil eine so unglaubliche Person steckt. Die einen extrem guten Gerechtigkeitssinn, unglaublich kreativ, liebend wie keine Zweite und Humorvoll wie der beste Comedian ist ",
        "Bei dem Gedanken an all die kommenden Momente mit dir muss ich unweigerlich lächeln ☺️",
        "Damit das hier nicht ausartet soll es für heute genügen und morgen wird der nächste Brief verfügbar sein.",
        "Ich hoffe du freust dich darüber 🤗"
    ],
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
    .map((paragraph, index) => `<p${index === 0 && paragraph.startsWith("[") ? ' class="placeholder"' : ""}>${escapeHtml(paragraph)}</p>`)
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
  document.title = "Flo's Briefe für CHantal";
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
