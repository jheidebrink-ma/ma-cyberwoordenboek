const $ = id => document.getElementById(id);
const state = { terms: [], query: '', letter: 'Alle', limit: 24 };
const normalize = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('nl');
const initial = term => /^[a-z]/i.test(term) ? term[0].toUpperCase() : '#';
const detail = $('detail'), proposal = $('proposal');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function animateOverview() {
  if (!reducedMotion.matches) $('results').animate([
    { opacity: 0, transform: 'translateY(12px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 500, easing: 'ease-out' });
}
// Capture also handles buttons created dynamically and keyboard activation.
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button || button.disabled || reducedMotion.matches) return;
  for (const animation of button.getAnimations()) animation.cancel();
  button.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(.94)', offset: .25 },
    { transform: 'scale(1)' }
  ], { duration: 500, easing: 'ease-out' });
}, true);
function element(tag, text, className) { const e = document.createElement(tag); if (text) e.textContent = text; if (className) e.className = className; return e; }
function showTerm(term) {
  $('detail-title').textContent = term.term;
  $('detail-definition').textContent = term.definition.startsWith('Kijk voor de toelichting bij de gerelateerde term') ? 'Bekijk de uitleg bij de gerelateerde termen hieronder.' : term.definition;
  $('detail-related').replaceChildren();
  if (term.related.length) {
    $('detail-related').append(element('h3', 'Gerelateerde termen'));
    for (const name of term.related) {
      const target = state.terms.find(t => normalize(t.term) === normalize(name));
      const link = element(target ? 'button' : 'span', name, 'related-link');
      if (target) link.addEventListener('click', () => openTerm(target));
      $('detail-related').append(link);
    }
  }
  $('detail-source').replaceChildren();
  const source = element('a', term.page ? `Bron: DigiTaal · pagina ${term.page}` : 'Goedgekeurde inzending op GitHub');
  source.href = term.page ? 'bron/cyberwoordenboek-digitaal.pdf#page=' + term.page : term.issue;
  source.target = '_blank'; source.rel = 'noopener noreferrer'; $('detail-source').append(source);
  $('copy-status').textContent = '';
  if (!detail.open) detail.showModal();
}
function openTerm(term) { history.pushState(null, '', '#term=' + encodeURIComponent(term.id)); showTerm(term); }
function render() {
  const words = normalize(state.query).split(/\s+/).filter(Boolean);
  const matches = state.terms.filter(t => (state.letter === 'Alle' || initial(t.term) === state.letter) && words.every(w => t.search.includes(w)));
  $('results').replaceChildren();
  $('result-count').textContent = `${matches.length} ${matches.length === 1 ? 'term' : 'termen'}${state.query ? ' gevonden' : ''}`;
  $('reset').hidden = !state.query && state.letter === 'Alle';
  for (const t of matches.slice(0, state.limit)) {
    const card = element('article', null, 'term-card');
    card.append(element('div', initial(t.term) + ' / CYBERTERM', 'term-letter'));
    const h = element('h3'), title = element('button', t.term); title.addEventListener('click', () => openTerm(t)); h.append(title);card.append(h);
    card.append(element('p', t.definition.length > 170 ? t.definition.slice(0, 170).trimEnd() + '…' : t.definition));
    const more = element('button', 'Bekijk uitleg ', 'read-more');more.append(element('span', '→'));more.setAttribute('aria-label', 'Bekijk uitleg van ' + t.term);more.addEventListener('click', () => openTerm(t));card.append(more);
    $('results').append(card);
  }
  if (!matches.length) { const empty = element('div', null, 'empty'); empty.append(element('h3', 'Geen termen gevonden'), element('p', 'Probeer een ander zoekwoord of wis je filters. Mis je een term? Stel hem gerust voor.')); $('results').append(empty); }
  $('load-more').hidden = matches.length <= state.limit;
  for (const b of $('alphabet').children) b.setAttribute('aria-pressed', String(b.textContent === state.letter));
}
for (const letter of ['Alle', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']) {
  const b = element('button', letter);b.setAttribute('aria-pressed', String(letter === 'Alle')); b.addEventListener('click', () => { state.letter = letter;state.limit = 24;render();animateOverview();$('results').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' }); });$('alphabet').append(b);
}
$('search').addEventListener('input', e => { state.query = e.target.value;state.limit = 24;render(); });
$('reset').addEventListener('click', () => { state.query = '';state.letter = 'Alle';state.limit = 24;$('search').value = '';render(); });
$('load-more').addEventListener('click', () => { state.limit += 24;render(); });
for (const id of ['open-proposal', 'open-proposal-bottom']) $(id).addEventListener('click', () => proposal.showModal());
for (const d of [detail, proposal]) {
  d.querySelector('.close').addEventListener('click', () => d.close());
  d.addEventListener('click', e => { if (e.target === d) { const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close(); } });
}
detail.addEventListener('close', () => { if (location.hash.startsWith('#term=')) history.replaceState(null, '', location.pathname + location.search + '#woordenboek'); });
$('copy-link').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href);$('copy-status').textContent = 'Link gekopieerd.'; } catch { $('copy-status').textContent = 'Kopieer de link uit de adresbalk van je browser.'; } });
$('proposal-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.target);
  const url = new URL('https://github.com/jheidebrink-ma/ma-cyberwoordenboek/issues/new');
  url.search = new URLSearchParams({ template: 'term.yml', title: '[Term] ' + form.get('term').trim(), term: form.get('term').trim(), uitleg: form.get('definition').trim(), gerelateerd: form.get('related').trim() });
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
});
document.addEventListener('keydown', e => { if (e.key === '/' && !detail.open && !proposal.open && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault();$('search').focus(); } });
function fromHash() { if (location.hash.startsWith('#term=')) { const t = state.terms.find(t => '#term=' + encodeURIComponent(t.id) === location.hash); if (t) showTerm(t); } else if(detail.open)detail.close(); }
window.addEventListener('hashchange', fromHash);
try {
  const response = await fetch('terms.json');if (!response.ok) throw Error('Laden mislukt');
  state.terms = (await response.json()).map(t => ({ ...t, search: normalize([t.term,t.definition,...t.related].join(' ')) })).sort((a,b) => a.term.localeCompare(b.term,'nl',{numeric:true}));
  $('total').textContent = state.terms.length + ' termen';$('results').setAttribute('aria-busy','false');render();fromHash();
} catch { $('total').textContent = 'Niet geladen';$('results').setAttribute('aria-busy','false');$('results').append(element('p', 'Het woordenboek kon niet worden geladen. Vernieuw de pagina of lees de originele pdf.', 'empty')); }
