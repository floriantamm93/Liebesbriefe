import { letters } from "./letters/index.js?v=2026-09-21";

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

function formatLetterMeta(letter) {
  return letter.time
    ? `${letter.date} · ${letter.time} Uhr`
    : letter.date;
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
      <span class="archive-card__date">${escapeHtml(formatLetterMeta(letter))}</span>
      <span class="archive-card__title">${escapeHtml(letter.title)}</span>
    </button>
  `).join("");
}

function renderLetter(letter) {
  document.querySelector(".letter-date").textContent = `${formatLetterMeta(letter)} · Für Chantal`;
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
    if (selectedLetter.password) {
        const eingabe = prompt("Dieser Brief ist versiegelt. Passwort eingeben:");
        if (eingabe !== selectedLetter.password) {
            alert("Das Passwort ist leider falsch.");
            return;
        }
    }
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
