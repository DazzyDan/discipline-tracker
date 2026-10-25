// Shared planned-vs-actual aggregation and streak math, used by tracker/log/analytics.
// Actuals are never stored — always derived here from logs.json sessions at render time.

function plannedMinutesFor(node) {
  if (typeof node.plannedMinutes === 'number') return node.plannedMinutes;
  if (typeof node.plannedHours === 'number') return node.plannedHours * 60;
  return 0;
}

function buildChildrenIndex(goals) {
  const byParent = new Map();
  goals.forEach((g) => {
    const list = byParent.get(g.parentId) || [];
    list.push(g);
    byParent.set(g.parentId, list);
  });
  return byParent;
}

function actualMinutesForTask(taskId, sessions) {
  return sessions
    .filter((s) => s.taskId === taskId)
    .reduce((sum, s) => sum + (s.minutes || 0), 0);
}

// Recursively sums actual minutes across all leaf ("day") descendants of a node.
function actualMinutesFor(node, childrenByParent, sessions) {
  if (node.level === 'day') return actualMinutesForTask(node.id, sessions);
  const children = childrenByParent.get(node.id) || [];
  return children.reduce((sum, child) => sum + actualMinutesFor(child, childrenByParent, sessions), 0);
}

// Returns { plannedMinutes, actualMinutes } for a node, rolling up descendants for actuals.
function rollupFor(node, goals, sessions) {
  const childrenByParent = buildChildrenIndex(goals);
  return {
    plannedMinutes: plannedMinutesFor(node),
    actualMinutes: actualMinutesFor(node, childrenByParent, sessions),
  };
}

function nodesAtLevel(goals, level, parentId) {
  return goals
    .filter((g) => g.level === level && (parentId === undefined || g.parentId === parentId))
    .sort((a, b) => a.period.localeCompare(b.period));
}

// Set of "YYYY-MM-DD" strings that have at least one logged session.
function activeDateSet(sessions) {
  return new Set(sessions.map((s) => s.date));
}

// Current streak (consecutive days up to today/yesterday) and longest streak ever.
function computeStreaks(sessions) {
  const dates = activeDateSet(sessions);
  if (dates.size === 0) return { current: 0, longest: 0 };

  const todayStr = window.DateUtils.todayISO();
  let current = 0;
  let cursor = window.DateUtils.toDate(todayStr);
  // Allow today to be "not yet started" without breaking the streak display —
  // start counting from today if active, else from yesterday.
  if (!dates.has(window.DateUtils.toISODate(cursor))) {
    cursor = window.DateUtils.addDays(cursor, -1);
  }
  while (dates.has(window.DateUtils.toISODate(cursor))) {
    current += 1;
    cursor = window.DateUtils.addDays(cursor, -1);
  }

  const sorted = Array.from(dates).sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = window.DateUtils.toDate(sorted[i - 1]);
    const next = window.DateUtils.toDate(sorted[i]);
    const diffDays = Math.round((next - prev) / 86400000);
    run = diffDays === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current, longest };
}

window.Rollup = {
  plannedMinutesFor, buildChildrenIndex, actualMinutesForTask, actualMinutesFor,
  rollupFor, nodesAtLevel, activeDateSet, computeStreaks,
};
