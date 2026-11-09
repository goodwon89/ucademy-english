const root=document.getElementById('ucademy-site');
const stagePanel=document.getElementById('uc-roadmap-panel');
if(stagePanel){
 const buttons=Array.from(root.querySelectorAll('[data-level]'));
 function showStage(key,{updateHash=false}={}){
  if(!Object.hasOwn(courseBooks,key))key='basic';
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.level===key)));
  stagePanel.setAttribute('aria-labelledby','uc-tab-'+key);
  stagePanel.replaceChildren(...courseBooks[key].map(([heading,lines])=>{const row=document.createElement('div');row.className='uc-book-row';const h=document.createElement('h3');h.textContent=heading==='문법 열의 교재'?'문법·쓰기 교재':heading;const body=document.createElement('div');for(const line of lines){const p=document.createElement('p');p.textContent=line;body.append(p);}row.append(h,body);return row;}));
  if(updateHash)history.replaceState(null,'','#'+key);
 }
 buttons.forEach(button=>button.addEventListener('click',()=>showStage(button.dataset.level,{updateHash:true})));
 window.addEventListener('hashchange',()=>showStage(location.hash.slice(1)));
 showStage(location.hash.slice(1));
}
const currentLink=document.querySelector('.site-nav [aria-current="page"]');
if(currentLink&&window.matchMedia('(min-width:761px) and (max-width:1100px)').matches){
 const nav=currentLink.closest('nav');
 nav.scrollLeft=Math.max(0,currentLink.offsetLeft-nav.offsetLeft-nav.clientWidth/2+currentLink.clientWidth/2);
}
