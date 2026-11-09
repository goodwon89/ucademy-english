import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {courseBooks} from '../src/course-books.mjs';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
export const pages=[
 {key:'home',slug:'',label:'홈',title:'유카데미 잉글리시 | 우리 아이의 속도로, 영어의 기본을 탄탄하게',description:'안양씨엘포레자이 유카데미 잉글리시. 학생의 수준에 맞춘 개별 진도와 꼼꼼한 학습 점검으로 영어의 기본기를 함께 기릅니다.'},
 {key:'teacher',slug:'teacher',label:'강사소개',title:'강사소개 · Teacher U | 유카데미 잉글리시',description:'유카데미 Teacher U 유지혜 선생님의 문법·독해 지도 방식과 공개 경력, 과거 제자들의 수업 경험을 소개합니다.'},
 {key:'about',slug:'about',label:'유카데미 소개',title:'유카데미 소개 | 너를 위한 영어, 유카데미',description:'학생을 위한 영어 교육을 뜻하는 Ucademy English. 교육 철학, 개별 학습 관리와 학원의 이야기를 만나보세요.'},
 {key:'elementary',slug:'elementary',label:'초등부',title:'초등부 교육과정과 진도표 | 유카데미 잉글리시',description:'기초·중급·고급 3단계로 살펴보는 어휘·독해·리스닝과 스피킹·문법 교재, 학생별 라이팅·스피치 수업을 안내합니다.'},
 {key:'secondary',slug:'secondary',label:'중·고등부',title:'중·고등부 내신·수능 지도 | 유카데미 잉글리시',description:'문법과 독해의 기본에서 내신과 수능까지. 학생의 수준과 약점에 맞춘 중·고등부 영어 학습 방향과 지도 경험을 소개합니다.'},
 {key:'stories',slug:'stories',label:'유카데미 이야기',title:'유카데미 이야기 | 교실·수업·행사 소식',description:'유카데미 교실의 일상과 아이들의 수업, 함께한 행사와 학원 소식을 만나보세요.'},
 {key:'contact',slug:'contact',label:'상담·오시는 길',title:'상담·오시는 길 | 안양씨엘포레자이 유카데미',description:'자녀에게 맞는 영어 공부를 상담하세요. 유카데미의 상담 신청서와 카카오 문의, 안양씨엘포레자이 방문 위치를 안내합니다.'}
];
const routes=Object.fromEntries(pages.map(p=>[p.key,p.slug?`/${p.slug}/`:'/']));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const urlOrigin=()=>{const raw=process.env.SITE_URL||process.env.VERCEL_PROJECT_PRODUCTION_URL||'ucademy-english.vercel.app';return new URL(raw.startsWith('http')?raw:`https://${raw}`).origin;};
const logo='<img src="/assets/brand-mark.png" alt="" width="40" height="40"><span>유카데미<small>UCADEMY ENGLISH</small></span>';
const header=page=>`<a class="skip-link" href="#main">본문 바로가기</a><header class="site-header ${page.key==='home'?'is-home':''}"><div class="header-inner"><a class="site-brand" href="/" aria-label="유카데미 잉글리시 홈">${logo}</a><nav class="site-nav" aria-label="주요 페이지">${pages.map(p=>`<a href="${routes[p.key]}"${p.key===page.key?' aria-current="page"':''}>${p.label}</a>`).join('')}</nav><a class="header-contact" href="/contact/">수업 상담 <span aria-hidden="true">↗</span></a></div></header>`;
const footer=()=>`<footer class="site-footer"><div class="footer-top"><a class="site-brand" href="/" aria-label="유카데미 홈">${logo}</a><a href="#top" class="back-top">맨 위로 <span aria-hidden="true">↑</span></a></div><nav aria-label="하단 메뉴">${pages.map(p=>`<a href="${routes[p.key]}">${p.label}</a>`).join('')}</nav><div class="footer-bottom"><div><p>안양씨엘포레자이 · 유카데미 잉글리시</p><p>경기도 안양시 만안구 소곡로 78</p><p><a href="https://blog.naver.com/ucademyenglish" target="_blank" rel="noopener noreferrer">네이버 블로그 ↗</a><span aria-hidden="true"> · </span><a href="https://open.kakao.com/me/Ucademy" target="_blank" rel="noopener noreferrer">카카오 문의 ↗</a></p></div><p>© ${new Date().getUTCFullYear()} UCADEMY ENGLISH</p></div></footer>`;
function transform(content,page){
 content=content.replace(/<button\b([^>]*?)data-screen-link="([^"]+)"([^>]*?)>([\s\S]*?)<\/button>/g,(_m,a,key,b,text)=>`<a${a.replace(/\s*type="button"/g,'')}${b.replace(/\s*type="button"/g,'')} href="${routes[key]}">${text}</a>`);
 content=content.replace(/<button\b([^>]*?)data-level-link="([^"]+)"([^>]*?)>([\s\S]*?)<\/button>/g,(_m,a,level,b,text)=>`<a${a.replace(/\s*type="button"/g,'')}${b.replace(/\s*type="button"/g,'')} href="/elementary/#${level}">${text}</a>`);
 content=content.replace(/(<div class="uc-pose ([^"]+)"[^>]*>)<img data-character alt="">/g,(_m,tag,classes)=>`${tag}<img src="/assets/yukamon-${classes.includes('uc-cheer')?'cheer':classes.includes('uc-walk')?'walk':'wave'}.webp" alt="" width="1536" height="1024" ${page.key==='home'?'decoding="async"':'loading="lazy" decoding="async"'}>`);
 content=content.replace(/<div class="uc-photo">([^<]+)<\/div>/g,(_m,label)=>`<div class="story-cover ${label.includes('교실')?'cover-cyan':label.includes('행사')?'cover-coral':'cover-green'}"><span>${label.includes('교실')?'OUR CLASSROOM':label.includes('행사')?'TOGETHER':'LEARNING'}</span><img src="/assets/yukamon-${label.includes('교실')?'wave':label.includes('행사')?'cheer':'walk'}.webp" alt="" width="1536" height="1024" loading="lazy"></div>`);
 content=content.replace('현재 재직 여부나 최근 시험 성적으로 바꾸어 표기하지 않았습니다.','');
 content=content.replace(/<button type="button" class="uc-button uc-dark" data-preview-action="form">([\s\S]*?)<\/button>/g,'<a class="uc-button uc-dark" href="https://forms.gle/jHBSFTaibNuHwhfT6" target="_blank" rel="noopener noreferrer">상담 신청서 작성 <span aria-hidden="true">↗</span><span class="sr-only">(새 창)</span></a>');
 content=content.replace(/<button type="button" class="uc-button uc-outline" data-preview-action="kakao">([\s\S]*?)<\/button>/g,'<a class="uc-button uc-outline" href="https://open.kakao.com/me/Ucademy" target="_blank" rel="noopener noreferrer">카카오로 문의하기 <span aria-hidden="true">↗</span><span class="sr-only">(새 창)</span></a>');
 content=content.replace('<p class="uc-small">배치 시안에서는 외부 서비스로 이동하지 않습니다.</p>','<p class="uc-small">신청서와 카카오는 새 창으로 연결됩니다.</p>');
 content=content.replace('<p class="uc-preview-status" aria-live="polite"></p>','');
 content=content.replace('<div class="uc-map-placeholder">지도·방문 안내 배치 영역</div>',`<a class="location-link" href="https://map.naver.com/p/search/${encodeURIComponent('경기도 안양시 만안구 소곡로 78')}" target="_blank" rel="noopener noreferrer"><span class="location-icon" aria-hidden="true">↗</span><span><strong>네이버 지도에서 위치 보기</strong><small>방문 전 상담으로 자세한 위치를 안내받으세요.</small></span></a>`);
 if(page.key==='home'){
  content=content.replace('<div class="uc-hero-art">','<div class="uc-hero-art"><span class="hero-note">Hello, Yukamon!</span><span class="hero-caption">너를 위한 영어, 유카데미</span>');
  content=content.replace('<h1>우리 아이의 속도로,<br>영어의 기본을<br>탄탄하게.</h1>','<h1>우리 아이의 속도로,<br>영어의 기본을<br class="hero-mobile-break"> 탄탄하게.</h1>');
  content=content.replace('<section class="uc-section uc-levels">','<section class="uc-section uc-levels" id="courses">');
  content=content.replace('<section class="uc-section uc-learning">','<section class="uc-section uc-learning" id="learning">');
 }
 if(page.key==='elementary'){
  content=content.replace('<section class="uc-section uc-roadmap">','<section class="uc-section uc-roadmap" id="roadmap">');
  content=content.replace('<div class="uc-tabs" role="tablist" aria-label="초등부 학습 단계">','<div class="uc-tabs" role="group" aria-label="초등부 학습 단계 선택">');
  content=content.replace(/role="tab" aria-selected="(true|false)"/g,'aria-pressed="$1"');
  content=content.replace('role="tabpanel" aria-labelledby="uc-tab-basic"','aria-labelledby="uc-tab-basic"');
  content=content.replace('<section class="uc-section"><h2>궁금한 점을 모았어요.</h2>','<noscript><section class="uc-section"><h2>전체 단계 교재</h2>'+Object.entries(courseBooks).map(([k,rows])=>`<h3>${{basic:'기초',middle:'중급',advanced:'고급'}[k]}</h3>${rows.map(([h,lines])=>`<p>${escape(h)}: ${lines.map(escape).join(' / ')}</p>`).join('')}`).join('')+'</section></noscript><section class="uc-section"><h2>궁금한 점을 모았어요.</h2>');
 }
 return content;
}
function document(page,content){
 const canonical=urlOrigin()+routes[page.key];
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#c9efae">${page.noindex?'<meta name="robots" content="noindex">':''}<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="website"><meta property="og:locale" content="ko_KR"><meta property="og:site_name" content="유카데미 잉글리시"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${urlOrigin()}/assets/social-cover.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/assets/favicon.png" type="image/png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin><link rel="stylesheet" href="/assets/site.css"><script type="module" src="/assets/site.js"></script></head><body id="top" class="page-${page.key}"><div id="ucademy-site"><div class="uc-product">${header(page)}<main id="main">${content}</main>${footer()}</div></div></body></html>`;
}
export async function build(){
 const dist=path.join(root,'dist');await mkdir(path.join(dist,'assets'),{recursive:true});
 await cp(path.join(root,'public'),dist,{recursive:true});
 const css=(await readFile(path.join(root,'src/styles/base.css'),'utf8'))+'\n'+await readFile(path.join(root,'src/styles/site.css'),'utf8');
 await writeFile(path.join(dist,'assets/site.css'),css);
 const js='const courseBooks='+JSON.stringify(courseBooks)+';\n'+await readFile(path.join(root,'src/scripts/site.js'),'utf8');
 await writeFile(path.join(dist,'assets/site.js'),js);
 for(const page of pages){let content=await readFile(path.join(root,'src/pages',page.key+'.html'),'utf8');content=transform(content,page);const dir=page.slug?path.join(dist,page.slug):dist;await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),document(page,content));}
 const error={key:'home',noindex:true,title:'페이지를 찾을 수 없습니다 | 유카데미',description:'유카데미 홈에서 필요한 수업 정보를 찾아보세요.'};
 await writeFile(path.join(dist,'404.html'),document(error,'<section class="uc-page-intro error-page"><span class="uc-kicker">404</span><h1>이 페이지는<br>찾을 수 없어요.</h1><p>홈에서 필요한 수업 정보를 다시 찾아보세요.</p><a class="uc-button uc-dark" href="/">홈으로 돌아가기 →</a></section>'));
 await writeFile(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${urlOrigin()}/sitemap.xml\n`);
 await writeFile(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+pages.map(p=>`<url><loc>${urlOrigin()+routes[p.key]}</loc></url>`).join('')+'</urlset>');
 console.log(`Built ${pages.length} pages → dist/ (${urlOrigin()})`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await build();
