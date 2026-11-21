/* 타임머신 — 상세 화면: ←/→ 이동 · 그때 내 나이 · 공유 · 흐름 줄에서 지금 장면 보이기 */
(function(){
var d=document,b=d.body,y=+b.getAttribute('data-y'),fut=b.classList.contains('fut');
d.addEventListener('keydown',function(e){
  if(e.altKey||e.ctrlKey||e.metaKey||(e.target.closest&&e.target.closest('input,textarea')))return;
  var a=e.key==='ArrowLeft'?'pv':e.key==='ArrowRight'?'nx':'',el=a&&d.getElementById(a);if(el)location.href=el.href;
});
var bi=0;try{bi=+localStorage.getItem('tm-birth')||0}catch(_){}
var m=d.getElementById('myage');
if(m&&bi&&y){var k=y-bi;m.textContent=k<0?'내가 태어나기 '+(-k)+'년 전':k===0?'내가 태어난 해':fut?'내가 '+k+'세가 되는 해':'내가 '+k+'세이던 해';m.hidden=false}
function toast(t){var n=d.createElement('div');n.className='toast';n.setAttribute('role','status');n.textContent=t;b.appendChild(n);setTimeout(function(){n.remove()},2200)}
var sh=d.getElementById('sh');
if(sh)sh.addEventListener('click',function(){
  var c=d.querySelector('link[rel=canonical]'),url=c?c.href:location.href.split('#')[0],ds=d.querySelector('meta[name=description]');
  if(navigator.share){navigator.share({title:d.title,text:ds?ds.content:'',url:url}).catch(function(){});return}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(function(){toast('주소를 복사했습니다')},function(){toast(url)});return}
  toast(url);
});
[].forEach.call(d.querySelectorAll('.chain'),function(c){var cur=c.querySelector('.cur');if(cur)c.scrollLeft=cur.offsetLeft-c.clientWidth/2+cur.offsetWidth/2});
})();
