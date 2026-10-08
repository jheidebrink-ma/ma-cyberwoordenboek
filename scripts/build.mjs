import { readFile, rm, mkdir, cp, writeFile } from 'node:fs/promises';
import { digest, parseProposal, approved, mergeTerms } from './approval.mjs';
const seed = JSON.parse(await readFile(new URL('../data/terms.json', import.meta.url)));
const owners = JSON.parse(await readFile(new URL('../data/owners.json', import.meta.url))).map(x => x.toLowerCase());
const proposals = [];
if (process.env.GITHUB_ACTIONS === 'true') {
  if (!process.env.GH_TOKEN || !process.env.GITHUB_REPOSITORY) throw Error('GitHub-token en repository ontbreken.');
  const repo = process.env.GITHUB_REPOSITORY;
  async function api(path, method = 'GET', body) {
    const response = await fetch('https://api.github.com/repos/' + repo + path, {
      method, headers: { Authorization: 'Bearer ' + process.env.GH_TOKEN, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) throw Error(`GitHub API ${response.status} (${path})`);
    return response.json();
  }
  async function all(path) {
    const result = [];
    for (let page = 1; ; page++) {
      const batch = await api(path + (path.includes('?') ? '&' : '?') + 'per_page=100&page=' + page);
      result.push(...batch); if (batch.length < 100) return result;
    }
  }
  const issues = await all('/issues?state=all&sort=created&direction=asc');
  for (const issue of issues) {
    if (issue.pull_request || !issue.title.startsWith('[Term]')) continue;
    const proposal = parseProposal(issue.body || ''); if (!proposal) continue;
    const comments = await all(`/issues/${issue.number}/comments`);
    if (approved(issue, comments, owners)) proposals.push({ ...proposal, id: 'issue-' + issue.number, issue: issue.html_url });
    // Only annotate the triggering issue, so a build never floods unrelated issues.
    const event = process.env.GITHUB_EVENT_PATH ? JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH)) : null;
    const hash = digest(issue.body || '');
    const marker = '<!-- ma-proposal:' + hash + ' -->';
    if (event?.issue?.number === issue.number && !comments.some(c => c.user?.login === 'github-actions[bot]' && c.body?.includes(marker))) {
      await api(`/issues/${issue.number}/comments`, 'POST', { body: `${marker}\nDank voor je inzending! Een eigenaar uit data/owners.json kan deze exacte versie goedkeuren met:\n\n\`/accepteer ${hash}\`\n\nAfwijzen of intrekken: \`/afwijzen ${hash}\`. Een aangepaste inzending vereist nieuwe goedkeuring. Publicatie volgt na een geslaagde Pages-workflow.` });
    }
  }
}
const terms = mergeTerms(seed, proposals);
if (terms.some(t => !t.term || !t.definition)) throw Error('Term zonder naam of uitleg.');
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
await writeFile('dist/terms.json', JSON.stringify(terms));
console.log(`${terms.length} termen gebouwd (${proposals.length} goedgekeurde inzendingen).`);
