function setStatus(msg, isError) {
  const el = document.getElementById('tokenStatus');
  el.textContent = msg;
  el.style.color = isError ? 'var(--danger)' : 'var(--success)';
}

document.getElementById('saveTokenBtn').addEventListener('click', () => {
  const val = document.getElementById('tokenInput').value;
  if (!val) return;
  window.Auth.setToken(val);
  window.Auth.applyReadOnlyState();
  setStatus('Token saved to this browser.');
});

document.getElementById('verifyBtn').addEventListener('click', async () => {
  const token = window.Auth.getToken() || document.getElementById('tokenInput').value;
  if (!token) { setStatus('No token to verify.', true); return; }
  setStatus('Verifying…');
  try {
    const user = await window.GithubApi.verifyToken(token);
    setStatus(`Token works — authenticated as ${user.login}.`);
  } catch (err) {
    setStatus(`Verification failed: ${err.message}`, true);
  }
});

document.getElementById('clearTokenBtn').addEventListener('click', () => {
  window.Auth.clearToken();
  document.getElementById('tokenInput').value = '';
  window.Auth.applyReadOnlyState();
  setStatus('Token cleared from this browser.');
});

async function loadIntoForms() {
  document.getElementById('tokenInput').value = window.Auth.getToken();
  try {
    const config = await window.Store.readData('data/config.json');
    document.getElementById('checklistItems').value = (config.checklists.default.items || []).join('\n');
    document.getElementById('tagsItems').value = Object.entries(config.tags || {})
      .map(([key, tag]) => `${key} | ${tag.label} | ${tag.color}`).join('\n');
    document.getElementById('visionItems').value = (config.vision.images || [])
      .map((img) => `${img.src} | ${img.caption || ''}`).join('\n');
  } catch (err) {
    setStatus(`Failed to load current config: ${err.message}`, true);
  }
}

document.getElementById('checklistForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const config = await window.Store.readData('data/config.json');
    const items = document.getElementById('checklistItems').value.split('\n').map((s) => s.trim()).filter(Boolean);
    config.checklists.default.items = items;
    await window.Store.writeData('data/config.json', config, 'Update checklist');
    setStatus('Checklist saved.');
  } catch (err) {
    setStatus(err.message, true);
  }
});

document.getElementById('tagsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const config = await window.Store.readData('data/config.json');
    const lines = document.getElementById('tagsItems').value.split('\n').map((s) => s.trim()).filter(Boolean);
    const tags = {};
    lines.forEach((line) => {
      const [key, label, color] = line.split('|').map((s) => s.trim());
      if (key) tags[key] = { label: label || key, color: color || '#5b8cff' };
    });
    config.tags = tags;
    await window.Store.writeData('data/config.json', config, 'Update tags');
    setStatus('Tags saved.');
  } catch (err) {
    setStatus(err.message, true);
  }
});

document.getElementById('visionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const config = await window.Store.readData('data/config.json');
    const lines = document.getElementById('visionItems').value.split('\n').map((s) => s.trim()).filter(Boolean);
    config.vision.images = lines.map((line) => {
      const [src, caption] = line.split('|').map((s) => s.trim());
      return { src, caption: caption || '' };
    });
    await window.Store.writeData('data/config.json', config, 'Update vision wall images');
    setStatus('Vision list saved.');
  } catch (err) {
    setStatus(err.message, true);
  }
});

window.Auth.applyReadOnlyState();
loadIntoForms();
