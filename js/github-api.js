// Thin wrapper around the GitHub Contents API for reading/writing JSON data files.
// Reads never use this module (they go straight to raw.githubusercontent.com via store.js) —
// this is only for authenticated writes, which must go through the Contents API.

function b64EncodeUnicode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach((b) => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function b64DecodeUnicode(b64) {
  const binary = atob(b64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

async function githubRequest(path, token, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status} on ${path}: ${body}`);
  }
  return res.json();
}

// Fetches the current file content + sha (needed before any write).
async function getFile(owner, repo, path, token) {
  const data = await githubRequest(`/repos/${owner}/${repo}/contents/${path}`, token);
  return { sha: data.sha, content: JSON.parse(b64DecodeUnicode(data.content)) };
}

// Writes updatedObj as the new content of path. Always re-fetches the sha
// immediately beforehand so this is safe even if something else changed the file.
async function putFile(owner, repo, path, updatedObj, token, message) {
  const { sha } = await getFile(owner, repo, path, token);
  const body = {
    message: message || `Update ${path}`,
    content: b64EncodeUnicode(JSON.stringify(updatedObj, null, 2)),
    sha,
    branch: 'main',
  };
  return githubRequest(`/repos/${owner}/${repo}/contents/${path}`, token, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// Harmless authenticated call used by Settings to verify a token actually works.
async function verifyToken(token) {
  return githubRequest('/user', token);
}

window.GithubApi = { getFile, putFile, verifyToken };
