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


// ===== CHALLENGE ROULETTE =====
const challengeTasks = [
  { title: 'Сними 10-секундный cinematic-кадр своей техники', description: 'Мотоцикл, машина, велосипед или самокат — техника стоит на месте, а ты снимаешь красивый короткий кадр.', category: 'CREATIVE', difficulty: 'ЛЁГКО', time: '5 МИН' },
  { title: 'Сделай фото в стиле обложки мотоблога', description: 'Выбери интересный ракурс, фон и попробуй сделать кадр, который мог бы стать превью ролика.', category: 'PHOTO', difficulty: 'ЛЁГКО', time: '5 МИН' },
  { title: 'Собери свой топ-3 техники мечты', description: 'Выбери три мотоцикла или машины и коротко объясни, почему каждая попала в твой список.', category: 'GARAGE', difficulty: 'ЛЁГКО', time: '3 МИН' },
  { title: 'Нарисуй дизайн мотоцикла за 3 минуты', description: 'Бумага или заметки в телефоне — придумай раскраску, номер и стиль своего идеального проекта.', category: 'CREATIVE', difficulty: 'СРЕДНЕ', time: '3 МИН' },
  { title: 'Назови 5 марок мотоциклов за 10 секунд', description: 'Запусти таймер и попробуй уложиться. Повторять одну марку дважды нельзя.', category: 'SPEED', difficulty: 'СРЕДНЕ', time: '10 СЕК' },
  { title: 'Сделай фото «до / после» чистки техники', description: 'Подойдёт велосипед, самокат, мотоцикл или автомобиль. Безопасно приведи его в порядок и сравни результат.', category: 'GARAGE', difficulty: 'СРЕДНЕ', time: '15 МИН' },
  { title: 'Придумай название для будущего мотопроекта', description: 'Название должно звучать так, будто это новый проект для YouTube. Чем необычнее — тем лучше.', category: 'CREATIVE', difficulty: 'ЛЁГКО', time: '2 МИН' },
  { title: 'Найди старый ролик Самуила, который ещё не смотрел', description: 'Открой канал, пролистай назад и выбери видео, которое раньше пропустил.', category: 'WATCH', difficulty: 'ЛЁГКО', time: '10 МИН' },
  { title: 'Сделай мото- или авто-мем', description: 'Используй свою фотографию или придумай текстовый мем про поездки, ремонт или вечный выбор техники.', category: 'MEME', difficulty: 'ЛЁГКО', time: '5 МИН' },
  { title: 'Сними 15 секунд «мой транспорт сегодня»', description: 'Покажи свой транспорт красивыми статичными планами. Никакой съёмки во время опасного движения.', category: 'VIDEO', difficulty: 'ЛЁГКО', time: '5 МИН' },
  { title: 'Устрой угадайку марки техники по фото', description: 'Покажи другу фрагмент фотографии мотоцикла или машины и дай три попытки угадать марку.', category: 'GAME', difficulty: 'ЛЁГКО', time: '5 МИН' },
  { title: 'Придумай челлендж для Самуила', description: 'Сформулируй безопасную идею для будущего ролика и оставь её ниже в гостевой книге сайта.', category: 'IDEA', difficulty: 'СРЕДНЕ', time: '5 МИН' },
  { title: 'Выбери: эндуро, супермото или дрифт', description: 'Можно выбрать только один вариант. Объясни свой выбор одним предложением.', category: 'CHOICE', difficulty: 'ЛЁГКО', time: '1 МИН' },
  { title: 'Сделай обои телефона из фото любимой техники', description: 'Возьми свою фотографию или разрешённое изображение и оформи простой wallpaper.', category: 'DESIGN', difficulty: 'СРЕДНЕ', time: '10 МИН' },
  { title: 'Посмотри один старый ролик Самуила до конца', description: 'Выбери видео, которое давно не видел, и попробуй найти момент, который раньше не замечал.', category: 'WATCH', difficulty: 'ЛЁГКО', time: '15 МИН' },
  { title: 'Составь мини-плейлист из 3 роликов Самуила', description: 'Выбери три видео, с которых ты бы посоветовал начать знакомство с каналом.', category: 'WATCH', difficulty: 'ЛЁГКО', time: '5 МИН' },
  { title: 'Покажи этот сайт одному другу', description: 'Отправь ссылку человеку, которому нравятся мотоциклы, машины или автомобильные ролики.', category: 'SOCIAL', difficulty: 'ЛЁГКО', time: '1 МИН' },
  { title: 'Придумай слоган канала за 30 секунд', description: 'Короткая фраза — максимум 6 слов. Она должна передавать скорость, технику и приключения.', category: 'SPEED', difficulty: 'СРЕДНЕ', time: '30 СЕК' },
  { title: 'Выбери лучшее фото в галерее сайта', description: 'Открой галерею, посмотри все фотографии крупно и выбери одну любимую.', category: 'PHOTO', difficulty: 'ЛЁГКО', time: '2 МИН' },
  { title: 'Придумай идею превью для следующего ролика', description: 'Опиши кадр, крупный текст и главный объект будущей обложки YouTube.', category: 'DESIGN', difficulty: 'СРЕДНЕ', time: '5 МИН' }
];

const rouletteMachine = document.getElementById('rouletteMachine');
const rouletteSpin = document.getElementById('rouletteSpin');
const rouletteAgain = document.getElementById('rouletteAgain');
const rouletteStatus = document.getElementById('rouletteStatus');
const rouletteResult = document.getElementById('rouletteResult');
const rouletteResultTitle = document.getElementById('rouletteResultTitle');
const taskResultDescription = document.getElementById('taskResultDescription');
const taskResultNumber = document.getElementById('taskResultNumber');
const taskResultCategory = document.getElementById('taskResultCategory');
const taskResultDifficulty = document.getElementById('taskResultDifficulty');
const taskResultTime = document.getElementById('taskResultTime');
const challengeWheel = document.getElementById('challengeWheel');
const challengeShare = document.getElementById('challengeShare');

let rouletteBusy = false;
let rouletteLastWinner = -1;
let wheelRotation = 0;
let currentTask = null;

const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

const showChallengeWinner = (index) => {
  const task = challengeTasks[index];
  currentTask = task;
  rouletteLastWinner = index;
  if (taskResultNumber) taskResultNumber.textContent = String(index + 1).padStart(2, '0');
  if (taskResultCategory) taskResultCategory.textContent = task.category;
  if (rouletteResultTitle) rouletteResultTitle.textContent = task.title;
  if (taskResultDescription) taskResultDescription.textContent = task.description;
  if (taskResultDifficulty) taskResultDifficulty.textContent = task.difficulty;
  if (taskResultTime) taskResultTime.textContent = task.time;
  if (rouletteResult) {
    rouletteResult.classList.add('is-visible');
    rouletteResult.setAttribute('aria-hidden', 'false');
  }
};

const spinChallengeRoulette = async () => {
  if (rouletteBusy || !challengeWheel) return;
  rouletteBusy = true;
  rouletteSpin.disabled = true;
  rouletteMachine?.classList.add('is-spinning');
  rouletteResult?.classList.remove('is-visible');
  rouletteResult?.setAttribute('aria-hidden', 'true');
  if (rouletteStatus) rouletteStatus.textContent = 'РУЛЕТКА КРУТИТСЯ…';

  let winner = Math.floor(Math.random() * challengeTasks.length);
  if (challengeTasks.length > 1 && winner === rouletteLastWinner) {
    winner = (winner + 1 + Math.floor(Math.random() * (challengeTasks.length - 1))) % challengeTasks.length;
  }

  const extraTurns = 6 + Math.floor(Math.random() * 4);
  const offset = Math.floor(Math.random() * 360);
  wheelRotation += extraTurns * 360 + offset;
  challengeWheel.style.transform = `rotate(${wheelRotation}deg)`;

  await wait(4300);
  rouletteMachine?.classList.remove('is-spinning');
  if (rouletteStatus) rouletteStatus.textContent = 'ЗАДАНИЕ ВЫБРАНО';
  rouletteSpin.disabled = false;
  rouletteBusy = false;
  showChallengeWinner(winner);
};

rouletteSpin?.addEventListener('click', spinChallengeRoulette);
rouletteAgain?.addEventListener('click', () => {
  rouletteMachine?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(spinChallengeRoulette, 320);
});

challengeShare?.addEventListener('click', async () => {
  if (!currentTask) return;
  const text = `Мне выпало задание на сайте Samuil Pashyan: «${currentTask.title}» — ${currentTask.description}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Samuil Challenge Roulette', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      const old = challengeShare.innerHTML;
      challengeShare.textContent = 'Скопировано ✓';
      window.setTimeout(() => { challengeShare.innerHTML = old; }, 1700);
    }
  } catch (_) {}
});
