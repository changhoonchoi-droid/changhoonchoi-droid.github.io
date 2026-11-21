/* 타임머신 — 시간 터널. 스크롤 위치 = 카메라가 시간 축을 따라 들어간 깊이. */
(function(){
var H=document.documentElement,T=document.getElementById('tunnel');
if(!T)return;
var NOW=(window.TM&&TM.now)||2026;
var all=[].slice.call(T.querySelectorAll('.it')),its=all.slice(),N=its.length,lastG=null;
var ys=its.map(function(el){return +el.getAttribute('data-y')});
var hud=document.getElementById('hudy'),bar=document.getElementById('bar');
var rail=[].slice.call(T.querySelectorAll('.rail a')),autoBtn=T.querySelector('.auto');
var cv=document.getElementById('stars'),cx=cv.getContext('2d');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var GAP=560,P=900,DEPTH=6,vw=0,vh=0,top0=0,camS=-1,lastA=0,lastB=-1,xo=[],yo=[],lastYear=null,auto=false,S=[],dpr=1,lastDec=null;
all.forEach(function(el,i){el.style.zIndex=all.length-i});
function tunnelOn(){return !H.classList.contains('grid')}
function layout(){
  vw=window.innerWidth;vh=window.innerHeight;var ph=vw<720;
  GAP=Math.round(Math.max(440,Math.min(640,vh*0.72)));
  var xoff=ph?vw*0.045:Math.min(vw*0.235,400),yp=ph?[0.03,0.1,0.05,0.12]:[-0.05,0.07,-0.01,0.09],k=0;
  for(var i=0;i<N;i++){
    if(its[i].classList.contains('gate')){xo[i]=0;yo[i]=ph?vh*0.03:0}
    else{xo[i]=(k%2?1:-1)*xoff;yo[i]=yp[k%4]*vh;k++}
  }
  T.style.height=((N-1)*GAP+vh)+'px';
  top0=T.getBoundingClientRect().top+window.pageYOffset;
  dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);
  var n=ph?80:170;S=[];
  for(var j=0;j<n;j++)S.push({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()*0.98+0.02});
}
function target(){return Math.max(0,Math.min((N-1)*GAP,window.pageYOffset-top0))}
function draw(){
  var f=camS/GAP,a=Math.max(0,Math.floor(f)-1),b=Math.min(N-1,Math.floor(f)+DEPTH),FAR=DEPTH*GAP,i;
  if(a!==lastA||b!==lastB){
    for(i=lastA;i<=lastB;i++)if(i<a||i>b)its[i].classList.remove('on');
    for(i=a;i<=b;i++)its[i].classList.add('on');
    lastA=a;lastB=b;
  }
  for(i=a;i<=b;i++){
    var dz=i*GAP-camS,el=its[i],st=el.style;
    if(dz<-P*0.6){st.opacity=0;st.pointerEvents='none';continue}
    var s=P/(P+dz),o=dz<0?1+dz/(P*0.42):Math.min(1,(FAR-dz)/(GAP*1.6))*Math.min(1,0.3+0.8*s);
    if(o<0)o=0;
    st.transform='translate3d(-50%,-50%,0) translate3d('+(xo[i]*s).toFixed(1)+'px,'+(yo[i]*s).toFixed(1)+'px,0) scale('+s.toFixed(4)+')';
    st.opacity=o.toFixed(3);
    st.pointerEvents=(dz<-80||o<0.45)?'none':'auto';
  }
  var i0=Math.min(N-1,Math.max(0,Math.floor(f))),i1=Math.min(N-1,i0+1),yr=Math.round(ys[i0]+(ys[i1]-ys[i0])*(f-i0));
  if(yr!==lastYear){
    lastYear=yr;hud.textContent=yr;H.classList.toggle('fut',yr>NOW);
    var d=Math.floor(yr/10)*10;
    if(d!==lastDec){lastDec=d;rail.forEach(function(r){var on=+r.getAttribute('data-d')===d;r.classList.toggle('on',on);
      if(on&&r.parentNode.scrollWidth>r.parentNode.clientWidth)r.parentNode.scrollLeft=r.offsetLeft-r.parentNode.clientWidth/2+r.offsetWidth/2;})}
  }
  var g=its[Math.min(N-1,Math.max(0,Math.round(f)))].classList.contains('gate');
  if(g!==lastG){lastG=g;H.classList.toggle('ongate',g)}
  bar.style.transform='scaleX('+(f/(N-1)).toFixed(4)+')';
}
function stars(mv){
  var w=cv.width,h=cv.height,hx=w/2,hy=h/2,sp=Math.max(-0.07,Math.min(0.07,mv*0.0011))+(reduce?0:0.0005);
  var col=H.classList.contains('fut')?'150,236,240':'255,228,178';
  cx.clearRect(0,0,w,h);
  for(var i=0;i<S.length;i++){
    var p=S[i],z0=p.z;p.z-=sp;
    if(p.z<=0.02||p.z>1){p.x=Math.random()*2-1;p.y=Math.random()*2-1;p.z=sp>0?1:0.06;continue}
    var x1=hx+p.x/p.z*hx,y1=hy+p.y/p.z*hy;
    if(x1<-20||x1>w+20||y1<-20||y1>h+20){if(sp>0){p.x=Math.random()*2-1;p.y=Math.random()*2-1;p.z=1}continue}
    var x0=hx+p.x/z0*hx,y0=hy+p.y/z0*hy,al=Math.min(1,(1-p.z)*1.1);
    cx.strokeStyle='rgba('+col+','+al.toFixed(3)+')';cx.lineWidth=((1-p.z)*1.7+0.3)*dpr;cx.lineCap='round';
    cx.beginPath();cx.moveTo(x0,y0);cx.lineTo(x1+0.4,y1+0.4);cx.stroke();
  }
}
function setAuto(v){auto=v;if(autoBtn){autoBtn.setAttribute('aria-pressed',v?'true':'false');autoBtn.querySelector('.tx').textContent=v?'멈춤':'자동 여행'}}
function tick(){
  if(tunnelOn()){
    var tg=target();
    if(auto){if(tg>=(N-1)*GAP-1)setAuto(false);else window.scrollBy(0,Math.max(1.4,GAP/210))}
    if(camS<0)camS=tg;
    var d=tg-camS,mv=(reduce||Math.abs(d)<0.4)?d:d*0.17;camS+=mv;
    draw();stars(mv);
  }
  requestAnimationFrame(tick);
}
function idx(){return Math.round(target()/GAP)}
function go(i,smooth){i=Math.max(0,Math.min(N-1,i));window.scrollTo({top:top0+i*GAP,behavior:(smooth&&!reduce)?'smooth':'auto'})}
function goId(id,smooth){for(var i=0;i<N;i++)if(its[i].id===id){go(i,smooth);return true}return false}
function goYear(y,smooth){var i=0;while(i<N-1&&ys[i]<y)i++;go(i,smooth)}
function applyFilter(c){
  var yr=tunnelOn()?ys[Math.min(N-1,Math.round(target()/GAP))]:ys[0],i;
  for(i=0;i<all.length;i++)all[i].classList.remove('on');
  its=all.filter(function(el){return !c||el.classList.contains('gate')||el.classList.contains('c-'+c)});
  N=its.length;ys=its.map(function(el){return +el.getAttribute('data-y')});
  lastA=0;lastB=-1;lastYear=null;lastDec=null;
  if(tunnelOn()){layout();var j=0;if(yr>ys[0]){while(j<N-1&&ys[j]<yr)j++}window.scrollTo(0,top0+j*GAP);camS=-1}
}
function setView(v){
  var cur=idx(),curId=its[cur]&&its[cur].id;
  H.classList.toggle('grid',v==='grid');try{localStorage.setItem('tm-view',v)}catch(_){}
  setAuto(false);
  if(v==='grid'){window.scrollTo(0,0)}else{lastA=0;lastB=-1;lastYear=null;lastDec=null;layout();camS=-1;window.scrollTo(0,top0)}
}
document.addEventListener('click',function(ev){
  var t=ev.target.closest('[data-act],[data-view],.chip,.rail a');if(!t)return;
  if(t.matches('.rail a')){ev.preventDefault();setAuto(false);goYear(+t.getAttribute('data-d'),true);return}
  if(t.matches('.chip')){
    var c=t.getAttribute('data-c');if(c)H.setAttribute('data-f',c);else H.removeAttribute('data-f');
    [].forEach.call(document.querySelectorAll('.chip'),function(x){x.classList.toggle('on',x===t)});setAuto(false);applyFilter(c);return}
  var v=t.getAttribute('data-view');if(v){setView(v);return}
  var a=t.getAttribute('data-act');
  if(a==='prev'){setAuto(false);go(idx()-1,true)}
  else if(a==='next'){setAuto(false);go(idx()+1,true)}
  else if(a==='auto'){setAuto(!auto)}
  else if(a==='top'){setAuto(false);go(0,false)}
  else if(a==='grid'){setView('grid')}
});
['wheel','touchstart','mousedown'].forEach(function(n){window.addEventListener(n,function(ev){if(auto&&!(ev.target.closest&&ev.target.closest('.auto')))setAuto(false)},{passive:true})});
window.addEventListener('keydown',function(ev){
  if(!tunnelOn()||ev.altKey||ev.ctrlKey||ev.metaKey)return;
  if(ev.key==='ArrowRight'){ev.preventDefault();setAuto(false);go(idx()+1,true)}
  else if(ev.key==='ArrowLeft'){ev.preventDefault();setAuto(false);go(idx()-1,true)}
  else if(ev.key==='Enter'&&document.activeElement===document.body){var c=its[idx()];if(c&&c.href)location.href=c.href}
  else if(auto)setAuto(false);
});
var rz;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){if(!tunnelOn())return;var i=target()/GAP;layout();window.scrollTo(0,top0+i*GAP);camS=-1},120)});
document.addEventListener('visibilitychange',function(){if(document.hidden)setAuto(false)});
if(tunnelOn())layout();
if(location.hash.length>1){var id=decodeURIComponent(location.hash.slice(1));
  if(tunnelOn())setTimeout(function(){goId(id,false);camS=-1},0);
  else{var g=document.querySelector('#grid a[href="e/'+id+'/"]');if(g)setTimeout(function(){g.scrollIntoView({block:'center'});g.focus()},0)}}
requestAnimationFrame(tick);
})();
