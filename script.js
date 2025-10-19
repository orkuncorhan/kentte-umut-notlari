// Basit veriler (demo)
const defaultNotes = [
  { text: "Otobüs şoförü aynadan gülümsedi; bütün günüm değişti.", tag: "iyilik", place: "Karşıyaka" },
  { text: "Kaldırım taşının arasındaki papatya inadına açtı.", tag: "doğa", place: "Konak" },
  { text: "Sahilde, rüzgârla birlikte birinin gitarına eşlik ettik.", tag: "kent", place: "Güzelyalı" }
];

const storageKey = "kun-notes-v1";

// Yıl
document.getElementById("year").textContent = new Date().getFullYear();

// Menü (mobil)
const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("site-menu");
if (toggle) {
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    nav.setAttribute("aria-expanded", String(!expanded));
  });
}

// Yerel depolama yardımcıları
function loadNotes(){
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(defaultNotes));
    return [...defaultNotes];
  }
  try { return JSON.parse(saved) } catch { return [...defaultNotes] }
}

function saveNotes(notes){
  localStorage.setItem(storageKey, JSON.stringify(notes));
}

// Kartları çiz
const cardsEl = document.getElementById("cards");
function renderCards(filter = {}){
  const notes = loadNotes();
  let filtered = notes;
  if (filter.query){
    const q = filter.query.toLowerCase();
    filtered = filtered.filter(n => n.text.toLowerCase().includes(q) || (n.place||"").toLowerCase().includes(q));
  }
  if (filter.tag){
    filtered = filtered.filter(n => n.tag === filter.tag);
  }

  if (filtered.length === 0){
    cardsEl.innerHTML = '<p>Henüz eşleşen not yok. İlk notu sen eklemek ister misin?</p>';
    return;
  }

  cardsEl.innerHTML = filtered.map(n => `
    <article class="card">
      <p>${escapeHtml(n.text)}</p>
      <div class="meta">
        <span class="tag">#${n.tag}</span>
        ${n.place ? `<span class="place">• ${escapeHtml(n.place)}</span>` : ""}
      </div>
    </article>
  `).join("");
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// Filtreler
const search = document.getElementById("search");
const tagFilter = document.getElementById("tagFilter");
function updateFilters(){
  renderCards({ query: search.value.trim(), tag: tagFilter.value });
}
if (search) search.addEventListener("input", updateFilters);
if (tagFilter) tagFilter.addEventListener("change", updateFilters);

// Form işlemleri
const form = document.getElementById("noteForm");
const msg = document.getElementById("formMsg");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.textContent = "";

  const text = document.getElementById("noteText").value.trim();
  const tag = document.getElementById("noteTag").value;
  const place = document.getElementById("notePlace").value.trim();
  const consent = document.getElementById("consent").checked;

  if (!text){
    msg.textContent = "Lütfen bir not yaz.";
    return;
  }
  if (!tag){
    msg.textContent = "Lütfen bir etiket seç.";
    return;
  }
  if (!consent){
    msg.textContent = "Devam etmek için etik kutucuğunu işaretlemelisin.";
    return;
  }

  const notes = loadNotes();
  notes.unshift({ text, tag, place });
  saveNotes(notes);

  form.reset();
  msg.textContent = "Not eklendi.";
  renderCards();
});

// İlk çizim
renderCards();
updateFilters();
