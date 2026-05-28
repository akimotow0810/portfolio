// Custom cursor
(function() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0, visible = false;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (!visible) {
      dot.style.opacity = '1'; ring.style.opacity = '1';
      rx = mx; ry = my; visible = true;
    }
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  // Ring follows with smooth lerp
  (function animateRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  // Hover state on clickable elements
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button, [role="button"], input, textarea, select')) {
      document.body.classList.add('cur-hover');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button, [role="button"], input, textarea, select')) {
      document.body.classList.remove('cur-hover');
    }
  });

  // Click ripple
  document.addEventListener('mousedown', () => {
    document.body.classList.add('cur-click');
    setTimeout(() => document.body.classList.remove('cur-click'), 150);
  });

  // Hide when leaving window
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => {
    if (!visible) return;
    dot.style.opacity = '1'; ring.style.opacity = '1';
  });
})();

// Preloader
window.addEventListener('load', () => {
  const pl = document.getElementById('preloader');
  if (!pl) return;
  // Minimum display 1.6s so the animation completes
  const elapsed = performance.now();
  const delay = Math.max(0, 1600 - elapsed);
  setTimeout(() => pl.classList.add('done'), delay);
});

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
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.stagger').forEach(s => s.classList.add('visible'));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Stagger observers for elements not inside .reveal
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.stagger').forEach(el => {
  if (!el.closest('.reveal')) staggerObserver.observe(el);
});

// Cursor-following glow on skill cards
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

// Number counter animation for hero stats
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(ease * target);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const heroSection = document.querySelector('.hero');
if (heroSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.hero-stat-num[data-target]').forEach(animateCounter);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statsObserver.observe(heroSection);
}

// Works carousel
const carousel = document.getElementById('worksCarousel');
const prevBtn = document.querySelector('.works-prev');
const nextBtn = document.querySelector('.works-next');
const dotsContainer = document.getElementById('worksDots');

if (carousel && prevBtn && nextBtn) {
  const cards = carousel.querySelectorAll('.work-card');
  const cardCount = cards.length;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'works-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `作品 ${i + 1}`);
    dot.addEventListener('click', () => scrollToCard(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.works-dot');

  function getCardWidth() {
    const card = cards[0];
    if (!card) return 340;
    const gap = parseInt(window.getComputedStyle(carousel).gap || '20', 10);
    return card.offsetWidth + gap;
  }

  function getCurrentIndex() {
    return Math.round(carousel.scrollLeft / getCardWidth());
  }

  function scrollToCard(index) {
    const clamped = Math.max(0, Math.min(index, cardCount - 1));
    carousel.scrollTo({ left: clamped * getCardWidth(), behavior: 'smooth' });
  }

  function updateState() {
    const idx = getCurrentIndex();
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    prevBtn.disabled = idx === 0;
    nextBtn.disabled = idx >= cardCount - 1;
  }

  prevBtn.addEventListener('click', () => scrollToCard(getCurrentIndex() - 1));
  nextBtn.addEventListener('click', () => scrollToCard(getCurrentIndex() + 1));
  carousel.addEventListener('scroll', updateState, { passive: true });
  updateState();

  // Drag to scroll
  let isDown = false, startX = 0, scrollLeft = 0;
  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carousel.classList.add('dragging');
    carousel.style.scrollBehavior = 'auto';
  });
  document.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    carousel.classList.remove('dragging');
    carousel.style.scrollBehavior = 'smooth';
    scrollToCard(getCurrentIndex());
  });
  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    carousel.scrollLeft = scrollLeft - (e.pageX - carousel.offsetLeft - startX);
  });
  carousel.addEventListener('mouseleave', () => {
    if (!isDown) return;
    isDown = false;
    carousel.classList.remove('dragging');
    carousel.style.scrollBehavior = 'smooth';
  });
}

// Contact form
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
const submitBtn = form.querySelector('button[type="submit"]');
if (new URLSearchParams(window.location.search).get('sent') === '1') {
  status.style.color = '#2ec27e';
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
    status.style.color = '#ff6b6b';
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    e.preventDefault();
    status.textContent = '※ 正しいメールアドレスを入力してください。';
    status.style.color = '#ff6b6b';
    return;
  }
  status.style.color = '';
  status.textContent = '送信中...';
  submitBtn.disabled = true;
});
