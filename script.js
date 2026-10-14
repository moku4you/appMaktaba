const books = [
  { id: 'green-mile', title: 'The Green Mile', author: 'Stephen King', category: 'fiction', cover: 'cover-one', label: 'A long walk home' },
  { id: 'ways-seeing', title: 'Ways of Seeing', author: 'John Berger', category: 'essay', cover: 'cover-two', label: 'Look again' },
  { id: 'night-circus', title: 'The Night Circus', author: 'Erin Morgenstern', category: 'fiction', cover: 'cover-three', label: 'Open at midnight' },
  { id: 'quiet', title: 'The Art of Stillness', author: 'Pico Iyer', category: 'nonfiction', cover: 'cover-four', label: 'A quiet revolution' }
];
const checkoutKey = 'maktaba-checkouts';
const messageKey = 'maktaba-messages';
const readStore = key => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return [];
  }
};
const writeStore = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error writing to localStorage:', e);
    alert('Unable to save data. Your browser storage may be full.');
  }
};
const bookGrid = document.querySelector('#book-grid');
const bookSelect = document.querySelector('#book-select');

function renderBooks(filter = 'all', query = '') {
  const normalizedQuery = query.toLowerCase().trim();
  const visibleBooks = books.filter(book => (filter === 'all' || book.category === filter) && `${book.title} ${book.author}`.toLowerCase().includes(normalizedQuery));
  bookGrid.innerHTML = visibleBooks.length ? visibleBooks.map(book => `<article class="book-card" aria-label="${book.title} by ${book.author}"><div class="book-cover ${book.cover}"><span class="cover-label">${book.label}</span><h3>${book.title}</h3><span class="cover-label">maktaba / ${book.category}</span></div><div class="book-info"><div><div class="book-title">${book.title}</div><div class="book-author">${book.author}</div></div><button class="button button-outline checkout-trigger" data-book="${book.id}" type="button">Borrow +</button></div></article>`).join('') : '<p class="empty-state">No titles found. Try a different shelf.</p>';
  document.querySelectorAll('.checkout-trigger').forEach(button => button.addEventListener('click', () => { bookSelect.value = button.dataset.book; document.querySelector('#checkout').scrollIntoView({ behavior: 'smooth' }); }));
}

function populateSelect() { books.forEach(book => { const option = document.createElement('option'); option.value = book.id; option.textContent = `${book.title} — ${book.author}`; bookSelect.appendChild(option); }); }
function formatDate(date) { return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date)); }
function renderAdmin() {
  const checkouts = readStore(checkoutKey); const messages = readStore(messageKey);
  document.querySelector('#active-loans').textContent = checkouts.length;
  document.querySelector('#loan-count').textContent = checkouts.length;
  document.querySelector('#message-count').textContent = messages.length;
  document.querySelector('#activity-label').textContent = checkouts.length ? `${checkouts.length} stored locally` : 'Stored locally';
  document.querySelector('#activity-list').innerHTML = checkouts.length ? checkouts.slice().reverse().map(item => `<div class="activity-row"><strong>${item.bookTitle}</strong><small>${item.name} · ${item.email}</small><small>Return ${formatDate(item.returnDate)}</small></div>`).join('') : '<p class="empty-state">No checkouts yet. The desk is quiet.</p>';
}

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { document.querySelector('.filter.is-active').classList.remove('is-active'); button.classList.add('is-active'); renderBooks(button.dataset.filter, document.querySelector('#search-input').value); }));
document.querySelector('#search-input').addEventListener('input', event => renderBooks(document.querySelector('.filter.is-active').dataset.filter, event.target.value));
document.querySelector('#checkout-form').addEventListener('submit', event => { event.preventDefault(); const selected = books.find(book => book.id === bookSelect.value); if (!selected) { document.querySelector('#checkout-status').textContent = 'Please select a valid book.'; return; } const record = { bookTitle: selected.title, name: document.querySelector('#borrower-name').value, email: document.querySelector('#borrower-email').value, returnDate: document.querySelector('#return-date').value, createdAt: new Date().toISOString() }; writeStore(checkoutKey, [...readStore(checkoutKey), record]); event.target.reset(); document.querySelector('#checkout-status').textContent = `"${record.bookTitle}" is yours until ${formatDate(record.returnDate)}.`; renderAdmin(); });
document.querySelector('#contact-form').addEventListener('submit', event => { event.preventDefault(); const message = document.querySelector('#contact-message').value; if (!message.trim()) { document.querySelector('#contact-status').textContent = 'Please enter a message.'; return; } writeStore(messageKey, [...readStore(messageKey), { message: message, createdAt: new Date().toISOString() }]); event.target.reset(); document.querySelector('#contact-status').textContent = 'Message received. We will write back soon.'; renderAdmin(); });
document.querySelector('#clear-data').addEventListener('click', () => { localStorage.removeItem(checkoutKey); localStorage.removeItem(messageKey); document.querySelector('#checkout-status').textContent = ''; document.querySelector('#contact-status').textContent = ''; renderAdmin(); });
const menuToggle = document.querySelector('.menu-toggle'); menuToggle.addEventListener('click', () => { const nav = document.querySelector('.nav-links'); const isOpen = nav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', isOpen); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => { document.querySelector('.nav-links').classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); }));
populateSelect(); renderBooks(); renderAdmin();
