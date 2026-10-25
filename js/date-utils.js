// Two separate week conventions, kept deliberately apart:
// - ISO weeks (Mon-start) for the Year/Month/Week/Day goal hierarchy — standard for planning.
// - Sun-Sat weeks for the public heatmap — matches GitHub's own contribution-graph convention.

function toDate(dateStr) {
  // dateStr is "YYYY-MM-DD" — parse as local, not UTC, to avoid off-by-one day shifts.
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayISO() {
  return toISODate(new Date());
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function yearKey(date) {
  return String(date.getFullYear());
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// ISO 8601 week number (Mon-start, week 1 contains the year's first Thursday).
function isoWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7)); // shift to this week's Thursday
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const week = 1 + Math.round(
    ((d - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7
  );
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Sunday-start week boundary, used only by the heatmap.
function startOfSunWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

window.DateUtils = {
  toDate, toISODate, todayISO, addDays, yearKey, monthKey, isoWeekKey, startOfSunWeek,
};
