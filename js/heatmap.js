// Pure function: sessions[] -> inline SVG calendar heatmap (GitHub contribution-graph style).
// No chart library — just <rect> elements in an SVG, built with the DOM API (not string HTML)
// so dates never need escaping.

const CELL = 11;
const GAP = 3;
const LEVELS = [0, 1, 15, 30, 60]; // minutes thresholds -> intensity levels 0-4

function intensityLevel(minutes) {
  let level = 0;
  for (let i = LEVELS.length - 1; i >= 0; i -= 1) {
    if (minutes >= LEVELS[i]) { level = i; break; }
  }
  return level;
}

function dailyMinutesMap(sessions) {
  const map = new Map();
  sessions.forEach((s) => {
    map.set(s.date, (map.get(s.date) || 0) + (s.minutes || 0));
  });
  return map;
}

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

// Renders weeks (default 53, ~1 year) of Sun-Sat columns ending on the current week.
function renderHeatmap(container, sessions, weeks = 53) {
  const minutesByDate = dailyMinutesMap(sessions);
  const totalDays = weeks * 7;
  const start = window.DateUtils.addDays(
    window.DateUtils.startOfSunWeek(new Date()),
    -(weeks - 1) * 7
  );

  const width = weeks * (CELL + GAP);
  const height = 7 * (CELL + GAP);
  const svg = svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    width, height,
    role: 'img',
    'aria-label': 'Daily activity heatmap',
  });

  for (let i = 0; i < totalDays; i += 1) {
    const date = window.DateUtils.addDays(start, i);
    const dateStr = window.DateUtils.toISODate(date);
    if (date > new Date()) break; // don't draw future days
    const col = Math.floor(i / 7);
    const row = i % 7;
    const minutes = minutesByDate.get(dateStr) || 0;
    const level = intensityLevel(minutes);
    const rect = svgEl('rect', {
      x: col * (CELL + GAP),
      y: row * (CELL + GAP),
      width: CELL,
      height: CELL,
      rx: 2,
      class: `heat-level-${level}`,
      'data-date': dateStr,
    });
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = minutes > 0 ? `${dateStr}: ${minutes} min` : `${dateStr}: no activity`;
    rect.appendChild(title);
    svg.appendChild(rect);
  }

  container.innerHTML = '';
  container.appendChild(svg);
}

window.Heatmap = { renderHeatmap, intensityLevel, dailyMinutesMap };
