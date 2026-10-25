async function init() {
  const wall = document.getElementById('photo-wall');
  const teaser = document.getElementById('streak-teaser');
  const masthead = document.getElementById('masthead-date');
  if (masthead) {
    masthead.textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }
  try {
    const [configData, logsData] = await Promise.all([
      window.Store.readData('data/config.json'),
      window.Store.readData('data/logs.json'),
    ]);

    const { current } = window.Rollup.computeStreaks(logsData.sessions);
    const streakEl = document.getElementById('masthead-streak');
    if (streakEl) streakEl.textContent = `streak ${String(current).padStart(3, '0')}`;
    teaser.textContent = current > 0
      ? `${current}-day streak. Don't break it today.`
      : "No active streak right now — today's a good day to start one.";

    const images = configData.vision.images;
    if (images.length === 0) {
      wall.innerHTML = `
        <div class="empty-state">
          No images yet. Add your photos to <code>images/vision/</code> and list them
          in <code>data/config.json</code> under <code>vision.images</code> (or edit them from Settings).
        </div>`;
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'photo-grid';
    images.forEach((img) => {
      const fig = document.createElement('figure');
      const frame = document.createElement('div');
      frame.className = 'photo-frame';
      const image = document.createElement('img');
      image.src = img.src;
      image.alt = img.caption || '';
      frame.appendChild(image);
      fig.appendChild(frame);
      if (img.caption) {
        const cap = document.createElement('figcaption');
        cap.textContent = img.caption;
        fig.appendChild(cap);
      }
      grid.appendChild(fig);
    });
    wall.innerHTML = '';
    wall.appendChild(grid);
  } catch (err) {
    wall.textContent = `Failed to load: ${err.message}`;
  }
}

init();
