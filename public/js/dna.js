// ================================================================
// AJUSTES DEL ADN — modifica solo estas variables para personalizarlo
// ================================================================
var ADN_ANCHO       = 220;  // Anchura máxima de la hélice en píxeles
var ADN_ANCHO_VW    = 0.27; // Anchura máxima relativa a la pantalla (27%)
var ADN_ALTURA      = 2.32; // Altura del ADN respecto a la pantalla (1 = normal)
var ADN_DENSIDAD    = 1.15; // Cantidad de caracteres y puentes (1 = normal)
var ADN_VUELTAS     = 3.35; // Número de vueltas de la doble hélice
var ADN_ESCALONES   = 5;    // Subdivisiones de cada puente: más = más escalonado
var ADN_DESORDEN    = 1.0;  // Irregularidad general (0 = limpio, 2 = muy desordenado)
var ADN_CELDA       = 24;   // Separación base entre caracteres sueltos
var ADN_MOVIMIENTO  = 1.0;  // Movimiento orgánico de las hebras (0 = quieto)

(function(){
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var cv = document.getElementById("glyphs"), ctx = cv.getContext("2d");
  var hero = document.getElementById("hero"), cue = document.getElementById("cue"), track = document.getElementById("track");
  var chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789<>/\\{}[]=+*#$%&ABCDEFGHJKLMNPQRSTUVWXYZ";
  var FONT = "px ui-monospace, Menlo, Consolas, monospace";
  var BASE_NA = 104, BASE_NR = 30, BASE_RP = 7;
  var NA = Math.max(20, Math.round(BASE_NA * ADN_DENSIDAD));
  var NB = NA, NR = Math.max(8, Math.round(BASE_NR * ADN_DENSIDAD));
  var RP = Math.max(3, Math.round(BASE_RP * ADN_DENSIDAD));
  var TURNS = ADN_VUELTAS, CELL = ADN_CELDA;
  var w, h, cols, rows, cx, R, H, top, ps = [], cur = 0, last = performance.now();
  function rnd(a,b){ return a + Math.random()*(b-a); }
  function rc(){ return chars[(Math.random()*chars.length)|0]; }
  function cl(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }
  function sm(x){ return x*x*(3-2*x); }
  function io(x){ return x < .5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }
  function mk(type,t,s){
    return {type:type,t:t,s:s,c:rc(),d:Math.random(),d2:Math.random(),T:rnd(4200,9000),o:rnd(0,9000),
            duty:rnd(.45,.7),pk:rnd(.18,.5),phase:rnd(0,6.2832),wiggle:rnd(.65,1.35),
            jx:rnd(-10,10),jy:rnd(-6,6),cyc:-1,hx:0,hy:0,ex:0,ey:0};
  }
  function place(g){
    g.hx = (Math.floor(rnd(0,cols)) + .5) * CELL; g.hy = (Math.floor(rnd(0,rows)) + .5) * CELL;
    g.ex = (Math.floor(rnd(0,cols)) + .5) * CELL; g.ey = (Math.floor(rnd(0,rows)) + .5) * CELL;
  }
  function build(){
    var i, r, k; ps = [];
    for (i = 0; i < NA; i++) ps.push(mk(0, i/(NA-1), 0));
    for (i = 0; i < NB; i++) ps.push(mk(1, i/(NB-1), 0));
    for (r = 0; r < NR; r++) for (k = 0; k < RP; k++) ps.push(mk(2, (r+.5)/NR, (k+1)/(RP+1)));
  }
  function resize(){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w*dpr; cv.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    cols = Math.max(1, Math.floor(w/CELL)); rows = Math.max(1, Math.floor(h/CELL));
    cx = w/2;
    R = Math.min(ADN_ANCHO, w * ADN_ANCHO_VW) / 2;
    H = h * ADN_ALTURA;
    top = -h * .06;
    ps.forEach(place);
  }
  function frame(now){
    var dt = Math.min(.05, (now-last)/1000); last = now;
    var span = track.offsetHeight - innerHeight;
    var target = cl(span > 0 ? scrollY/span : 0);
    cur = reduce ? target : cur + (target-cur)*(1 - Math.exp(-dt*7));
    var p = cur;

    var tp = cl(p/.2);
    hero.style.transform = "translate3d(0," + (-io(tp)*h*1.1).toFixed(1) + "px,0)";
    hero.style.opacity = 1 - cl((tp-.55)/.45);
    cue.style.visibility = p > .02 ? "hidden" : "visible";

    var q1 = cl((p-.04)/.38), q2 = cl((p-.8)/.17), rot = p*18;
    ctx.clearRect(0,0,w,h);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff";

    for (var i = 0; i < ps.length; i++){
      var g = ps[i];
      var f = sm(cl((q1 - g.d*.45)/.55)) + sm(cl((q2 - g.d2*.45)/.55));
      var u = ((now+g.o) % g.T)/g.T, cyc = ((now+g.o)/g.T)|0;
      var amb = u < g.duty ? Math.sin(Math.PI*u/g.duty)*g.pk : 0;
      if ((f < .001 || f > 1.999) && amb === 0 && g.cyc !== cyc){ place(g); g.c = rc(); g.cyc = cyc; }

      var baseT = g.t*TURNS*6.2832 + rot + (g.type === 1 ? Math.PI : 0);
      var drift = ADN_DESORDEN * (Math.sin(g.t*17.0 + g.phase)*2.2 + Math.sin(g.t*41.0 + g.phase*1.7)*1.3);
      var bend  = ADN_DESORDEN * (Math.sin(baseT*1.7 + g.phase)*3.2 + Math.sin(baseT*3.1 + g.phase*.65)*1.6);
      var th = baseT + ADN_DESORDEN * Math.sin(g.t*9.0 + g.phase)*.055;
      var sn = Math.sin(th), cs = Math.cos(th), hy = top + g.t*H, hx, z, hA, hS;
      if (g.type < 2){
        var radius = R * (1 + .045*Math.sin(g.t*12.0 + g.phase) + .022*Math.sin(g.t*29.0 + g.phase*1.31));
        hx = cx + radius*sn + drift + bend + g.jx*.42;
        z = cs; hA = .42 + .58*(z+1)/2; hS = 11 + 7*(z+1)/2;
        hy += ADN_MOVIMIENTO * (Math.sin(th*2.4 + g.phase)*3.5 + g.jy*.55*ADN_DESORDEN);
      }
      else {
        // Puentes tipo "escalera": atraviesan el hueco entre las dos hebras
        // y alternan pequeñas subidas/bajadas para que no parezcan líneas rectas.
        var k = 1 - 2*g.s;
        var section = Math.floor(g.t * NR);
        var steps = Math.max(2, ADN_ESCALONES);
        var stepIndex = Math.floor(g.s * steps);
        var stepPhase = (stepIndex % 2 ? 1 : -1);
        var stair = ADN_DESORDEN * stepPhase * (4 + 3 * Math.abs(k)) * Math.sin(Math.PI * g.s);
        var wobble = ADN_DESORDEN * (Math.sin(g.t*19 + g.phase) * 2.2 + Math.sin(g.t*37 + g.phase*1.9) * 1.1);
        var radius2 = R * (1 + ADN_DESORDEN*.025*Math.sin(g.t*11.0 + g.phase));

        hx = cx + radius2*sn*k + wobble;
        z = cs*k;
        hA = .16 + .34*(z+1)/2;
        hS = 9 + 4*(z+1)/2;

        // escalonado por tramos + leve inclinación irregular
        hy += stair + ADN_DESORDEN * Math.sin(section*1.7 + g.phase) * 2.4;
      }

      var x, y;
      if (f <= 1){ x = g.hx + (hx-g.hx)*f; y = g.hy + (hy-g.hy)*f; }
      else { var ff = f-1; x = hx + (g.ex-hx)*ff; y = hy + (g.ey-hy)*ff; }
      if (g.type < 2){
        var jitter = (1-f)*.35 + f*.12;
        x += ADN_MOVIMIENTO * Math.sin(now*.0012 + g.phase)*g.wiggle*jitter*2.2;
        y += ADN_MOVIMIENTO * Math.cos(now*.0010 + g.phase*1.2)*g.wiggle*jitter*1.6;
      }
      var wt = 1 - Math.abs(f-1);
      var a = amb*(1-wt) + hA*wt;
      if (wt > .9 && Math.random() < .003) g.c = rc();
      if (a < .01) continue;
      ctx.globalAlpha = a;
      ctx.font = Math.round(15 + (hS-15)*wt) + FONT;
      ctx.fillText(g.c, x, y);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  build(); resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
})();
