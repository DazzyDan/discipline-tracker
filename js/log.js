async function init() {
  const statsEl = document.getElementById('stats');
  const heatmapEl = document.getElementById('heatmap');
  try {
    const logsData = await window.Store.readData('data/logs.json');
    const sessions = logsData.sessions;
    const { current, longest } = window.Rollup.computeStreaks(sessions);
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const activeDays = window.Rollup.activeDateSet(sessions).size;

    statsEl.innerHTML = `
      <strong>${current}</strong>-day current streak &nbsp;·&nbsp;
      <strong>${longest}</strong>-day longest streak &nbsp;·&nbsp;
      <strong>${activeDays}</strong> active days &nbsp;·&nbsp;
      <strong>${Math.round(totalMinutes / 60)}</strong> total hours logged
    `;

    window.Heatmap.renderHeatmap(heatmapEl, sessions, 53);
  } catch (err) {
    statsEl.textContent = `Failed to load log: ${err.message}`;
    heatmapEl.textContent = '';
  }
}

init();
