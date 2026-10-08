import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { digest } from './approval.mjs';
test('de echte publicatiebuild neemt alleen exact goedgekeurde inzendingen op', async () => {
 const dir = await mkdtemp(join(tmpdir(),'ma-build-test-'));
 try {
  await mkdir(join(dir,'public'));await writeFile(join(dir,'public','index.html'),'test');
  const proposal = '### Term\n\nNieuwe testterm\n\n### Uitleg\n\nUitleg van deze term.\n\n### Gerelateerde termen\n\n_No response_';
  const issues = [1,2,3].map(number=>({number,title:'[Term] voorstel',body:proposal.replace('Nieuwe testterm','Nieuwe testterm '+number),html_url:'https://github.com/example/repo/issues/'+number}));
  const comments = Object.fromEntries(issues.map(issue=>[issue.number,[{id:issue.number,user:{login:issue.number===2?'student':'brdev'},body:'/accepteer '+digest(issue.body),created_at:'2026-10-08T12:00:00Z'}]]));
  issues[2].body+='\nVeranderd na goedkeuring';
  const preload = `globalThis.fetch = async url => { const p=new URL(url).pathname;const issues=${JSON.stringify(issues)};const comments=${JSON.stringify(comments)};const match=p.match(/issues\\/(\\d+)\\/comments$/);return new Response(JSON.stringify(match?comments[match[1]]:issues),{status:200,headers:{'Content-Type':'application/json'}}); };`;
  await writeFile(join(dir,'mock.mjs'),preload);
  const build = spawnSync(process.execPath,['--import',join(dir,'mock.mjs'),new URL('./build.mjs',import.meta.url).pathname],{cwd:dir,encoding:'utf8',env:{...process.env,GITHUB_ACTIONS:'true',GH_TOKEN:'test-fixture',GITHUB_REPOSITORY:'example/repo',GITHUB_EVENT_PATH:''}});
  assert.equal(build.status,0,build.stderr);
  const output=JSON.parse(await readFile(join(dir,'dist','terms.json')));
  assert.equal(output.length,759);
  assert.equal(output.filter(t=>t.issue).length,2);
  assert.equal(output.at(-1).term,'Nieuwe testterm 1');
 } finally { await rm(dir,{recursive:true,force:true}); }
});
