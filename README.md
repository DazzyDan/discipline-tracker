# Discipline Tracker

A personal, static, GitHub-hosted site to help you start things: hierarchical goal
tracking (Year → Month → Week → Day), a 5-minute "starting ritual," a public
accountability heatmap, analytics, and a vision-board homepage.

No build step, no frameworks, no backend. The GitHub repo itself is the database —
pages read JSON files out of `data/` directly off GitHub, and your own browser
writes updates back to those files using a personal access token that never
leaves your machine.

## 1. Create the GitHub repo

1. Create a **public** repo on GitHub (it must be public for the free, no-backend
   read model to work — anyone with the link can view, only you can edit).
2. Push this folder to it:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/discipline-tracker.git
   git add -A
   git commit -m "Initial site"
   git branch -M main
   git push -u origin main
   ```

## 2. Enable GitHub Pages

1. In the repo: Settings → Pages.
2. Source: "Deploy from a branch." Branch: `main`, folder: `/ (root)`.
3. Save. Your site will be live at `https://YOUR_USERNAME.github.io/discipline-tracker/`
   within a minute or two.

The site auto-detects your username/repo name from this URL — you don't need to
edit anything for the deployed site to work. (`js/store.js` has a fallback for
local testing only — see step 4.)

## 3. Generate your personal access token (so you, and only you, can write)

1. GitHub → Settings (your account, not the repo) → Developer settings →
   Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: "Only select repositories" → choose `discipline-tracker`.
3. Repository permissions → **Contents: Read and write**. Leave everything else
   as "No access."
4. Generate, copy the token (starts with `github_pat_`).
5. Open your live site → **Settings** page → paste it into "Personal access
   token" → Save → Verify.

That token is stored only in that browser's local storage. Anyone else opening
your site's link can view everything but has no way to write, since they don't
have it.

## 4. Local testing (optional)

```
cd discipline-tracker
python3 -m http.server 8000
```

Open `http://localhost:8000`. Since this isn't a `*.github.io` host, edit the
fallback constants at the top of `js/store.js`:

```js
const FALLBACK_OWNER = 'YOUR_GITHUB_USERNAME';
const FALLBACK_REPO = 'discipline-tracker';
```

so reads point at your real repo on `main`. Writes still work locally as long
as a valid token is set in Settings.

## 5. Add your vision-wall photos

1. Drop image files into `images/vision/`.
2. Commit and push them (or upload via the GitHub web UI).
3. On the site, go to **Settings** → "Vision wall images" → list each one as
   `images/vision/your-file.jpg | Optional caption`, one per line → Save.

## Everyday use

- **Tracker**: drill Year → Month → Week → Day, add goals/tasks, log time.
- **Start**: the actual unlock — pick a task, clear the pre-task checklist,
  see only the tiny first step, commit to 5 minutes.
- **Log**: your public, always-read-only accountability heatmap.
- **Analytics**: planned-vs-actual, streaks, when you actually start vs. stall,
  and a weekly reflection prompt.
- **Vision** (homepage): your photo wall — the first thing you see.
