let TASK = null;
let GOALS = [];
let CONFIG = null;
let roundsCompleted = 0;
let timerInterval = null;
let secondsLeft = 5 * 60;

function params() {
  return new URLSearchParams(window.location.search);
}

function content() {
  return document.getElementById('content');
}

async function loadData() {
  const [goalsData, configData] = await Promise.all([
    window.Store.readData('data/goals.json'),
    window.Store.readData('data/config.json'),
  ]);
  GOALS = goalsData.goals;
  CONFIG = configData;
}

function renderTaskPicker() {
  const tasks = GOALS.filter((g) => g.level === 'day' && g.status !== 'done');
  const c = content();
  c.innerHTML = '<p class="text-dim">Pick a task to start, or open one from the Tracker.</p>';
  if (tasks.length === 0) {
    c.innerHTML += '<p class="empty-state">No tasks yet — add one in the Tracker first.</p>';
    return;
  }
  tasks.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>${t.title}</strong><div class="text-small text-dim">${t.period}</div>`;
    const btn = document.createElement('a');
    btn.className = 'btn';
    btn.href = `ritual.html?taskId=${encodeURIComponent(t.id)}`;
    btn.textContent = 'Start this';
    btn.style.marginTop = '8px';
    btn.style.display = 'inline-block';
    card.appendChild(document.createElement('br'));
    card.appendChild(btn);
    c.appendChild(card);
  });
}

function renderChecklistStep() {
  const checklist = CONFIG.checklists[TASK.checklistId] || CONFIG.checklists.default;
  const c = content();
  c.innerHTML = `<div class="card"><strong>${TASK.title}</strong>
    <p class="text-dim text-small">Clear these first — this is the whole point, lower the friction before you even see the task.</p>
    <div id="checklist"></div>
    <button id="continueBtn" class="btn" disabled style="margin-top:12px">Continue</button>
  </div>`;
  const list = document.getElementById('checklist');
  checklist.items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'checklist-item';
    row.innerHTML = `<input type="checkbox" id="chk${i}"> <label for="chk${i}" style="margin:0">${item}</label>`;
    list.appendChild(row);
  });
  const checkboxes = list.querySelectorAll('input[type="checkbox"]');
  const continueBtn = document.getElementById('continueBtn');
  checkboxes.forEach((cb) => cb.addEventListener('change', () => {
    continueBtn.disabled = !Array.from(checkboxes).every((x) => x.checked);
  }));
  continueBtn.addEventListener('click', renderFirstStepStep);
}

function renderFirstStepStep() {
  const c = content();
  c.innerHTML = `
    <div class="first-step card">${TASK.firstStep}</div>
    <div style="text-align:center"><button id="goBtn" class="btn">I'm starting — begin 5 min</button></div>
  `;
  document.getElementById('goBtn').addEventListener('click', startTimer);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function startTimer() {
  secondsLeft = 5 * 60;
  const c = content();
  c.innerHTML = `
    <div class="card">
      <div class="timer-display" id="timerDisplay">${formatTime(secondsLeft)}</div>
      <p class="text-dim text-small" style="text-align:center">Just this. Five minutes. That's the whole deal.</p>
    </div>
  `;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsLeft -= 1;
    document.getElementById('timerDisplay').textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) {
      clearInterval(timerInterval);
      roundsCompleted += 1;
      renderRoundDoneStep();
    }
  }, 1000);
}

function renderRoundDoneStep() {
  const c = content();
  c.innerHTML = `
    <div class="card" style="text-align:center">
      <h2>5 minutes done.</h2>
      <p class="text-dim">You're in it now — most of the fight was starting. Keep going or stop here, both count.</p>
      <button id="moreBtn" class="btn btn-secondary">+5 more minutes</button>
      <button id="finishBtn" class="btn">Log session & finish</button>
    </div>
  `;
  document.getElementById('moreBtn').addEventListener('click', startTimer);
  document.getElementById('finishBtn').addEventListener('click', finishSession);
}

async function finishSession() {
  const totalMinutes = roundsCompleted * 5;
  const c = content();
  if (!window.Auth.hasToken()) {
    c.innerHTML = `
      <div class="card">
        <p>Nice work — ${totalMinutes} minutes done. This browser has no edit token set, so it can't be saved yet.</p>
        <a class="btn" href="settings.html">Add a token in Settings</a>
      </div>`;
    return;
  }
  c.innerHTML = '<p>Saving…</p>';
  try {
    const [logsData] = await Promise.all([window.Store.readData('data/logs.json')]);
    const session = {
      id: `s_${Date.now()}`,
      taskId: TASK.id,
      date: window.DateUtils.todayISO(),
      startedAt: new Date(Date.now() - totalMinutes * 60000).toISOString(),
      minutes: totalMinutes,
      type: 'ritual5min',
      rounds: roundsCompleted,
      note: '',
    };
    const updatedSessions = [...logsData.sessions, session];
    await window.Store.writeData('data/logs.json', { sessions: updatedSessions }, `Ritual session: ${totalMinutes}m on ${TASK.title}`);

    if (TASK.status === 'not_started') {
      const updatedGoals = GOALS.map((g) => (g.id === TASK.id ? { ...g, status: 'in_progress' } : g));
      await window.Store.writeData('data/goals.json', { goals: updatedGoals }, `Mark in progress: ${TASK.title}`);
    }

    c.innerHTML = `
      <div class="card" style="text-align:center">
        <h2>Logged.</h2>
        <p>${totalMinutes} minutes on "${TASK.title}".</p>
        <a class="btn" href="tracker.html">Back to Tracker</a>
        <a class="btn btn-secondary" href="log.html">See your log</a>
      </div>`;
  } catch (err) {
    c.innerHTML = `<p>Couldn't save: ${err.message}</p>`;
  }
}

async function init() {
  window.Auth.applyReadOnlyState();
  try {
    await loadData();
  } catch (err) {
    content().textContent = `Failed to load data: ${err.message}`;
    return;
  }
  const taskId = params().get('taskId');
  if (!taskId) {
    renderTaskPicker();
    return;
  }
  TASK = GOALS.find((g) => g.id === taskId && g.level === 'day');
  if (!TASK) {
    content().innerHTML = '<p class="empty-state">Task not found.</p>';
    return;
  }
  renderChecklistStep();
}

init();
