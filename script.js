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


// ===== TEXT TASK ROULETTE =====
const challengeTasks = [
  { title: 'Назови 7 марок мотоциклов за 15 секунд', description: 'Включи таймер. Повторять одну и ту же марку нельзя.', category: 'SPEED', difficulty: 'СРЕДНЕ', time: '15 СЕК' },
  { title: 'Придумай название для своего мотопроекта', description: 'Короткое, запоминающееся и такое, чтобы его хотелось увидеть на наклейке.', category: 'IDEA', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Нарисуй мотоцикл мечты за 3 минуты', description: 'Не важен талант художника — добавь цвет, номер и одну необычную деталь.', category: 'DRAW', difficulty: 'СРЕДНЕ', time: '3 МИН' },
  { title: 'Сделай 15 приседаний', description: 'Небольшой безопасный физический челлендж. Делай в комфортном темпе.', category: 'ACTIVE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Выбери только одно: эндуро, супермото или спортбайк', description: 'Выбери один вариант и объясни свой выбор одним предложением.', category: 'CHOICE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Придумай номер для гоночного мотоцикла', description: 'Выбери число от 1 до 999 и придумай, почему именно оно.', category: 'STYLE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Назови 5 деталей мотоцикла за 10 секунд', description: 'Например: руль, цепь, колесо — но твои ответы должны быть другими.', category: 'SPEED', difficulty: 'СРЕДНЕ', time: '10 СЕК' },
  { title: 'Сделай самое серьёзное байкерское фото', description: 'Можно рядом с велосипедом, самокатом, машиной или мотоциклом. Техника должна стоять.', category: 'PHOTO', difficulty: 'ЛЕГКО', time: '5 МИН' },
  { title: 'Придумай смешной штраф за проигрыш в челлендже', description: 'Только безопасный и добрый вариант — без боли, унижения и риска.', category: 'FUN', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Составь топ-3 транспорта мечты', description: 'Любые три варианта: мотоциклы, машины, квадроциклы или что-то ещё.', category: 'GARAGE', difficulty: 'ЛЕГКО', time: '3 МИН' },
  { title: 'Придумай идеальную раскраску для байка', description: 'Назови основной цвет, второй цвет и одну деталь, которая будет выделяться.', category: 'DESIGN', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Стой в планке 20 секунд', description: 'Только если тебе комфортно. Если нет — замени на 10 спокойных приседаний.', category: 'ACTIVE', difficulty: 'СРЕДНЕ', time: '20 СЕК' },
  { title: 'Придумай слоган из четырёх слов', description: 'Он должен звучать как слоган для команды, гаража или мотоклуба.', category: 'WORDS', difficulty: 'СРЕДНЕ', time: '2 МИН' },
  { title: 'Назови 5 вещей, которые берут в поездку', description: 'Подумай о полезных и безопасных вещах, которые пригодятся в дороге.', category: 'TRIP', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Изобрази звук двигателя без слов', description: 'У тебя есть 10 секунд. Чем смешнее получится — тем лучше.', category: 'FUN', difficulty: 'ЛЕГКО', time: '10 СЕК' },
  { title: 'Придумай название для нового гаража', description: 'Оно должно хорошо смотреться на вывеске или логотипе.', category: 'IDEA', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Выбери цвет байка навсегда', description: 'Можно выбрать только один цвет. Объясни, почему именно он.', category: 'CHOICE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Сделай 10 отжиманий от стены', description: 'Лёгкий вариант задания. Двигайся спокойно и остановись, если некомфортно.', category: 'ACTIVE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Придумай самый странный аксессуар для мотоцикла', description: 'Он может быть абсолютно бесполезным — главное, чтобы идея была смешной.', category: 'FUN', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Угадай цену мотоцикла мечты', description: 'Сначала назови цену наугад, а потом можешь проверить, насколько близко попал.', category: 'GUESS', difficulty: 'СРЕДНЕ', time: '2 МИН' },
  { title: 'Назови 3 правила хорошей поездки', description: 'Сформулируй три коротких правила про безопасность, подготовку и уважение к другим.', category: 'ROAD', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Придумай необычный номерной знак', description: 'До 8 символов. Он должен быть связан с техникой или твоим ником.', category: 'STYLE', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Сделай фото одной детали техники крупным планом', description: 'Найди интересную форму или фактуру. Транспорт должен стоять и быть безопасно припаркован.', category: 'PHOTO', difficulty: 'ЛЕГКО', time: '5 МИН' },
  { title: 'Придумай задание для следующего игрока', description: 'Оно должно быть коротким, безопасным и выполнимым почти где угодно.', category: 'BOSS', difficulty: 'СРЕДНЕ', time: '3 МИН' }
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
const taskReel = document.getElementById('taskReel');
const challengeShare = document.getElementById('challengeShare');

let rouletteBusy = false;
let rouletteLastWinner = -1;
let currentTask = null;

const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

const createTaskReelItem = (task, index, extraClass = '') => {
  const item = document.createElement('div');
  item.className = `task-reel-item ${extraClass}`.trim();
  item.innerHTML = `
    <span class="task-reel-number">${String(index + 1).padStart(2, '0')}</span>
    <span class="task-reel-category">${task.category}</span>
    <strong>${task.title}</strong>
  `;
  return item;
};

const renderIdleReel = () => {
  if (!taskReel) return;
  taskReel.innerHTML = '';
  const preview = [0, 1, 2, 3, 4].map(i => i % challengeTasks.length);
  preview.forEach((idx, pos) => taskReel.appendChild(createTaskReelItem(challengeTasks[idx], idx, pos === 2 ? 'is-center' : '')));
  taskReel.style.transition = 'none';
  taskReel.style.transform = 'translateY(0)';
};

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

const buildSpinSequence = winner => {
  const sequence = [];
  const count = 38;
  for (let i = 0; i < count - 1; i += 1) {
    let idx = Math.floor(Math.random() * challengeTasks.length);
    if (sequence.length && idx === sequence[sequence.length - 1]) idx = (idx + 1) % challengeTasks.length;
    sequence.push(idx);
  }
  sequence.push(winner);
  return sequence;
};

const spinChallengeRoulette = async () => {
  if (rouletteBusy || !taskReel || !rouletteSpin) return;
  rouletteBusy = true;
  rouletteSpin.disabled = true;
  rouletteMachine?.classList.add('is-spinning');
  rouletteResult?.classList.remove('is-visible');
  rouletteResult?.setAttribute('aria-hidden', 'true');
  if (rouletteStatus) rouletteStatus.textContent = 'ЗАДАНИЯ ПРОКРУЧИВАЮТСЯ…';

  let winner = Math.floor(Math.random() * challengeTasks.length);
  if (challengeTasks.length > 1 && winner === rouletteLastWinner) {
    winner = (winner + 1 + Math.floor(Math.random() * (challengeTasks.length - 1))) % challengeTasks.length;
  }

  const sequence = buildSpinSequence(winner);
  taskReel.innerHTML = '';
  sequence.forEach((idx, pos) => {
    const cls = pos === sequence.length - 1 ? 'is-winner' : '';
    taskReel.appendChild(createTaskReelItem(challengeTasks[idx], idx, cls));
  });

  const itemHeight = window.innerWidth <= 620 ? 104 : 118;
  const visibleCenterIndex = sequence.length - 1;
  const viewportCenterOffset = itemHeight;
  const targetY = -(visibleCenterIndex * itemHeight) + viewportCenterOffset;

  taskReel.style.transition = 'none';
  taskReel.style.transform = 'translateY(0)';
  void taskReel.offsetHeight;
  taskReel.style.transition = 'transform 4.2s cubic-bezier(.08,.68,.08,1)';
  requestAnimationFrame(() => {
    taskReel.style.transform = `translateY(${targetY}px)`;
  });

  await wait(4300);
  rouletteMachine?.classList.remove('is-spinning');
  if (rouletteStatus) rouletteStatus.textContent = 'ЗАДАНИЕ ВЫБРАНО';
  rouletteSpin.disabled = false;
  rouletteBusy = false;
  showChallengeWinner(winner);
};

renderIdleReel();
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
      await navigator.share({ title: 'Samuil Task Roulette', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      const old = challengeShare.innerHTML;
      challengeShare.textContent = 'Скопировано ✓';
      window.setTimeout(() => { challengeShare.innerHTML = old; }, 1700);
    }
  } catch (_) {}
});

