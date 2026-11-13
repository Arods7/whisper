(function(){
var L=[{"t": "سونات مهتاب — بتهوون", "f": "audio/t1.mp3"}, {"t": "شبانه شماره ۲۱ — شوپن", "f": "audio/t3.mp3"}, {"t": "آریا روی سیم سل — باخ", "f": "audio/t4.mp3"}, {"t": "ژیمنوپدی شماره ۲ — ساتی", "f": "audio/t5.mp3"}, {"t": "سرنادِ کوچکِ شبانه — موتسارت", "f": "audio/t6.mp3"}];
var a=new Audio();a.preload="auto";a.volume=.55;
var i=+(sessionStorage.pwI||0)%L.length,on=localStorage.pwMusic!=="off";
function load(){a.src=L[i].f;a.currentTime=+(sessionStorage.pwT||0);lab.textContent=L[i].t}
var box=document.createElement("div");box.className="mplayer";
box.innerHTML='<button class="mp-btn" aria-label="پخش یا توقف موسیقی"></button><span class="mp-title"></span><button class="mp-next" aria-label="قطعه‌ی بعد">⏭</button>';
document.body.appendChild(box);
var btn=box.children[0],lab=box.children[1];
function ui(){btn.textContent=(on&&!a.paused)?"❚❚":"▶";box.classList.toggle("is-on",on&&!a.paused)}
function play(){a.play().then(ui).catch(function(){ui()})}
load();
btn.onclick=function(){if(a.paused){on=true;localStorage.pwMusic="on";play()}else{on=false;localStorage.pwMusic="off";a.pause();ui()}};
box.children[2].onclick=function(){i=(i+1)%L.length;sessionStorage.pwT=0;load();on=true;localStorage.pwMusic="on";play()};
a.onended=function(){i=(i+1)%L.length;sessionStorage.pwT=0;load();play()};
a.ontimeupdate=function(){sessionStorage.pwT=a.currentTime;sessionStorage.pwI=i};
a.onpause=ui;a.onplay=ui;
if(on){play();["click","keydown","touchstart","scroll","pointerdown"].forEach(function(e){addEventListener(e,function f(){if(on&&a.paused)play();removeEventListener(e,f)},{passive:true})})}
ui();
})();