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


// ===== QUIZ ROULETTE v5 =====
const challengeTasks = [
  { title: 'Сколько колёс у обычного мотоцикла?', description: 'Впиши число или слово.', category: 'MOTO', difficulty: 'ЛЕГКО', time: '20 СЕК', question: true, answers: ['2', 'два', '2 колеса', 'два колеса'] },
  { title: 'Как называется защитный головной убор мотоциклиста?', description: 'Главная защита головы во время поездки.', category: 'SAFETY', difficulty: 'ЛЕГКО', time: '20 СЕК', question: true, answers: ['шлем', 'мотошлем', 'мото шлем'] },
  { title: 'Какая марка выпускает модель KX85?', description: 'Подсказка: эта модель уже встречается на сайте Самуила.', category: 'SAMUIL', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['kawasaki', 'кавасаки'] },
  { title: 'На какой платформе находится основной видеоканал Самуила?', description: 'Впиши название видеоплатформы.', category: 'SAMUIL', difficulty: 'ЛЕГКО', time: '20 СЕК', question: true, answers: ['youtube', 'ютуб', 'you tube'] },
  { title: 'Как одним словом называют езду по бездорожью?', description: 'Подойдёт русское или английское написание.', category: 'MOTO', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['оффроуд', 'офф роуд', 'offroad', 'off road', 'off-road'] },
  { title: 'Какая модель Toyota упоминается на сайте Самуила?', description: 'Она встречается в авто-контенте.', category: 'SAMUIL', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['altezza', 'toyota altezza', 'альтезза', 'тойота альтезза', 'алтецца', 'тойота алтецца'] },
  { title: 'Какой сигнал светофора означает «стоп»?', description: 'Впиши цвет.', category: 'ROAD', difficulty: 'ЛЕГКО', time: '15 СЕК', question: true, answers: ['красный', 'красный свет'] },
  { title: 'Сколько секунд в одной минуте?', description: 'Можно ответить числом или словом.', category: 'SPEED', difficulty: 'ЛЕГКО', time: '15 СЕК', question: true, answers: ['60', 'шестьдесят', '60 секунд', 'шестьдесят секунд'] },
  { title: 'Сколько колёс у обычного легкового автомобиля?', description: 'Не считаем запасное колесо.', category: 'AUTO', difficulty: 'ЛЕГКО', time: '15 СЕК', question: true, answers: ['4', 'четыре', '4 колеса', 'четыре колеса'] },
  { title: 'Какого цвета обычно стоп-сигналы автомобиля?', description: 'Впиши цвет.', category: 'AUTO', difficulty: 'ЛЕГКО', time: '15 СЕК', question: true, answers: ['красный', 'красные', 'красного цвета', 'красный цвет'] },
  { title: 'Сколько минут в одном часе?', description: 'Можно ответить числом или словом.', category: 'SPEED', difficulty: 'ЛЕГКО', time: '15 СЕК', question: true, answers: ['60', 'шестьдесят', '60 минут', 'шестьдесят минут'] },
  { title: 'Как называется прозрачная часть шлема перед глазами?', description: 'Она защищает лицо от ветра, пыли и насекомых.', category: 'MOTO', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['визор', 'визир', 'стекло', 'стекло шлема'] },
  { title: 'Что измеряет спидометр?', description: 'Ответь одним словом.', category: 'AUTO', difficulty: 'ЛЕГКО', time: '20 СЕК', question: true, answers: ['скорость', 'скорость движения'] },
  { title: 'Что измеряет тахометр?', description: 'Подсказка: показатель обычно связан с RPM.', category: 'TECH', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['обороты', 'обороты двигателя', 'частоту вращения', 'частота вращения', 'rpm', 'об/мин', 'обороты в минуту'] },
  { title: 'Как расшифровывается ABS по смыслу?', description: 'Назови систему, которая помогает колёсам не блокироваться при торможении.', category: 'SAFETY', difficulty: 'СЛОЖНО', time: '45 СЕК', question: true, answers: ['антиблокировочная система', 'антиблокировочная система тормозов', 'антиблокировочная тормозная система', 'abs'] },
  { title: 'В каких единицах часто указывают объём двигателя мотоцикла?', description: 'Например: 85, 125 или 250 ...', category: 'TECH', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['кубические сантиметры', 'кубических сантиметрах', 'см3', 'см 3', 'cc', 'кубики', 'куб. см'] },
  { title: 'Что означает км/ч?', description: 'Расшифруй единицу измерения скорости.', category: 'ROAD', difficulty: 'ЛЕГКО', time: '20 СЕК', question: true, answers: ['километры в час', 'километр в час', 'километров в час', 'км в час'] },
  { title: 'Как называется рычаг, которым переключают передачи в механической коробке автомобиля?', description: 'Короткий ответ из двух слов подойдёт.', category: 'AUTO', difficulty: 'ЛЕГКО', time: '30 СЕК', question: true, answers: ['рычаг передач', 'рычаг переключения передач', 'ручка кпп', 'рычаг кпп', 'селектор передач'] },
  { title: 'Как называется режим P в автоматической коробке передач?', description: 'Он используется при парковке автомобиля.', category: 'AUTO', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['паркинг', 'парковка', 'parking', 'park'] },
  { title: 'Какой цвет у мотоцикла на главной фотографии сайта?', description: 'Посмотри на главный экран сайта, если нужна подсказка.', category: 'SAMUIL', difficulty: 'ЛЕГКО', time: '20 СЕК', question: true, answers: ['зеленый', 'зелёный', 'зеленого цвета', 'зелёного цвета'] },
  { title: 'Какой ник указан у Самуила в Instagram?', description: 'Можно написать с символом @ или без него.', category: 'SAMUIL', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['samuilpashyan', '@samuilpashyan'] },
  { title: 'Какое число есть в названии Kawasaki KX85?', description: 'Ответ — две цифры.', category: 'SAMUIL', difficulty: 'ЛЕГКО', time: '15 СЕК', question: true, answers: ['85', 'восемьдесят пять'] },
  { title: 'Какая марка автомобиля выпускает модель Altezza?', description: 'Эта машина упоминается в материалах на сайте.', category: 'AUTO', difficulty: 'СРЕДНЕ', time: '30 СЕК', question: true, answers: ['toyota', 'тойота'] },
  { title: 'Сколько минут длится перезарядка рулетки после двух попыток?', description: 'Подсказка есть прямо возле кнопки рулетки.', category: 'SITE', difficulty: 'ЛЕГКО', time: '15 СЕК', question: true, answers: ['5', 'пять', '5 минут', 'пять минут'] }
];

const rouletteMachine = document.getElementById('rouletteMachine');
const rouletteSpin = document.getElementById('rouletteSpin');
const rouletteSpinLabel = document.getElementById('rouletteSpinLabel');
const rouletteSpinText = document.getElementById('rouletteSpinText');
const rouletteStatus = document.getElementById('rouletteStatus');
const rouletteHint = document.getElementById('rouletteHint');
const rouletteTries = document.getElementById('rouletteTries');
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

const MAX_SPINS_PER_ROUND = 2;
const COOLDOWN_MS = 5 * 60 * 1000;
const STORAGE_KEY = 'samuil-roulette-v5-quiz';
let rouletteBusy = false;
let rouletteLastWinner = -1;
let currentTask = null;
let currentQuestionSolved = false;
let rouletteState = { spinsLeft: MAX_SPINS_PER_ROUND, cooldownEnd: 0 };

const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));

const saveRouletteState = () => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rouletteState)); } catch (_) {}
};

const loadRouletteState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Number.isFinite(saved.spinsLeft) && Number.isFinite(saved.cooldownEnd)) {
      rouletteState.spinsLeft = Math.min(MAX_SPINS_PER_ROUND, Math.max(0, saved.spinsLeft));
      rouletteState.cooldownEnd = Math.max(0, saved.cooldownEnd);
    }
  } catch (_) {}
  if (rouletteState.cooldownEnd && rouletteState.cooldownEnd <= Date.now()) {
    rouletteState = { spinsLeft: MAX_SPINS_PER_ROUND, cooldownEnd: 0 };
    saveRouletteState();
  }
};

const normalizeAnswer = value => String(value || '')
  .toLowerCase()
  .replace(/ё/g, 'е')
  .replace(/[.,!?;:()"'«»]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const formatCooldown = ms => {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const getCooldownLeft = () => Math.max(0, rouletteState.cooldownEnd - Date.now());

const setTriesText = (html, cooldown = false) => {
  if (!rouletteTries) return;
  rouletteTries.classList.toggle('is-cooldown', cooldown);
  rouletteTries.innerHTML = html;
};

const updateRouletteUI = () => {
  if (!rouletteSpin) return;

  if (rouletteState.cooldownEnd && getCooldownLeft() <= 0) {
    rouletteState = { spinsLeft: MAX_SPINS_PER_ROUND, cooldownEnd: 0 };
    saveRouletteState();
  }

  if (rouletteBusy) {
    rouletteSpin.disabled = true;
    rouletteSpin.classList.remove('is-cooldown');
    if (rouletteSpinLabel) rouletteSpinLabel.textContent = 'РУЛЕТКА';
    if (rouletteSpinText) rouletteSpinText.textContent = 'КРУТИТСЯ…';
    return;
  }

  const cooldownLeft = getCooldownLeft();
  if (cooldownLeft > 0) {
    rouletteSpin.disabled = true;
    rouletteSpin.classList.add('is-cooldown');
    if (rouletteSpinLabel) rouletteSpinLabel.textContent = 'СНОВА МОЖНО КРУТИТЬ ЧЕРЕЗ';
    if (rouletteSpinText) rouletteSpinText.textContent = formatCooldown(cooldownLeft);
    if (rouletteStatus) rouletteStatus.textContent = '2 ПОПЫТКИ ИСПОЛЬЗОВАНЫ';
    if (rouletteHint) rouletteHint.textContent = 'Идёт перерыв 5 минут. После таймера снова будут доступны 2 прокрутки.';
    setTriesText(`<span>ПЕРЕЗАРЯДКА</span><b>${formatCooldown(cooldownLeft)}</b>`, true);
    return;
  }

  rouletteSpin.disabled = false;
  rouletteSpin.classList.remove('is-cooldown');
  if (rouletteSpinLabel) rouletteSpinLabel.textContent = rouletteState.spinsLeft === 1 ? 'ПОСЛЕДНЯЯ ПОПЫТКА' : 'ДОСТУПНО 2 ПОПЫТКИ';
  if (rouletteSpinText) rouletteSpinText.textContent = 'КРУТИТЬ';
  if (rouletteHint) rouletteHint.textContent = 'Можно прокрутить 2 раза подряд. После второй попытки включится таймер на 5 минут.';
  setTriesText(`<span>ПОПЫТКИ</span><b>${rouletteState.spinsLeft} / ${MAX_SPINS_PER_ROUND}</b>`);
};

const consumeSpin = () => {
  if (rouletteState.spinsLeft <= 0) return false;
  rouletteState.spinsLeft -= 1;
  if (rouletteState.spinsLeft === 0) {
    rouletteState.cooldownEnd = Date.now() + COOLDOWN_MS;
  }
  saveRouletteState();
  return true;
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
  [0,1,2,3,4].forEach((idx, pos) => taskReel.appendChild(createTaskReelItem(challengeTasks[idx], idx, pos === 2 ? 'is-center' : '')));
  taskReel.style.transition = 'none';
  taskReel.style.transform = 'translateY(0)';
};

const resetAnswerBox = () => {
  if (taskAnswerInput) {
    taskAnswerInput.value = '';
    taskAnswerInput.classList.remove('is-correct', 'is-wrong');
  }
  if (taskAnswerFeedback) {
    taskAnswerFeedback.textContent = '';
    taskAnswerFeedback.className = 'task-answer-feedback';
  }
};

const showWinner = index => {
  const task = challengeTasks[index];
  currentTask = task;
  currentQuestionSolved = false;
  rouletteLastWinner = index;

  if (taskResultNumber) taskResultNumber.textContent = String(index + 1).padStart(2, '0');
  if (taskResultCategory) taskResultCategory.textContent = task.category;
  if (rouletteResultTitle) rouletteResultTitle.textContent = task.title;
  if (taskResultDescription) taskResultDescription.textContent = task.description;
  if (taskResultDifficulty) taskResultDifficulty.textContent = task.difficulty;
  if (taskResultTime) taskResultTime.textContent = task.time;

  resetAnswerBox();
  if (taskAnswerBox) {
    taskAnswerBox.hidden = false;
    taskAnswerBox.classList.add('is-question-visible');
  }

  if (rouletteResult) {
    rouletteResult.classList.add('is-visible');
    rouletteResult.setAttribute('aria-hidden', 'false');
  }
  if (rouletteSelectedNote) rouletteSelectedNote.hidden = false;

  if (rouletteStatus) rouletteStatus.textContent = 'ВОПРОС ВЫБРАН';
  if (taskAnswerInput) {
    window.setTimeout(() => taskAnswerInput.focus({ preventScroll: true }), 350);
  }
};

const launchCorrectCelebration = () => {
  document.body.classList.remove('quiz-correct-flash');
  void document.body.offsetWidth;
  document.body.classList.add('quiz-correct-flash');

  const fx = document.createElement('div');
  fx.className = 'quiz-win-fx';
  fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = `
    <div class="quiz-win-burst"></div>
    <div class="quiz-win-message">
      <small>CORRECT ANSWER</small>
      <strong>BOOST!</strong>
      <span>🏍️</span>
    </div>
    <div class="quiz-bike-fly">🏍️</div>
  `;

  const confetti = document.createElement('div');
  confetti.className = 'quiz-confetti';
  for (let i = 0; i < 42; i += 1) {
    const piece = document.createElement('i');
    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--delay', `${Math.random() * 0.35}s`);
    piece.style.setProperty('--drift', `${-90 + Math.random() * 180}px`);
    piece.style.setProperty('--spin', `${360 + Math.random() * 900}deg`);
    piece.style.setProperty('--size', `${5 + Math.random() * 7}px`);
    confetti.appendChild(piece);
  }
  fx.appendChild(confetti);
  document.body.appendChild(fx);
  requestAnimationFrame(() => fx.classList.add('is-active'));

  window.setTimeout(() => document.body.classList.remove('quiz-correct-flash'), 900);
  window.setTimeout(() => fx.remove(), 2800);
};

const checkAnswer = () => {
  if (!currentTask || !taskAnswerInput || !taskAnswerFeedback) return;
  const given = normalizeAnswer(taskAnswerInput.value);
  if (!given) {
    taskAnswerFeedback.textContent = 'СНАЧАЛА ВПИШИ ОТВЕТ';
    taskAnswerFeedback.className = 'task-answer-feedback is-neutral';
    return;
  }
  const correct = currentTask.answers.some(answer => normalizeAnswer(answer) === given);
  taskAnswerFeedback.textContent = correct ? '✓ ОТВЕТ ВЕРНЫЙ — BOOST!' : '✕ ОТВЕТ НЕВЕРНЫЙ — ПОПРОБУЙ ЕЩЁ';
  taskAnswerFeedback.className = `task-answer-feedback ${correct ? 'is-correct' : 'is-wrong'}`;

  if (correct) {
    taskAnswerInput.classList.remove('is-wrong');
    taskAnswerInput.classList.add('is-correct');
    if (!currentQuestionSolved) {
      currentQuestionSolved = true;
      launchCorrectCelebration();
    }
  } else {
    taskAnswerInput.classList.remove('is-correct');
    taskAnswerInput.classList.add('is-wrong');
    taskAnswerBox?.classList.remove('answer-shake');
    void taskAnswerBox?.offsetWidth;
    taskAnswerBox?.classList.add('answer-shake');
    window.setTimeout(() => taskAnswerBox?.classList.remove('answer-shake'), 450);
  }
};

const buildSequence = winner => {
  const sequence = [];
  for (let i = 0; i < 34; i += 1) {
    let idx = Math.floor(Math.random() * challengeTasks.length);
    if (sequence.length && idx === sequence.at(-1)) idx = (idx + 1) % challengeTasks.length;
    sequence.push(idx);
  }
  sequence.push(winner);
  return sequence;
};

const spinRoulette = async () => {
  if (rouletteBusy || !taskReel || !rouletteSpin) return;
  if (getCooldownLeft() > 0 || rouletteState.spinsLeft <= 0) {
    updateRouletteUI();
    return;
  }
  if (!consumeSpin()) return;

  rouletteBusy = true;
  updateRouletteUI();
  rouletteMachine?.classList.add('is-spinning');
  rouletteResult?.classList.remove('is-visible');
  rouletteResult?.setAttribute('aria-hidden', 'true');
  if (rouletteSelectedNote) rouletteSelectedNote.hidden = true;
  if (taskAnswerBox) taskAnswerBox.hidden = true;
  resetAnswerBox();
  if (rouletteStatus) rouletteStatus.textContent = 'ВОПРОСЫ ПРОКРУЧИВАЮТСЯ…';

  let winner = Math.floor(Math.random() * challengeTasks.length);
  if (challengeTasks.length > 1 && winner === rouletteLastWinner) winner = (winner + 1) % challengeTasks.length;

  const sequence = buildSequence(winner);
  taskReel.innerHTML = '';
  sequence.forEach((idx, pos) => taskReel.appendChild(createTaskReelItem(challengeTasks[idx], idx, pos === sequence.length - 1 ? 'is-winner' : '')));

  const itemHeight = window.innerWidth <= 620 ? 104 : 118;
  const targetY = -((sequence.length - 1) * itemHeight) + itemHeight;
  taskReel.style.transition = 'none';
  taskReel.style.transform = 'translateY(0)';
  void taskReel.offsetHeight;
  taskReel.style.transition = 'transform 3.8s cubic-bezier(.08,.68,.08,1)';
  requestAnimationFrame(() => { taskReel.style.transform = `translateY(${targetY}px)`; });

  await wait(3900);
  rouletteMachine?.classList.remove('is-spinning');
  rouletteBusy = false;
  showWinner(winner);
  updateRouletteUI();
};

loadRouletteState();
renderIdleReel();
updateRouletteUI();
window.setInterval(updateRouletteUI, 250);
rouletteSpin?.addEventListener('click', spinRoulette);
taskAnswerCheck?.addEventListener('click', checkAnswer);
taskAnswerInput?.addEventListener('keydown', event => {
  if (event.key === 'Enter') checkAnswer();
});

challengeShare?.addEventListener('click', async () => {
  if (!currentTask) return;
  const text = `Мне выпал вопрос на сайте Samuil Pashyan: «${currentTask.title}»`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Samuil Quiz Roulette', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      const old = challengeShare.innerHTML;
      challengeShare.textContent = 'Скопировано ✓';
      window.setTimeout(() => { challengeShare.innerHTML = old; }, 1700);
    }
  } catch (_) {}
});
