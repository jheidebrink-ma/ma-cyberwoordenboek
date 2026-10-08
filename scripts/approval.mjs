import { createHash } from 'node:crypto';
export const digest = body => createHash('sha256').update(body).digest('hex');
export function parseProposal(body) {
  const sections = body.split(/^### /m);
  const read = title => sections.find(s => s.startsWith(title + '\n'))?.slice(title.length).trim();
  const term = read('Term'), definition = read('Uitleg'), related = read('Gerelateerde termen');
  if (!term || !definition || term === '_No response_' || definition === '_No response_' || term.length > 120 || definition.length > 5000) return null;
  return { term, definition, related: related && related !== '_No response_' ? related.split(',').map(s => s.trim()).filter(Boolean) : [] };
}
export function approved(issue, comments, owners) {
  const decisions = comments.filter(c => owners.includes(c.user?.login?.toLowerCase()) && /^\/(accepteer|afwijzen)\s+[a-f0-9]{64}\s*$/.test(c.body?.trim() || ''))
    .sort((a,b) => new Date(a.created_at) - new Date(b.created_at) || a.id-b.id);
  const last = decisions.at(-1);
  return !!last && last.body.trim() === '/accepteer ' + digest(issue.body || '');
}
export function mergeTerms(seed, proposals) {
  const result = [...seed], names = new Set(seed.map(t => t.term.toLocaleLowerCase('nl')));
  for (const p of proposals) {
    const key = p.term.toLocaleLowerCase('nl');
    if (names.has(key)) continue;
    result.push(p); names.add(key);
  }
  return result;
}
