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


// ===== VIDEO ROULETTE =====
// Берём публичный плейлист загрузок YouTube-канала. Для channel ID UC... uploads playlist — UU...
const ROULETTE_CHANNEL_ID = 'UCTrZGARaVSzwa8e_KkvA7PA';
const ROULETTE_UPLOADS_PLAYLIST = 'UU' + ROULETTE_CHANNEL_ID.slice(2);
const ROULETTE_FALLBACK_IDS = [
  'gwV3miiAI70', 'ArpOwBT8ziU', 'H59flEbTfvE', 'OGziKswSrhw', 'sSYMHO9q5BY', '30FqpIx6Z1w',
  'k5TqAmRSzac', 'RlruXpZv-_A', '-PEQFhDGekg', 'mbFVPsgCLuk'
];

const rouletteMachine = document.getElementById('rouletteMachine');
const rouletteSpin = document.getElementById('rouletteSpin');
const rouletteAgain = document.getElementById('rouletteAgain');
const roulettePool = document.getElementById('roulettePool');
const rouletteStatus = document.getElementById('rouletteStatus');
const rouletteHint = document.getElementById('rouletteHint');
const rouletteResult = document.getElementById('rouletteResult');
const rouletteResultImage = document.getElementById('rouletteResultImage');
const rouletteResultTitle = document.getElementById('rouletteResultTitle');
const rouletteResultLink = document.getElementById('rouletteResultLink');
const rouletteTiles = [...document.querySelectorAll('[data-roulette-slot]')];

let rouletteVideos = [...ROULETTE_FALLBACK_IDS];
let roulettePlayer = null;
let rouletteBusy = false;
let rouletteLastWinner = null;
let roulettePlaylistLoaded = false;

const rouletteThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const rouletteWatch = (id) => `https://www.youtube.com/watch?v=${id}`;

const shuffleArray = (items) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const updateRoulettePool = (source = 'channel') => {
  if (!roulettePool || !rouletteSpin) return;
  roulettePool.innerHTML = `<span>POOL</span><strong>${rouletteVideos.length} VIDEOS</strong>`;
  rouletteSpin.disabled = rouletteVideos.length < 2;
  if (rouletteStatus) rouletteStatus.textContent = source === 'channel' ? 'ВСЕ ПУБЛИЧНЫЕ ЗАГРУЗКИ ГОТОВЫ' : 'РЕЗЕРВНЫЙ ПУЛ ГОТОВ';
  if (rouletteHint) rouletteHint.textContent = source === 'channel'
    ? 'Пул получен прямо из плейлиста загрузок YouTube. Каждый запуск выбирает случайный ролик.'
    : 'YouTube не отдал полный плейлист в этот момент, поэтому используются ролики, уже добавленные на сайт.';
};

const paintRouletteSlots = (ids, centerId = null) => {
  if (!rouletteTiles.length || !ids.length) return;
  const list = ids.length >= rouletteTiles.length ? ids : Array.from({ length: rouletteTiles.length }, (_, i) => ids[i % ids.length]);
  rouletteTiles.forEach((tile, index) => {
    const id = centerId && index === 2 ? centerId : list[index % list.length];
    const img = tile.querySelector('img');
    const label = tile.querySelector('span');
    tile.dataset.videoId = id;
    if (img) {
      img.src = rouletteThumb(id);
      img.alt = `Превью случайного видео ${index + 1}`;
    }
    if (label) label.textContent = index === 2 ? 'SELECT' : `0${index + 1}`;
  });
};

const hydrateRoulettePlaylist = () => {
  if (!roulettePlayer || roulettePlaylistLoaded) return false;
  try {
    const list = roulettePlayer.getPlaylist?.();
    if (Array.isArray(list) && list.length > 1) {
      rouletteVideos = [...new Set(list.filter(Boolean))];
      roulettePlaylistLoaded = true;
      updateRoulettePool('channel');
      paintRouletteSlots(shuffleArray(rouletteVideos).slice(0, 5));
      return true;
    }
  } catch (_) {}
  return false;
};

const setRouletteFallback = () => {
  if (roulettePlaylistLoaded) return;
  rouletteVideos = [...ROULETTE_FALLBACK_IDS];
  updateRoulettePool('fallback');
  paintRouletteSlots(shuffleArray(rouletteVideos).slice(0, 5));
};

const showRouletteWinner = async (id) => {
  rouletteLastWinner = id;
  if (rouletteResultImage) rouletteResultImage.src = rouletteThumb(id);
  if (rouletteResultLink) rouletteResultLink.href = rouletteWatch(id);
  if (rouletteResultTitle) rouletteResultTitle.textContent = 'Загружаем название видео…';
  if (rouletteResult) {
    rouletteResult.classList.add('is-visible');
    rouletteResult.setAttribute('aria-hidden', 'false');
  }

  try {
    const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(rouletteWatch(id))}`);
    if (!response.ok) throw new Error('metadata');
    const data = await response.json();
    if (rouletteResultTitle) rouletteResultTitle.textContent = data?.title || 'Случайное видео Samuil Pashyan';
    if (data?.thumbnail_url && rouletteResultImage) rouletteResultImage.src = data.thumbnail_url.replace('http://', 'https://');
  } catch (_) {
    if (rouletteResultTitle) rouletteResultTitle.textContent = 'Случайное видео Samuil Pashyan';
  }
};

const spinRoulette = async () => {
  if (rouletteBusy || rouletteVideos.length < 2) return;
  rouletteBusy = true;
  rouletteMachine?.classList.add('is-spinning');
  rouletteSpin.disabled = true;
  if (rouletteResult) {
    rouletteResult.classList.remove('is-visible');
    rouletteResult.setAttribute('aria-hidden', 'true');
  }
  if (rouletteStatus) rouletteStatus.textContent = 'РУЛЕТКА КРУТИТСЯ…';

  const pool = shuffleArray(rouletteVideos);
  let winner = pool[Math.floor(Math.random() * pool.length)];
  if (rouletteVideos.length > 1 && winner === rouletteLastWinner) {
    winner = pool.find(id => id !== rouletteLastWinner) || winner;
  }

  // Быстро меняем карточки, затем постепенно замедляемся — как настоящая рулетка.
  const delays = [70,70,75,75,80,85,90,95,105,115,125,140,155,175,200,230,270,320];
  let cursor = Math.floor(Math.random() * pool.length);
  for (const delay of delays) {
    const ids = Array.from({ length: 5 }, (_, offset) => pool[(cursor + offset) % pool.length]);
    paintRouletteSlots(ids);
    cursor = (cursor + 1) % pool.length;
    await new Promise(resolve => window.setTimeout(resolve, delay));
  }

  const winnerIndex = rouletteVideos.indexOf(winner);
  const finalIds = Array.from({ length: 5 }, (_, offset) => rouletteVideos[(winnerIndex - 2 + offset + rouletteVideos.length) % rouletteVideos.length]);
  paintRouletteSlots(finalIds, winner);
  rouletteMachine?.classList.remove('is-spinning');
  if (rouletteStatus) rouletteStatus.textContent = 'ВИДЕО ВЫБРАНО';
  rouletteSpin.disabled = false;
  rouletteBusy = false;
  await showRouletteWinner(winner);
};

rouletteSpin?.addEventListener('click', spinRoulette);
rouletteAgain?.addEventListener('click', () => {
  rouletteMachine?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(spinRoulette, 330);
});

// Сразу показываем резервные превью, а затем бесшовно заменяем пул данными YouTube.
if (rouletteMachine) {
  paintRouletteSlots(shuffleArray(rouletteVideos).slice(0, 5));
  if (rouletteStatus) rouletteStatus.textContent = 'ПОДКЛЮЧАЕМСЯ К YOUTUBE…';

  window.onYouTubeIframeAPIReady = () => {
    try {
      roulettePlayer = new YT.Player('rouletteYoutubeSource', {
        width: 240,
        height: 135,
        playerVars: { playsinline: 1, controls: 0, disablekb: 1 },
        events: {
          onReady: (event) => {
            try {
              event.target.cuePlaylist({ listType: 'playlist', list: ROULETTE_UPLOADS_PLAYLIST, index: 0, startSeconds: 0 });
            } catch (_) {
              setRouletteFallback();
            }

            let tries = 0;
            const timer = window.setInterval(() => {
              tries += 1;
              if (hydrateRoulettePlaylist() || tries >= 12) {
                window.clearInterval(timer);
                if (!roulettePlaylistLoaded) setRouletteFallback();
              }
            }, 500);
          },
          onStateChange: () => hydrateRoulettePlaylist(),
          onError: () => setRouletteFallback()
        }
      });
    } catch (_) {
      setRouletteFallback();
    }
  };

  const ytApi = document.createElement('script');
  ytApi.src = 'https://www.youtube.com/iframe_api';
  ytApi.async = true;
  ytApi.onerror = setRouletteFallback;
  document.head.appendChild(ytApi);

  // Не держим кнопку заблокированной бесконечно, если YouTube API недоступен.
  window.setTimeout(() => {
    if (!roulettePlaylistLoaded) setRouletteFallback();
  }, 7000);
}
