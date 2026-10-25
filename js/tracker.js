let GOALS = [];
let SESSIONS = [];

function fmtMinutes(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

function goalById(id) {
  return GOALS.find((g) => g.id === id);
}

function params() {
  return new URLSearchParams(window.location.search);
}

function linkTo(view, id) {
  return `tracker.html?view=${view}&id=${encodeURIComponent(id || '')}`;
}

function renderBreadcrumb(trail) {
  const el = document.getElementById('breadcrumb');
  el.innerHTML = '';
  trail.forEach((node, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = '›';
      el.appendChild(sep);
    }
    const a = document.createElement('a');
    a.href = node.href;
    a.textContent = node.label;
    el.appendChild(a);
  });
}

function progressBar(plannedMin, actualMin) {
  const pct = plannedMin > 0 ? Math.min(100, Math.round((actualMin / plannedMin) * 100)) : (actualMin > 0 ? 100 : 0);
  const over = plannedMin > 0 && actualMin >= plannedMin;
  const bar = document.createElement('div');
  bar.className = `progress-bar${over ? ' over' : ''}`;
  const span = document.createElement('span');
  span.style.width = `${pct}%`;
  bar.appendChild(span);
  return bar;
}

function nodeCard(node, childHref) {
  const roll = window.Rollup.rollupFor(node, GOALS, SESSIONS);
  const card = document.createElement('div');
  card.className = 'card';
  const title = document.createElement('a');
  title.href = childHref;
  title.innerHTML = `<strong>${node.title}</strong>`;
  card.appendChild(title);
  const meta = document.createElement('div');
  meta.className = 'text-small text-dim';
  meta.textContent = `${node.period} · planned ${fmtMinutes(roll.plannedMinutes)} · actual ${fmtMinutes(roll.actualMinutes)}`;
  card.appendChild(meta);
  card.appendChild(progressBar(roll.plannedMinutes, roll.actualMinutes));
  return card;
}

function addNodeForm(level, parentId, onAdd) {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.innerHTML = `<strong>Add ${level}</strong>`;
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Title</label>
    <input type="text" name="title" required>
    <label>Period (${level === 'month' ? 'YYYY-MM' : level === 'week' ? 'YYYY-Www' : level === 'day' ? 'YYYY-MM-DD' : 'YYYY'})</label>
    <input type="text" name="period" required>
    ${level !== 'day' ? '<label>Planned hours</label><input type="number" name="plannedHours" step="0.5" value="1">' : `
      <label>First step (the tiny literal action, not the big task)</label>
      <input type="text" name="firstStep" required>
      <label>Planned minutes</label>
      <input type="number" name="plannedMinutes" value="30">`}
    <button type="submit" class="btn" data-requires-token>Add</button>
  `;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const id = `${level[0]}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const node = {
      id, level, parentId,
      period: fd.get('period'),
      title: fd.get('title'),
    };
    if (level === 'day') {
      node.firstStep = fd.get('firstStep');
      node.checklistId = 'default';
      node.plannedMinutes = Number(fd.get('plannedMinutes')) || 0;
      node.status = 'not_started';
      node.createdAt = new Date().toISOString();
      node.completedAt = null;
    } else {
      node.plannedHours = Number(fd.get('plannedHours')) || 0;
    }
    try {
      const updated = [...GOALS, node];
      await window.Store.writeData('data/goals.json', { goals: updated }, `Add ${level}: ${node.title}`);
      onAdd();
    } catch (err) {
      alert(err.message);
    }
  });
  wrap.appendChild(form);
  return wrap;
}

async function logTimeForm(task, onLogged) {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.innerHTML = `<strong>Log time manually</strong>`;
  const form = document.createElement('form');
  form.innerHTML = `
    <label>Minutes</label>
    <input type="number" name="minutes" min="1" value="25" required>
    <label>Date</label>
    <input type="text" name="date" value="${window.DateUtils.todayISO()}" required>
    <button type="submit" class="btn" data-requires-token>Log</button>
  `;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const session = {
      id: `s_${Date.now()}`,
      taskId: task.id,
      date: fd.get('date'),
      startedAt: new Date().toISOString(),
      minutes: Number(fd.get('minutes')) || 0,
      type: 'manual',
      rounds: 1,
      note: '',
    };
    try {
      const updated = [...SESSIONS, session];
      await window.Store.writeData('data/logs.json', { sessions: updated }, `Log ${session.minutes}m on ${task.title}`);
      onLogged();
    } catch (err) {
      alert(err.message);
    }
  });
  wrap.appendChild(form);
  return wrap;
}

function renderYearList() {
  renderBreadcrumb([{ label: 'Years', href: linkTo('years') }]);
  const content = document.getElementById('content');
  content.innerHTML = '';
  const years = window.Rollup.nodesAtLevel(GOALS, 'year');
  if (years.length === 0) content.appendChild(emptyState('No years yet — add one below.'));
  years.forEach((y) => content.appendChild(nodeCard(y, linkTo('month', y.id))));
  content.appendChild(addNodeForm('year', null, () => init()));
}

function renderMonthList(yearId) {
  const year = goalById(yearId);
  renderBreadcrumb([
    { label: 'Years', href: linkTo('years') },
    { label: year ? year.title : yearId, href: linkTo('month', yearId) },
  ]);
  const content = document.getElementById('content');
  content.innerHTML = '';
  const months = window.Rollup.nodesAtLevel(GOALS, 'month', yearId);
  if (months.length === 0) content.appendChild(emptyState('No months yet — add one below.'));
  months.forEach((m) => content.appendChild(nodeCard(m, linkTo('week', m.id))));
  content.appendChild(addNodeForm('month', yearId, () => init()));
}

function renderWeekList(monthId) {
  const month = goalById(monthId);
  const year = month ? goalById(month.parentId) : null;
  renderBreadcrumb([
    { label: 'Years', href: linkTo('years') },
    { label: year ? year.title : '…', href: linkTo('month', year ? year.id : '') },
    { label: month ? month.title : monthId, href: linkTo('week', monthId) },
  ]);
  const content = document.getElementById('content');
  content.innerHTML = '';
  const weeks = window.Rollup.nodesAtLevel(GOALS, 'week', monthId);
  if (weeks.length === 0) content.appendChild(emptyState('No weeks yet — add one below.'));
  weeks.forEach((w) => content.appendChild(nodeCard(w, linkTo('day', w.id))));
  content.appendChild(addNodeForm('week', monthId, () => init()));
}

function renderDayList(weekId) {
  const week = goalById(weekId);
  const month = week ? goalById(week.parentId) : null;
  const year = month ? goalById(month.parentId) : null;
  renderBreadcrumb([
    { label: 'Years', href: linkTo('years') },
    { label: year ? year.title : '…', href: linkTo('month', year ? year.id : '') },
    { label: month ? month.title : '…', href: linkTo('week', month ? month.id : '') },
    { label: week ? week.title : weekId, href: linkTo('day', weekId) },
  ]);
  const content = document.getElementById('content');
  content.innerHTML = '';
  const tasks = window.Rollup.nodesAtLevel(GOALS, 'day', weekId);
  if (tasks.length === 0) content.appendChild(emptyState('No tasks yet — add one below.'));
  tasks.forEach((t) => {
    const actual = window.Rollup.actualMinutesForTask(t.id, SESSIONS);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="task-row">
        <div>
          <strong>${t.title}</strong>
          <div class="text-small text-dim">planned ${fmtMinutes(t.plannedMinutes || 0)} · actual ${fmtMinutes(actual)}
            · <span class="badge">${t.status}</span></div>
        </div>
        <a class="btn" href="ritual.html?taskId=${encodeURIComponent(t.id)}">Start</a>
      </div>
    `;
    content.appendChild(card);
    logTimeForm(t, () => init()).then((f) => content.appendChild(f));
  });
  content.appendChild(addNodeForm('day', weekId, () => init()));
}

function emptyState(msg) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.textContent = msg;
  return div;
}

async function init() {
  window.Auth.applyReadOnlyState();
  const content = document.getElementById('content');
  content.textContent = 'Loading…';
  try {
    const [goalsData, logsData] = await Promise.all([
      window.Store.readData('data/goals.json'),
      window.Store.readData('data/logs.json'),
    ]);
    GOALS = goalsData.goals;
    SESSIONS = logsData.sessions;
  } catch (err) {
    content.textContent = `Failed to load data: ${err.message}`;
    return;
  }

  const p = params();
  const view = p.get('view') || 'years';
  const id = p.get('id');
  if (view === 'years') renderYearList();
  else if (view === 'month') renderMonthList(id);
  else if (view === 'week') renderWeekList(id);
  else if (view === 'day') renderDayList(id);
  else renderYearList();
}

init();
