function fmtMinutes(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function barRow(label, plannedMin, actualMin, maxMin) {
  const max = Math.max(maxMin, 1);
  const plannedPct = Math.min(100, (plannedMin / max) * 100);
  const actualPct = Math.min(100, (actualMin / max) * 100);
  const row = document.createElement('div');
  row.className = 'bar-row';
  row.innerHTML = `
    <div class="label">${label}</div>
    <div class="bar-track">
      <div class="bar-fill-planned" style="width:${plannedPct}%"></div>
    </div>
    <div class="text-dim" style="width:60px">${fmtMinutes(actualMin)}</div>
  `;
  // Overlay actual as a second track for a simple planned-vs-actual comparison.
  const track = row.querySelector('.bar-track');
  track.style.position = 'relative';
  const actualBar = document.createElement('div');
  actualBar.className = 'bar-fill-actual';
  actualBar.style.position = 'absolute';
  actualBar.style.top = '0';
  actualBar.style.left = '0';
  actualBar.style.height = '100%';
  actualBar.style.width = `${actualPct}%`;
  track.appendChild(actualBar);
  return row;
}

function renderPlannedVsActual(goals, sessions) {
  const section = document.createElement('div');
  section.className = 'card';
  section.innerHTML = '<h3>Planned vs. actual</h3><p class="text-small text-dim">Light bar = planned, blue bar = actual.</p>';

  ['year', 'month', 'week'].forEach((level) => {
    const nodes = window.Rollup.nodesAtLevel(goals, level).slice(-6);
    if (nodes.length === 0) return;
    const rolled = nodes.map((n) => ({ n, ...window.Rollup.rollupFor(n, goals, sessions) }));
    const max = Math.max(...rolled.map((r) => Math.max(r.plannedMinutes, r.actualMinutes)), 1);
    const sub = document.createElement('div');
    sub.innerHTML = `<div class="text-small text-dim" style="margin:10px 0 4px">${level}</div>`;
    rolled.forEach((r) => sub.appendChild(barRow(r.n.period, r.plannedMinutes, r.actualMinutes, max)));
    section.appendChild(sub);
  });
  return section;
}

function renderHistograms(sessions) {
  const section = document.createElement('div');
  section.className = 'card';
  section.innerHTML = '<h3>When you actually start</h3><p class="text-small text-dim">Minutes logged by hour of day and day of week — shows when you stall vs. when you start.</p>';

  const byHour = new Array(24).fill(0);
  const byWeekday = new Array(7).fill(0);
  sessions.forEach((s) => {
    const d = new Date(s.startedAt);
    byHour[d.getHours()] += s.minutes || 0;
    byWeekday[d.getDay()] += s.minutes || 0;
  });

  const maxHour = Math.max(...byHour, 1);
  const hourWrap = document.createElement('div');
  hourWrap.innerHTML = '<div class="text-small text-dim" style="margin:10px 0 4px">By hour of day</div>';
  byHour.forEach((min, h) => {
    if (min === 0) return;
    hourWrap.appendChild(barRow(`${String(h).padStart(2, '0')}:00`, 0, min, maxHour));
  });
  section.appendChild(hourWrap);

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxWeekday = Math.max(...byWeekday, 1);
  const weekdayWrap = document.createElement('div');
  weekdayWrap.innerHTML = '<div class="text-small text-dim" style="margin:10px 0 4px">By day of week</div>';
  byWeekday.forEach((min, i) => {
    weekdayWrap.appendChild(barRow(weekdayNames[i], 0, min, maxWeekday));
  });
  section.appendChild(weekdayWrap);

  return section;
}

function renderStreaks(sessions) {
  const { current, longest } = window.Rollup.computeStreaks(sessions);
  const section = document.createElement('div');
  section.className = 'card';
  section.innerHTML = `<h3>Streaks</h3>
    <p><strong class="mono">${current}</strong> day current streak · <strong class="mono">${longest}</strong> day longest streak</p>
    <p class="text-small"><a href="log.html">View full public log →</a></p>`;
  return section;
}

async function submitReflection(reflections) {
  const form = document.getElementById('reflectionForm');
  const fd = new FormData(form);
  const entry = {
    weekId: window.DateUtils.isoWeekKey(new Date()),
    createdAt: new Date().toISOString(),
    wins: fd.get('wins'),
    blockers: fd.get('blockers'),
    nextWeekFocus: fd.get('nextWeekFocus'),
    rating: Number(fd.get('rating')) || 3,
  };
  try {
    const updated = [...reflections, entry];
    await window.Store.writeData('data/reflections.json', { entries: updated }, `Weekly reflection ${entry.weekId}`);
    init();
  } catch (err) {
    alert(err.message);
  }
}

function renderReflection(reflections) {
  const section = document.createElement('div');
  section.className = 'card';
  section.innerHTML = `
    <h3>Weekly reflection</h3>
    <form id="reflectionForm">
      <label>What went well this week?</label>
      <textarea name="wins" rows="2"></textarea>
      <label>What got in the way of starting?</label>
      <textarea name="blockers" rows="2"></textarea>
      <label>What's the one focus for next week?</label>
      <textarea name="nextWeekFocus" rows="2"></textarea>
      <label>How did this week feel, 1-5?</label>
      <input type="number" name="rating" min="1" max="5" value="3">
      <button type="submit" class="btn" data-requires-token>Save reflection</button>
    </form>
    <div id="pastReflections" style="margin-top:16px"></div>
  `;
  const past = document.createElement('div');
  reflections.slice().reverse().forEach((r) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<strong>${r.weekId}</strong> <span class="badge">${r.rating}/5</span>
      <p class="text-small"><strong>Wins:</strong> ${r.wins || '—'}</p>
      <p class="text-small"><strong>Blockers:</strong> ${r.blockers || '—'}</p>
      <p class="text-small"><strong>Next focus:</strong> ${r.nextWeekFocus || '—'}</p>`;
    past.appendChild(card);
  });
  section.querySelector('#pastReflections').appendChild(past);
  setTimeout(() => {
    document.getElementById('reflectionForm').addEventListener('submit', (e) => {
      e.preventDefault();
      submitReflection(reflections);
    });
  });
  return section;
}

async function init() {
  window.Auth.applyReadOnlyState();
  const content = document.getElementById('content');
  content.textContent = 'Loading…';
  try {
    const [goalsData, logsData, reflectionsData] = await Promise.all([
      window.Store.readData('data/goals.json'),
      window.Store.readData('data/logs.json'),
      window.Store.readData('data/reflections.json'),
    ]);
    content.innerHTML = '';
    content.appendChild(renderStreaks(logsData.sessions));
    content.appendChild(renderPlannedVsActual(goalsData.goals, logsData.sessions));
    content.appendChild(renderHistograms(logsData.sessions));
    content.appendChild(renderReflection(reflectionsData.entries));
    window.Auth.applyReadOnlyState();
  } catch (err) {
    content.textContent = `Failed to load data: ${err.message}`;
  }
}

init();
