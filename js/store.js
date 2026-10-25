// Central data-access layer. Reads are public/unauthenticated via raw.githubusercontent.com
// (never the rate-limited REST API). Writes go through github-api.js using the owner's token.

// OWNER/REPO are auto-detected from the GitHub Pages URL (https://OWNER.github.io/REPO/...)
// so you don't have to hardcode anything. For local testing (file:// or localhost), fill in
// the fallback values below with your own GitHub username/repo name.
const FALLBACK_OWNER = 'YOUR_GITHUB_USERNAME';
const FALLBACK_REPO = 'discipline-tracker';

function detectOwnerRepo() {
  const host = window.location.hostname;
  if (host.endsWith('.github.io')) {
    const owner = host.replace('.github.io', '');
    const repo = window.location.pathname.split('/').filter(Boolean)[0] || FALLBACK_REPO;
    return { owner, repo };
  }
  return { owner: FALLBACK_OWNER, repo: FALLBACK_REPO };
}

const { owner: OWNER, repo: REPO } = detectOwnerRepo();
const BRANCH = 'main';

async function readData(path) {
  const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to read ${path}: ${res.status}`);
  return res.json();
}

async function writeData(path, updatedObj, message) {
  const token = window.Auth.getToken();
  if (!token) throw new Error('No GitHub token set — add one in Settings to save changes.');
  return window.GithubApi.putFile(OWNER, REPO, path, updatedObj, token, message);
}

window.Store = { OWNER, REPO, readData, writeData };
