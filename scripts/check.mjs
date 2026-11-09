import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const dir=path.resolve('dist');
const routes=['','teacher','about','elementary','secondary','stories','contact'];
const expected=routes.map(r=>r?`/${r}/`:'/');
const issues=[];
for(const route of routes){
 const file=path.join(dir,route,'index.html');const html=await readFile(file,'utf8');
 const h1s=html.match(/<h1\b/g)||[];if(h1s.length!==1)issues.push(`${route||'home'}: expected one h1`);
 for(const item of ['<title>','name="description"','property="og:image"','rel="canonical"','lang="ko"'])if(!html.includes(item))issues.push(`${route}: missing ${item}`);
 if(/배치 시안|배치 영역|연결 예정|data-screen-link|data-preview-action/.test(html))issues.push(`${route}: prototype-only content remains`);
 if(/(?:150,000|180,000|200,000|220,000|300,000|400,000|450,000)원|[0-9]+만원/.test(html))issues.push(`${route}: tuition amount present`);
 const nav=html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)?.[0]||'';
 const links=[...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);if(JSON.stringify(links)!==JSON.stringify(expected))issues.push(`${route}: incorrect navigation order`);
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(ids.length!==new Set(ids).size)issues.push(`${route}: duplicate ids`);
 for(const m of html.matchAll(/(?:src|href)="(\/[^"#]*)(?:#[^"]*)?"/g)){
  let target=path.join(dir,decodeURIComponent(m[1]));try{if((await stat(target)).isDirectory())target=path.join(target,'index.html');await stat(target);}catch{issues.push(`${route}: missing internal resource ${m[1]}`);}
 }
 const external=[...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map(m=>m[0]);for(const link of external)if(!link.includes('noopener'))issues.push(`${route}: external link missing noopener`);
}
for(const item of ['404.html','sitemap.xml','robots.txt','assets/social-cover.png','assets/favicon.png','assets/apple-touch-icon.png'])try{await stat(path.join(dir,item));}catch{issues.push(`Missing ${item}`);}
for(const folder of ['.env','.git','.codex','outputs','references'])try{await stat(path.join(dir,folder));issues.push(`Unexpected private folder ${folder}`);}catch{}
if(issues.length){console.error(issues.join('\n'));process.exitCode=1;}else console.log('PASS: 7 real routes, navigation order, metadata, resource links, no tuition and no prototype placeholders.');
