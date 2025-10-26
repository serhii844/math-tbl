let config = {
  totalToSolve: 10,
  finalCode: "CODE",
  numbers: [2, 3, 4, 5, 6, 7]
};

const elements = {
  example: document.getElementById('example'),
  answer: document.getElementById('answer'),
  errorMark: document.getElementById('errorMark'),
  currentErrors: document.getElementById('currentErrors'),
  totalErrors: document.getElementById('totalErrors'),
  solvedCount: document.getElementById('solvedCount'),
  solvedList: document.getElementById('solvedList'),
  checkBtn: document.getElementById('checkBtn'),
  finalCodeArea: document.getElementById('finalCodeArea'),
  finalCode: document.getElementById('finalCode')
};

let state = {
  current: null,
  currentErrors: 0,
  totalErrors: 0,
  solved: []
};

function fetchConfig() {
  return fetch('config.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : config)
    .catch(() => config);
}

function pickExample() {
  const nums = config.numbers.length ? config.numbers : [2, 3, 4, 5, 6, 7];
  const a = Math.floor(Math.random() * 10) + 1;
  const b = nums[Math.floor(Math.random() * nums.length)];
  return { a, b, correct: a * b };
}

function renderExample() {
  state.current = pickExample();
  state.currentErrors = 0;
  elements.currentErrors.textContent = 0;
  elements.example.textContent = `${state.current.a} × ${state.current.b} =`;
  elements.answer.value = '';
  elements.errorMark.hidden = true;
  elements.answer.focus();
}

function renderStats() {
  elements.currentErrors.textContent = state.currentErrors;
  elements.totalErrors.textContent = state.totalErrors;
  elements.solvedCount.textContent = state.solved.length;
}

function showFinalCode() {
  elements.finalCode.textContent = config.finalCode;
  elements.finalCodeArea.hidden = false;
}

function onCorrect() {
  const item = {
    a: state.current.a,
    b: state.current.b,
    answer: state.current.correct,
    errors: state.currentErrors
  };
  state.solved.push(item);

  const li = document.createElement('li');
  li.textContent = `${item.a} × ${item.b} = ${item.answer}`;
  const err = document.createElement('span');
  err.textContent = `Помилок: ${item.errors}`;
  li.appendChild(err);
  elements.solvedList.prepend(li);

  renderStats();

  if (state.solved.length >= config.totalToSolve) {
    showFinalCode();
  } else {
    renderExample();
  }
}

function checkAnswer() {
  const val = elements.answer.value.trim();
  if (!val) {
    markError();
    return;
  }
  const num = Number(val);
  if (!Number.isFinite(num)) {
    markError();
    return;
  }

  if (num === state.current.correct) {
    elements.errorMark.hidden = true;
    onCorrect();
  } else {
    markError();
  }
}

function markError() {
  state.currentErrors++;
  state.totalErrors++;
  renderStats();
  elements.errorMark.hidden = false;
  elements.answer.value = '';
  elements.answer.focus();
}

fetchConfig().then(cfg => {
  config = Object.assign({}, config, cfg);
  renderExample();
  renderStats();

  elements.checkBtn.addEventListener('click', checkAnswer);
  elements.answer.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAnswer();
  });
});
