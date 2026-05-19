// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// Scroll progress + navbar shadow + back-to-top
const progress = document.getElementById('scrollProgress');
const navbar = document.getElementById('navbar');
const toTop = document.getElementById('toTop');
const onScroll = () => {
  const h = document.documentElement;
  const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
  progress.style.width = (scrolled * 100) + '%';
  navbar.classList.toggle('scrolled', h.scrollTop > 8);
  toTop.classList.toggle('visible', h.scrollTop > 600);
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.stagger').forEach(s => s.classList.add('visible'));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Cursor-following glow on skill cards
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

// Contact form
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');
if (new URLSearchParams(window.location.search).get('sent') === '1') {
  status.style.color = '';
  status.textContent = '✓ お問い合わせを送信しました。ありがとうございます。';
  history.replaceState({}, '', window.location.pathname + window.location.hash);
}

form.addEventListener('submit', (e) => {
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  if (!name || !email || !message) {
    e.preventDefault();
    status.textContent = '※ すべての項目を入力してください。';
    status.style.color = '#e0533d';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    e.preventDefault();
    status.textContent = '※ 正しいメールアドレスを入力してください。';
    status.style.color = '#e0533d';
    return;
  }
  status.style.color = '';
  status.textContent = '送信中...';
  submitBtn.disabled = true;
});
