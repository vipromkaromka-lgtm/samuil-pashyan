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
  { title: 'Вопрос: сколько колёс у обычного мотоцикла?', description: 'Впиши ответ числом или словом и нажми «Проверить».', category: 'QUIZ', difficulty: 'ЛЕГКО', time: '30 СЕК', question: true, answers: ['2', 'два', '2 колеса', 'два колеса'] },
  { title: 'Придумай номер для гоночного мотоцикла', description: 'Выбери число от 1 до 999 и придумай, почему именно оно.', category: 'STYLE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Вопрос: как называется защитный головной убор мотоциклиста?', description: 'Впиши название основной защиты головы.', category: 'QUIZ', difficulty: 'ЛЕГКО', time: '30 СЕК', question: true, answers: ['шлем', 'мотошлем', 'мото шлем'] },
  { title: 'Сделай самое серьёзное байкерское фото', description: 'Можно рядом с велосипедом, самокатом, машиной или мотоциклом. Техника должна стоять.', category: 'PHOTO', difficulty: 'ЛЕГКО', time: '5 МИН' },
  { title: 'Придумай смешной штраф за проигрыш в челлендже', description: 'Только безопасный и добрый вариант — без боли, унижения и риска.', category: 'FUN', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Вопрос: какая марка выпускает модель KX85?', description: 'Подсказка: эта модель уже упоминается на сайте Самуила.', category: 'QUIZ', difficulty: 'СРЕДНЕ', time: '45 СЕК', question: true, answers: ['kawasaki', 'кавасаки', 'кавасаки kawasaki'] },
  { title: 'Придумай идеальную раскраску для байка', description: 'Назови основной цвет, второй цвет и одну деталь, которая будет выделяться.', category: 'DESIGN', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Стой в планке 20 секунд', description: 'Только если тебе комфортно. Если нет — замени на 10 спокойных приседаний.', category: 'ACTIVE', difficulty: 'СРЕДНЕ', time: '20 СЕК' },
  { title: 'Вопрос: на какой платформе основной видеоканал Самуила?', description: 'Впиши название видеоплатформы.', category: 'QUIZ', difficulty: 'ЛЕГКО', time: '30 СЕК', question: true, answers: ['youtube', 'ютуб', 'you tube'] },
  { title: 'Назови 5 вещей, которые берут в поездку', description: 'Подумай о полезных и безопасных вещах, которые пригодятся в дороге.', category: 'TRIP', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Изобрази звук двигателя без слов', description: 'У тебя есть 10 секунд. Чем смешнее получится — тем лучше.', category: 'FUN', difficulty: 'ЛЕГКО', time: '10 СЕК' },
  { title: 'Вопрос: как называется езда по бездорожью?', description: 'Подойдёт русское или английское написание этого слова.', category: 'QUIZ', difficulty: 'СРЕДНЕ', time: '45 СЕК', question: true, answers: ['оффроуд', 'офф роуд', 'offroad', 'off road', 'off-road'] },
  { title: 'Выбери цвет байка навсегда', description: 'Можно выбрать только один цвет. Объясни, почему именно он.', category: 'CHOICE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Сделай 10 отжиманий от стены', description: 'Лёгкий вариант задания. Двигайся спокойно и остановись, если некомфортно.', category: 'ACTIVE', difficulty: 'ЛЕГКО', time: '1 МИН' },
  { title: 'Вопрос: какая модель Toyota упоминается на этом сайте?', description: 'Впиши название модели, которая появлялась в авто-контенте Самуила.', category: 'QUIZ', difficulty: 'СРЕДНЕ', time: '45 СЕК', question: true, answers: ['altezza', 'toyota altezza', 'альтезза', 'тойота альтезза', 'алтецца', 'тойота алтецца'] },
  { title: 'Вопрос: какой сигнал светофора означает «стоп»?', description: 'Впиши цвет сигнала.', category: 'QUIZ', difficulty: 'ЛЕГКО', time: '30 СЕК', question: true, answers: ['красный', 'красный свет'] },
  { title: 'Назови 3 правила хорошей поездки', description: 'Сформулируй три коротких правила про безопасность, подготовку и уважение к другим.', category: 'ROAD', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Придумай необычный номерной знак', description: 'До 8 символов. Он должен быть связан с техникой или твоим ником.', category: 'STYLE', difficulty: 'ЛЕГКО', time: '2 МИН' },
  { title: 'Вопрос: сколько секунд в одной минуте?', description: 'Впиши число или слово.', category: 'QUIZ', difficulty: 'ЛЕГКО', time: '30 СЕК', question: true, answers: ['60', 'шестьдесят', '60 секунд', 'шестьдесят секунд'] },
  { title: 'Придумай задание для следующего игрока', description: 'Оно должно быть коротким, безопасным и выполнимым почти где угодно.', category: 'BOSS', difficulty: 'СРЕДНЕ', time: '3 МИН' }
];

const rouletteMachine = document.getElementById('rouletteMachine');
const rouletteSpin = document.getElementById('rouletteSpin');
const rouletteSpinLabel = document.getElementById('rouletteSpinLabel');
const rouletteSpinText = document.getElementById('rouletteSpinText');
const rouletteStatus = document.getElementById('rouletteStatus');
const rouletteHint = document.getElementById('rouletteHint');
const rouletteResult = document.getElementById('rouletteResult');
const rouletteSelectedNote = document.getElementById('rouletteSelectedNote');
const rouletteResultTitle = document.getElementById('rouletteResultTitle');
const taskResultDescription = document.getElementById('taskResultDescription');
const taskResultNumber = document.getElementById('taskResultNumber');
const taskResultCategory = document.getElementById('taskResultCategory');
const taskResultDifficulty = document.getElementById('taskResultDifficulty');
const taskResultTime = document.getElementById('taskResultTime');
const taskReel = document.getElementById('taskReel');
const challengeShare = document.getElementById('challengeShare');
const taskAnswerBox = document.getElementById('taskAnswerBox');
const taskAnswerInput = document.getElementById('taskAnswerInput');
const taskAnswerCheck = document.getElementById('taskAnswerCheck');
const taskAnswerFeedback = document.getElementById('taskAnswerFeedback');

const ROULETTE_MAX_SPINS = 2;
const ROULETTE_COOLDOWN_MS = 5 * 60 * 1000;
const ROULETTE_STORAGE_KEY = 'samuil-task-roulette-v3';

let rouletteBusy = false;
let rouletteLastWinner = -1;
let currentTask = null;
let rouletteTimerId = null;
let rouletteState = { spinsUsed: 0, cooldownEnd: 0 };

const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

const loadRouletteState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(ROULETTE_STORAGE_KEY) || 'null');
    if (saved && Number.isFinite(saved.spinsUsed) && Number.isFinite(saved.cooldownEnd)) {
      rouletteState = { spinsUsed: Math.max(0, saved.spinsUsed), cooldownEnd: Math.max(0, saved.cooldownEnd) };
    }
  } catch (_) {}

  if (rouletteState.cooldownEnd && rouletteState.cooldownEnd <= Date.now()) {
    rouletteState = { spinsUsed: 0, cooldownEnd: 0 };
    saveRouletteState();
  }
};

const saveRouletteState = () => {
  try { localStorage.setItem(ROULETTE_STORAGE_KEY, JSON.stringify(rouletteState)); } catch (_) {}
};

const getCooldownLeft = () => Math.max(0, rouletteState.cooldownEnd - Date.now());

const formatCooldown = ms => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const refreshRouletteButton = () => {
  if (!rouletteSpin) return;
  const cooldownLeft = getCooldownLeft();

  if (cooldownLeft <= 0 && rouletteState.cooldownEnd) {
    rouletteState = { spinsUsed: 0, cooldownEnd: 0 };
    saveRouletteState();
  }

  if (rouletteBusy) {
    rouletteSpin.disabled = true;
    if (rouletteSpinLabel) rouletteSpinLabel.textContent = 'РУЛЕТКА';
    if (rouletteSpinText) rouletteSpinText.textContent = 'КРУТИТСЯ…';
    return;
  }

  if (rouletteState.cooldownEnd > Date.now()) {
    const left = getCooldownLeft();
    rouletteSpin.disabled = true;
    rouletteSpin.classList.add('is-cooldown');
    if (rouletteSpinLabel) rouletteSpinLabel.textContent = 'СЛЕДУЮЩИЕ 2 ПОПЫТКИ ЧЕРЕЗ';
    if (rouletteSpinText) rouletteSpinText.textContent = formatCooldown(left);
    if (rouletteStatus) rouletteStatus.textContent = 'ЛИМИТ ИСПОЛЬЗОВАН — ПЕРЕРЫВ 5 МИНУТ';
    if (rouletteHint) rouletteHint.textContent = 'После таймера снова откроются две прокрутки. Обновление страницы таймер не сбрасывает.';
    return;
  }

  rouletteSpin.disabled = false;
  rouletteSpin.classList.remove('is-cooldown');
  const remaining = Math.max(0, ROULETTE_MAX_SPINS - rouletteState.spinsUsed);
  if (rouletteSpinLabel) rouletteSpinLabel.textContent = remaining === 1 ? 'ОСТАЛАСЬ 1 ПОПЫТКА' : 'ДОСТУПНО 2 ПОПЫТКИ';
  if (rouletteSpinText) rouletteSpinText.textContent = 'КРУТИТЬ';
  if (rouletteStatus && rouletteState.spinsUsed === 0) rouletteStatus.textContent = currentTask ? 'МОЖНО КРУТИТЬ СНОВА — 2 ПОПЫТКИ' : 'РУЛЕТКА ГОТОВА';
  if (rouletteHint) rouletteHint.textContent = 'Можно прокрутить рулетку два раза. После второй попытки включится таймер на 5 минут.';
};

const consumeRouletteSpin = () => {
  rouletteState.spinsUsed += 1;
  if (rouletteState.spinsUsed >= ROULETTE_MAX_SPINS) {
    rouletteState.spinsUsed = ROULETTE_MAX_SPINS;
    rouletteState.cooldownEnd = Date.now() + ROULETTE_COOLDOWN_MS;
  }
  saveRouletteState();
};

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

const resetAnswerBox = () => {
  if (taskAnswerInput) taskAnswerInput.value = '';
  if (taskAnswerFeedback) {
    taskAnswerFeedback.textContent = '';
    taskAnswerFeedback.className = 'task-answer-feedback';
  }
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

  resetAnswerBox();
  if (taskAnswerBox) taskAnswerBox.hidden = !task.question;
  if (task.question && taskAnswerInput) window.setTimeout(() => taskAnswerInput.focus({ preventScroll: true }), 450);

  if (rouletteResult) {
    rouletteResult.classList.add('is-visible');
    rouletteResult.setAttribute('aria-hidden', 'false');
  }
  if (rouletteSelectedNote) rouletteSelectedNote.hidden = false;
};

const normalizeAnswer = value => value
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/[.,!?;:()"'«»]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const checkCurrentAnswer = () => {
  if (!currentTask?.question || !taskAnswerInput || !taskAnswerFeedback) return;
  const given = normalizeAnswer(taskAnswerInput.value);

  if (!given) {
    taskAnswerFeedback.textContent = 'Сначала впиши ответ.';
    taskAnswerFeedback.className = 'task-answer-feedback is-neutral';
    return;
  }

  const correct = currentTask.answers.some(answer => normalizeAnswer(answer) === given);
  if (correct) {
    taskAnswerFeedback.textContent = '✓ ОТВЕТ ВЕРНЫЙ';
    taskAnswerFeedback.className = 'task-answer-feedback is-correct';
  } else {
    taskAnswerFeedback.textContent = '✕ ОТВЕТ НЕВЕРНЫЙ';
    taskAnswerFeedback.className = 'task-answer-feedback is-wrong';
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
  if (rouletteBusy || !taskReel || !rouletteSpin || getCooldownLeft() > 0) return;
  rouletteBusy = true;
  consumeRouletteSpin();
  refreshRouletteButton();
  rouletteMachine?.classList.add('is-spinning');
  rouletteResult?.classList.remove('is-visible');
  rouletteResult?.setAttribute('aria-hidden', 'true');
  if (rouletteSelectedNote) rouletteSelectedNote.hidden = true;
  if (taskAnswerBox) taskAnswerBox.hidden = true;
  resetAnswerBox();
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
  rouletteBusy = false;
  showChallengeWinner(winner);

  if (rouletteState.cooldownEnd > Date.now()) {
    if (rouletteStatus) rouletteStatus.textContent = 'ЗАДАНИЕ ВЫБРАНО — ВКЛЮЧЁН ПЕРЕРЫВ';
  } else {
    const remaining = Math.max(0, ROULETTE_MAX_SPINS - rouletteState.spinsUsed);
    if (rouletteStatus) rouletteStatus.textContent = `ЗАДАНИЕ ВЫБРАНО — ЕЩЁ ${remaining} ПРОКРУТКА`;
  }
  refreshRouletteButton();
};

loadRouletteState();
renderIdleReel();
refreshRouletteButton();
rouletteTimerId = window.setInterval(refreshRouletteButton, 500);
rouletteSpin?.addEventListener('click', spinChallengeRoulette);
taskAnswerCheck?.addEventListener('click', checkCurrentAnswer);
taskAnswerInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') checkCurrentAnswer();
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

