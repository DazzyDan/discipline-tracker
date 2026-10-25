// Token lives only in this browser's localStorage. Never committed, never sent anywhere but GitHub's API.
const TOKEN_KEY = 'discipline_tracker_gh_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function hasToken() {
  return getToken().length > 0;
}

// Call on pages with edit controls to hide/disable them when read-only.
function applyReadOnlyState() {
  const readOnly = !hasToken();
  document.body.classList.toggle('read-only', readOnly);
  document.querySelectorAll('[data-requires-token]').forEach((el) => {
    el.toggleAttribute('disabled', readOnly);
  });
  const banner = document.getElementById('read-only-banner');
  if (banner) banner.hidden = !readOnly;
}

window.Auth = { getToken, setToken, clearToken, hasToken, applyReadOnlyState };
