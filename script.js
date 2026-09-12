// Кинематографичная заставка при открытии сайта.
const siteIntro = document.getElementById('siteIntro');
const introSkip = document.getElementById('introSkip');
let introTimer;
let introFinished = false;

const finishIntro = () => {
  if (!siteIntro || introFinished) return;
  introFinished = true;
  clearTimeout(introTimer);
  siteIntro.classList.add('is-leaving');
  document.body.classList.remove('intro-active');

  window.setTimeout(() => {
    siteIntro.remove();
  }, 720);
};

if (siteIntro) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  introTimer = window.setTimeout(finishIntro, reduceMotion ? 650 : 3150);
  introSkip?.addEventListener('click', finishIntro);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') finishIntro();
  }, { once: true });
} else {
  document.body.classList.remove('intro-active');
}

const header = document.getElementById('header');
const progress = document.getElementById('progress');
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');
const bikeCard = document.getElementById('bikeCard');

const updateScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 24);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
};

window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.classList.toggle('active', open);
  menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflow = open ? 'hidden' : '';
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

if (window.matchMedia('(pointer: fine)').matches && bikeCard) {
  const parent = bikeCard.parentElement;
  parent.addEventListener('mousemove', (e) => {
    const r = parent.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    bikeCard.style.transform = `rotateY(${x * 10 - 6}deg) rotateX(${-y * 8 + 2}deg) translateY(-4px)`;
  });
  parent.addEventListener('mouseleave', () => {
    bikeCard.style.transform = 'rotateY(-8deg) rotateX(3deg)';
  });
}

// Небольшой magnetic-эффект на главных кнопках.
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * .06}px, ${y * .1}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

// Если у YouTube нет maxres-превью, используем гарантированное hqdefault.
document.querySelectorAll('img[data-fallback]').forEach(img => {
  img.addEventListener('error', () => {
    const fallback = img.dataset.fallback;
    if (fallback && img.src !== fallback) img.src = fallback;
  }, { once: true });
});

// Подтягиваем реальные названия роликов через публичный oEmbed/noembed.
// Если запрос заблокирован браузером или сетью, остаются запасные названия.
document.querySelectorAll('.video-card[data-video-url]').forEach(async (card) => {
  const url = card.dataset.videoUrl;
  const title = card.querySelector('[data-video-title]');
  const thumb = card.querySelector('.video-thumb');

  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
    if (!response.ok) return;
    const data = await response.json();
    if (data?.title && title) title.textContent = data.title;
    if (data?.thumbnail_url && thumb) thumb.src = data.thumbnail_url.replace('http://', 'https://');
  } catch (_) {
    // Сайт продолжает работать без метаданных.
  }
});

// В FAQ оставляем открытым не больше одного ответа, чтобы длинная страница была аккуратнее.
const faqItems = document.querySelectorAll('.faq-list details');
faqItems.forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});

// Фото-галерея: открываем загруженные фотографии в полноэкранном режиме.
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

document.querySelectorAll('[data-lightbox]').forEach(card => {
  card.addEventListener('click', () => {
    if (!lightbox || !lightboxImage) return;
    lightboxImage.src = card.dataset.lightbox;
    lightboxImage.alt = card.dataset.caption || 'Фотография Samuil Pashyan';
    if (lightboxCaption) lightboxCaption.textContent = card.dataset.caption || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) {
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
}
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
});
