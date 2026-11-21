/* 타임머신 — 메인 화면: 시간 터널(스크롤 위치 = 시간 축을 따라 들어간 깊이) · 검색 · 내 나이 · 흐름 · 지도 */
(function(){
var H=document.documentElement,T=document.getElementById('tunnel');
if(!T)return;
var TM=window.TM||{},NOW=TM.now||2026,IDX=TM.idx||[],BY={};
IDX.forEach(function(r){BY[r[0]]=r});
function $(i){return document.getElementById(i)}
function mk(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n}
function lsGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
function lsSet(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(_){}}

var all=[].slice.call(T.querySelectorAll('.it')),its=all.slice(),N=its.length,lastG=null;
var ys=its.map(function(el){return +el.getAttribute('data-y')});
var hud=$('hudy'),hude=$('hude'),bar=$('bar');
var rail=[].slice.call(T.querySelectorAll('.rail a')),autoBtn=T.querySelector('.auto');
var cv=$('stars'),cx=cv.getContext('2d');
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var GAP=560,P=900,DEPTH=6,vw=0,vh=0,top0=0,camS=-1,lastA=0,lastB=-1,xo=[],yo=[],lastYear=null,auto=false,S=[],dpr=1,lastDec=null,saved=0;
var filt={c:'',th:''};
all.forEach(function(el,i){el.style.zIndex=all.length-i});
function view(){return H.getAttribute('data-v')||'tunnel'}
function tunnelOn(){return view()==='tunnel'}
function resetOn(){for(var i=0;i<all.length;i++)all[i].classList.remove('on');lastA=0;lastB=-1;lastYear=null;lastDec=null;lastG=null}
function layout(){
  vw=window.innerWidth;vh=window.innerHeight;var ph=vw<720;
  GAP=Math.round(Math.max(440,Math.min(640,vh*0.72)));
  var xoff=ph?vw*0.045:Math.min(vw*0.235,400),yp=ph?[0.04,0.11,0.06,0.13]:[-0.05,0.07,-0.01,0.09],k=0;
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
    for(i=lastA;i<=lastB;i++)if((i<a||i>b)&&its[i])its[i].classList.remove('on');
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
    lastYear=yr;hud.textContent=yr;H.classList.toggle('fut',yr>NOW);info(yr);
    var d=Math.floor(yr/10)*10;
    if(d!==lastDec){lastDec=d;rail.forEach(function(r){var on=+r.getAttribute('data-d')===d;r.classList.toggle('on',on);
      if(on&&r.parentNode.scrollWidth>r.parentNode.clientWidth)r.parentNode.scrollLeft=r.offsetLeft-r.parentNode.clientWidth/2+r.offsetWidth/2;})}
  }
  var g=its[Math.min(N-1,Math.max(0,Math.round(f)))].classList.contains('gate');
  if(g!==lastG){lastG=g;H.classList.toggle('ongate',g);if(g)kpop.hidden=true}
  bar.style.transform='scaleX('+(N>1?f/(N-1):0).toFixed(4)+')';
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
/* 정확히 그 해로: 사건이 없는 해면 앞뒤 사건 사이의 그 해 자리에 선다 */
function goYearX(y){
  var i=0;while(i<N-1&&ys[i]<y)i++;
  while(i<N-1&&ys[i]===y&&its[i].classList.contains('gate')&&ys[i+1]===y)i++;
  var f=i;if(ys[i]>y&&i>0&&ys[i]>ys[i-1])f=i-1+(y-ys[i-1])/(ys[i]-ys[i-1]);
  window.scrollTo(0,Math.round(top0+f*GAP));camS=-1;
}
function applyFilter(){
  var yr=tunnelOn()?ys[Math.min(N-1,Math.round(target()/GAP))]:ys[0],set=null,c=filt.c;
  if(filt.th&&TM.th[filt.th]){set={};TM.th[filt.th].ids.forEach(function(k){set[k]=1})}
  resetOn();
  its=all.filter(function(el){return el.classList.contains('gate')||((!c||el.classList.contains('c-'+c))&&(!set||set[el.id]))});
  N=its.length;ys=its.map(function(el){return +el.getAttribute('data-y')});
  if(tunnelOn()){layout();var j=0;if(yr>ys[0]){while(j<N-1&&ys[j]<yr)j++}window.scrollTo(0,top0+j*GAP);camS=-1}
}
function setView(v,keep){
  var was=view();if(v===was)return;
  setAuto(false);kpop.hidden=true;
  if(was==='tunnel')saved=target();
  H.setAttribute('data-v',v);lsSet('tm-view',v);
  if(v==='tunnel'){resetOn();layout();camS=-1;window.scrollTo(0,top0+(keep?0:Math.min(saved,(N-1)*GAP)))}
  else window.scrollTo(0,0);
  if(v==='map')mapInit();
}

/* ---------- 그해의 세계: 인구 · 기대수명 · 내 나이 · 한국 · 시대 */
var ipop=$('ipop'),iage=$('iage'),ikr=$('ikr'),ith=$('ith'),kpop=$('kpop'),krNow=null,eraNow=null,birth=+lsGet('tm-birth')||0;
var KRY=Object.keys(TM.kr||{}).map(Number).sort(function(a,b){return a-b}),ERA=TM.eras||[];
function num(v){return (Math.round(v*10)/10).toFixed(1)}
function popTxt(y){var p=TM.pop,v=p&&p.v[y-p.y0];return v==null?'':(y>=TM.proj?'유엔 전망 ':'')+'세계 인구 '+num(v)+'억 명'}
function lifeTxt(y){var l=TM.life,v=l&&l.v[y-l.y0];return v==null?'':'기대수명 '+num(v)+'세'}
function ageTxt(y){if(!birth)return '＋ 내 나이';var d=y-birth;return d<0?'태어나기 '+(-d)+'년 전':d===0?'내가 태어난 해':'내 나이 '+d+'세'}
function krAt(y){if(y>NOW)return null;var k=null;for(var i=0;i<KRY.length&&KRY[i]<=y;i++)k=KRY[i];return k}
function fillKr(){
  var r=TM.kr[krNow];kpop.textContent='';if(!r)return;
  kpop.appendChild(mk('b','',krNow+'년 한국에서는'));kpop.appendChild(mk('p','',r[1]));
  if(r[2]){var a=mk('a','','위키백과 「'+r[3]+'」 ↗');a.href=r[2];a.target='_blank';a.rel='noopener';kpop.appendChild(a)}
}
function info(y){
  var a=popTxt(y),b=lifeTxt(y);ipop.textContent=a+(a&&b?' · ':'')+b;ipop.hidden=!(a||b);
  iage.textContent=ageTxt(y);
  var k=krAt(y);
  if(k!==krNow){krNow=k;if(k){ikr.textContent='한국 '+k+' · '+TM.kr[k][0];ikr.hidden=false;if(!kpop.hidden)fillKr()}else{ikr.hidden=true;kpop.hidden=true}}
  var e=ERA.length;for(var i=0;i<ERA.length;i++)if(y<=ERA[i][0]){e=i+1;break}
  if(e!==eraNow){eraNow=e;H.setAttribute('data-era',e);if(hude&&ERA[e-1])hude.textContent=ERA[e-1][1]}
}

/* ---------- 분야 · 흐름 */
function chipsOn(c){[].forEach.call(document.querySelectorAll('.chip'),function(x){x.classList.toggle('on',(x.getAttribute('data-c')||'')===c)})}
function thBadge(){var t=filt.th&&TM.th[filt.th];ith.hidden=!t;if(t){ith.textContent='흐름 · '+t.n+'  ✕';ith.parentNode.scrollLeft=0}}
function setCat(c){
  var had=filt.th;filt.c=c;filt.th='';if(c)H.setAttribute('data-f',c);else H.removeAttribute('data-f');
  chipsOn(c);thBadge();setAuto(false);applyFilter();if(had)dropHash();if(mapReady)mapUpdate();
}
function setThread(k){
  if(k&&!TM.th[k])return;
  filt.th=k;filt.c='';H.removeAttribute('data-f');chipsOn('');thBadge();setAuto(false);
  if(!tunnelOn())setView('tunnel',true);
  applyFilter();
  if(k){go(1,false);camS=-1;try{history.replaceState(null,'','#th='+k)}catch(_){}}else dropHash();
}
function dropHash(){try{history.replaceState(null,'',location.pathname+location.search)}catch(_){}}

/* ---------- 검색 */
var dq=$('dq'),qi=$('qi'),qr=$('qr'),full=null;
function row(r,sub){
  var a=mk('a','qrow c-'+r[3]+(r[5]?' fut':''));a.href='e/'+r[0]+'/';
  var im=mk('img');im.src='img/'+r[0]+'_s.webp';im.alt='';im.width=64;im.height=48;im.loading='lazy';a.appendChild(im);
  var s=mk('span','x'),b=mk('b');b.appendChild(mk('i','',String(r[1])));b.appendChild(document.createTextNode(' '+r[2]+(r[5]?' · 예측':'')));
  s.appendChild(b);s.appendChild(mk('small','',sub||r[4]));a.appendChild(s);return a;
}
function yearView(y){
  var y0=IDX[0][1],y1=IDX[IDX.length-1][1];
  if(y<y0||y>y1){qr.appendChild(mk('p','qm',y0+'년부터 '+y1+'년까지 볼 수 있습니다.'));return}
  var box=mk('div','qy');box.appendChild(mk('b','',y+'년'+(y>NOW?' · 예측 구간':'')));
  var a=popTxt(y),b=lifeTxt(y);if(a||b)box.appendChild(mk('span','',a+(a&&b?' · ':'')+b));
  if(birth)box.appendChild(mk('span','',ageTxt(y)));
  var k=TM.kr[y];if(k)box.appendChild(mk('span','','한국에서는 — '+k[1]));
  var gb=mk('button','',y+'년으로 시간 여행 →');gb.type='button';gb.setAttribute('data-goy',y);box.appendChild(gb);qr.appendChild(box);
  var near=IDX.slice().sort(function(p,q){return Math.abs(p[1]-y)-Math.abs(q[1]-y)}).slice(0,8).sort(function(p,q){return p[1]-q[1]});
  qr.appendChild(mk('p','qm','가까운 장면'));near.forEach(function(r){qr.appendChild(row(r))});
}
function render(){
  var q=qi.value.trim(),m;qr.textContent='';
  if(!q){
    qr.appendChild(mk('p','qm','연도를 넣으면 그해 무렵의 장면을, 낱말을 넣으면 관련된 장면을 찾습니다.'));
    var sg=mk('div','qs');['1945','1969','1989','인공지능','달','백신','경제 위기','인터넷','기후'].forEach(function(w){var b=mk('button','',w);b.type='button';b.setAttribute('data-q',w);sg.appendChild(b)});
    qr.appendChild(sg);return;
  }
  if((m=/^(\d{4})\s*년?$/.exec(q))){yearView(+m[1]);return}
  var ws=q.toLowerCase().split(/\s+/),hit=[];
  IDX.forEach(function(r){
    var head=(r[1]+' '+r[2]+' '+(TM.cat[r[3]]||'')).toLowerCase(),body=(r[4]+' '+((full&&full[r[0]])||'')).toLowerCase(),sc=0;
    for(var i=0;i<ws.length;i++){if(head.indexOf(ws[i])>=0)sc+=2;else if(body.indexOf(ws[i])>=0)sc+=1;else return}
    hit.push([sc,r]);
  });
  hit.sort(function(a,b){return b[0]-a[0]||a[1][1]-b[1][1]});
  if(!hit.length){qr.appendChild(mk('p','qm','찾은 장면이 없습니다. 다른 낱말이나 연도(예: 1969)로 찾아보세요.'));return}
  qr.appendChild(mk('p','qm','장면 '+hit.length+'개'));
  hit.slice(0,40).forEach(function(h){qr.appendChild(row(h[1]))});
}
function openSearch(){
  if(!dq||!dq.showModal||dq.open)return;
  setAuto(false);qi.value='';dq.showModal();render();qi.focus();
  if(full===null){full={};fetch('search.json?v='+(TM.ver||'')).then(function(r){return r.json()}).then(function(j){full=j;if(dq.open&&qi.value.trim())render()}).catch(function(){})}
}
if(qi){qi.addEventListener('input',render);
  qi.addEventListener('keydown',function(ev){if(ev.key==='Enter'){var a=qr.querySelector('[data-goy],a.qrow');if(a)a.click()}})}
function travelYear(y){
  if(dq.open)dq.close();
  if(filt.c||filt.th){filt.c='';filt.th='';H.removeAttribute('data-f');chipsOn('');thBadge();dropHash();applyFilter()}
  if(!tunnelOn())setView('tunnel',true);
  goYearX(y);
}

/* ---------- 내가 태어난 해 */
var db=$('db'),bi=$('bi'),ber=$('ber');
function openBirth(){if(!db||!db.showModal||db.open)return;setAuto(false);bi.value=birth||'';ber.textContent='';db.showModal();bi.focus()}
if(bi)bi.addEventListener('keydown',function(ev){if(ev.key==='Enter'){ev.preventDefault();if(readBirth())db.close()}});
function readBirth(){
  var v=parseInt(bi.value,10);
  if(!(v>=1900&&v<=NOW)){ber.textContent='1900년부터 '+NOW+'년 사이의 해를 넣어 주세요.';return 0}
  birth=v;lsSet('tm-birth',String(v));lastYear=null;return v;
}

/* ---------- 지도 */
var mapReady=false,pins=[],mr=$('mr'),mo=$('mo'),mcard=$('mcard'),mbox=$('mbox'),mbtn=$('mbtn'),mtimer=null,msel=null;
function mapInit(){
  if(mapReady||!mbox)return;mapReady=true;
  pins=[].slice.call(mbox.querySelectorAll('.pin'));
  pins.forEach(function(p){p._m=p.getAttribute('data-ids').split(',').map(function(i){return BY[i]}).filter(Boolean)});
  mr.addEventListener('input',function(){mapStop();mapUpdate()});
  mbox.addEventListener('click',mapClick);
  var w=mbox.parentNode;w.scrollLeft=(w.scrollWidth-w.clientWidth)*0.5;
  mapUpdate();
}
function mapUpdate(){
  var y=+mr.value,n=0;mo.textContent=y+'년까지';
  pins.forEach(function(p){
    var v=p._m.filter(function(r){return r[1]<=y&&(!filt.c||r[3]===filt.c)});p._v=v;p.hidden=!v.length;if(!v.length)return;
    n+=v.length;var last=v[v.length-1];
    p.className='pin c-'+last[3]+(v.length>1?' many':'')+(mtimer&&last[1]===y?' new':'')+(p===msel?' sel':'');
    p.textContent=v.length>1?v.length:'';
    p.setAttribute('aria-label',(TM.pl[last[0]]||'')+' — '+v.length+'개 장면');
  });
  $('mn').textContent='지도에 '+n+'개 장면';
  if(msel){if(msel.hidden){msel=null;mapHint()}else mapShow(msel)}
}
function mapHint(){mcard.textContent='';mcard.appendChild(mk('p','mp','점을 누르면 그곳에서 일어난 일이 나옵니다. 숫자가 적힌 점은 여러 장면이 모인 곳입니다.'))}
function mapShow(p){
  if(msel&&msel!==p)msel.classList.remove('sel');msel=p;p.classList.add('sel');mcard.textContent='';
  p._v.forEach(function(r){mcard.appendChild(row(r,TM.pl[r[0]]))});
}
function mapClick(ev){
  var p=null;
  if(ev.detail===0)p=ev.target.closest('.pin');
  else{var best=30;pins.forEach(function(q){if(q.hidden)return;var b=q.getBoundingClientRect(),d=Math.hypot(b.left+b.width/2-ev.clientX,b.top+b.height/2-ev.clientY);if(d<best){best=d;p=q}})}
  if(p)mapShow(p);
}
function mapStop(){if(mtimer){clearInterval(mtimer);mtimer=null;mbtn.textContent='▶ 시간 흐르게'}}
function mapPlay(){
  if(mtimer){mapStop();return}
  var y=+mr.value;if(y>=+mr.max)y=+mr.min-1;mbtn.textContent='멈춤';
  mtimer=setInterval(function(){y++;mr.value=y;mapUpdate();if(y>=+mr.max){mapStop();mapUpdate()}},reduce?40:120);
}

/* ---------- 누르기 · 자판 */
document.addEventListener('click',function(ev){
  var t=ev.target.closest&&ev.target.closest('[data-act],[data-view],[data-q],[data-goy],[data-jump],[data-th],.chip,.rail a');
  if(!t){if(!kpop.hidden&&!(ev.target.closest&&ev.target.closest('.kpop')))kpop.hidden=true;return}
  if(t.matches('.rail a')){ev.preventDefault();setAuto(false);goYear(+t.getAttribute('data-d'),true);return}
  if(t.matches('.chip')){setCat(t.getAttribute('data-c')||'');return}
  var v=t.getAttribute('data-view');if(v){setView(v);return}
  if(t.hasAttribute('data-q')){qi.value=t.getAttribute('data-q');render();qi.focus();return}
  if(t.hasAttribute('data-goy')){travelYear(+t.getAttribute('data-goy'));return}
  if(t.hasAttribute('data-jump')){var s=$(t.getAttribute('data-jump'));if(s)s.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});return}
  if(t.hasAttribute('data-th')){ev.preventDefault();setThread(t.getAttribute('data-th'));return}
  var a=t.getAttribute('data-act');
  if(a!=='kr')kpop.hidden=true;
  if(a==='prev'){setAuto(false);go(idx()-1,true)}
  else if(a==='next'){setAuto(false);go(idx()+1,true)}
  else if(a==='auto'){setAuto(!auto)}
  else if(a==='top'){setAuto(false);go(0,false)}
  else if(a==='grid'){setView('grid')}
  else if(a==='search'){openSearch()}
  else if(a==='qclose'){dq.close()}
  else if(a==='birth'){openBirth()}
  else if(a==='bclose'){db.close()}
  else if(a==='bsave'){if(readBirth())db.close()}
  else if(a==='bgo'){var b=readBirth();if(b){db.close();travelYear(Math.max(b,ys[0]))}}
  else if(a==='bclear'){birth=0;lsSet('tm-birth',null);lastYear=null;db.close()}
  else if(a==='kr'){if(kpop.hidden){fillKr();kpop.hidden=false;setAuto(false)}else kpop.hidden=true}
  else if(a==='thx'){setThread('')}
  else if(a==='mplay'){mapPlay()}
});
[dq,db].forEach(function(d){if(d)d.addEventListener('click',function(ev){if(ev.target===d)d.close()})});
['wheel','touchstart','mousedown'].forEach(function(n){window.addEventListener(n,function(ev){if(auto&&!(ev.target.closest&&ev.target.closest('.auto')))setAuto(false)},{passive:true})});
window.addEventListener('keydown',function(ev){
  if(ev.altKey||ev.ctrlKey||ev.metaKey)return;
  var inField=ev.target.closest&&ev.target.closest('input,textarea,select,dialog');
  if(inField)return;
  if(ev.key==='/'){ev.preventDefault();openSearch();return}
  if(!tunnelOn())return;
  if(ev.key==='ArrowRight'){ev.preventDefault();setAuto(false);go(idx()+1,true)}
  else if(ev.key==='ArrowLeft'){ev.preventDefault();setAuto(false);go(idx()-1,true)}
  else if(ev.key==='Enter'&&document.activeElement===document.body){var c=its[idx()];if(c&&c.href)location.href=c.href}
  else if(auto)setAuto(false);
});
var rz;window.addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(function(){if(!tunnelOn())return;var i=target()/GAP;layout();window.scrollTo(0,top0+i*GAP);camS=-1},120)});
document.addEventListener('visibilitychange',function(){if(document.hidden){setAuto(false);mapStop()}});

/* ---------- 주소의 # 뒤: 사건 id · th=흐름 · y=연도 · v=보기 */
function route(first){
  var h='';try{h=decodeURIComponent(location.hash.slice(1))}catch(_){}
  if(!h)return;var m;
  if((m=/^th=([\w-]+)$/.exec(h))){if(filt.th!==m[1])setThread(m[1]);return}
  if((m=/^y=(\d{4})$/.exec(h))){travelYear(Math.max(ys[0],Math.min(+m[1],ys[N-1])));return}
  if((m=/^v=(tunnel|grid|flow|map)$/.exec(h))){if(!first)setView(m[1]);return}
  if(tunnelOn()){goId(h,false);camS=-1}
  else if(view()==='grid'){var g=document.querySelector('#grid a[href="e/'+h.replace(/[^\w-]/g,'')+'/"]');if(g){g.scrollIntoView({block:'center'});g.focus()}}
}
if(tunnelOn())layout();
if(view()==='map')mapInit();
mapHint();
setTimeout(function(){route(true)},0);
window.addEventListener('hashchange',function(){route(false)});
requestAnimationFrame(tick);
})();
