// script.js
// Загружает конфиг и запускает логику тренажёра.

let config = {
  totalToSolve: 10,
  finalCode: "CODE",
  numbers: [2,3,4,5,6,7]
};

const elements = {
  example: document.getElementById('example'),
  answer: document.getElementById('answer'),
  currentErrors: document.getElementById('currentErrors'),
  totalErrors: document.getElementById('totalErrors'),
  solvedCount: document.getElementById('solvedCount'),
  solvedList: document.getElementById('solvedList'),
  checkBtn: document.getElementById('checkBtn'),
  finalCodeArea: document.getElementById('finalCodeArea'),
  finalCode: document.getElementById('finalCode')
};

let state = {
  current: null, // {a, b, correct}
  currentErrors: 0,
  totalErrors: 0,
  solved: [] // {a,b,answer,errors}
};

function fetchConfig() {
  return fetch('config.json', {cache: "no-store"})
    .then(resp => {
      if (!resp.ok) throw new Error('Не удалось загрузить config.json');
      return resp.json();
    })
    .catch(() => {
      // если не удалось загрузить, используем встроенный config (см. выше)
      console.warn('Используется встроенный config.');
      return config;
    });
}

function pickExample() {
  const numbers = Array.isArray(config.numbers) && config.numbers.length ? config.numbers : [2,3,4,5,6,7];
  const multiplier = numbers[Math.floor(Math.random() * numbers.length)];
  const other = Math.floor(Math.random() * 10) + 1; // 1..10
  const a = other;
  const b = multiplier;
  return {a, b, correct: a * b};
}

function renderExample() {
  state.current = pickExample();
  state.currentErrors = 0;
  elements.currentErrors.textContent = state.currentErrors;
  elements.example.textContent = `${state.current.a} × ${state.current.b} =`;
  elements.answer.value = '';
  elements.answer.focus();
}

function renderStats() {
  elements.totalErrors.textContent = state.totalErrors;
  elements.solvedCount.textContent = state.solved.length;
  elements.currentErrors.textContent = state.currentErrors;
}

function onCorrect() {
  // добавить в список решённых
  const item = {
    a: state.current.a,
    b: state.current.b,
    answer: state.current.correct,
    errors: state.currentErrors
  };
  state.solved.push(item);
  const li = document.createElement('li');
  li.textContent = `${item.a} × ${item.b} = ${item.answer}`;
  const meta = document.createElement('span');
  meta.textContent = `Помилок: ${item.errors}`;
  li.appendChild(meta);
  elements.solvedList.prepend(li);
  renderStats();

  // если достигли цели — показать код
  if (state.solved.length >= config.totalToSolve) {
    showFinalCode();
  } else {
    // новая задача
    setTimeout(renderExample, 250);
  }
}

function showFinalCode() {
  elements.finalCode.textContent = config.finalCode;
  elements.finalCodeArea.hidden = false;
}

function checkAnswer() {
  const raw = elements.answer.value.trim();
  if (raw === '') {
    // пустой ввод — считаем как ошибка, но не забудем подсказать
    state.currentErrors += 1;
    state.totalErrors += 1;
    renderStats();
    alert('Пожалуйста, введите число. Пустой ответ засчитывается как помилка.');
    return;
  }

  // допустимы только целые (пользователь вводит число)
  const user = Number(raw);
  if (!Number.isFinite(user)) {
    state.currentErrors += 1;
    state.totalErrors += 1;
    renderStats();
    alert('Ввод должен быть числом.');
    return;
  }

  if (user === state.current.correct) {
    onCorrect();
  } else {
    state.currentErrors += 1;
    state.totalErrors += 1;
    renderStats();
    // краткая подсказка (не показывает ответ)
    alert('Неправильно. Спробуйте ще раз.');
    elements.answer.focus();
  }
}

// Инициализация
fetchConfig().then(cfg => {
  config = Object.assign({}, config, cfg);
  // валидация простая
  if (!Array.isArray(config.numbers) || config.numbers.length === 0) {
    config.numbers = [2,3,4,5,6,7];
  }
  if (typeof config.totalToSolve !== 'number' || config.totalToSolve < 1) {
    config.totalToSolve = 10;
  }
  if (typeof config.finalCode !== 'string') {
    config.finalCode = String(config.finalCode || 'CODE');
  }

  // события
  elements.checkBtn.addEventListener('click', checkAnswer);
  elements.answer.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  });

  // старт
  renderStats();
  renderExample();
});
