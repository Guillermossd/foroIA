// Mueve y desvanece las tarjetas laterales según el scroll.
// data-speed en cada .card: 1 = velocidad normal, >1 pasa más rápido, <1 más lento.
(function(){
  var cards = [].slice.call(document.querySelectorAll("#track .card"));
  if (!cards.length) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh, tops, hs, ticking = false;
  function cl(x){ return x < 0 ? 0 : x > 1 ? 1 : x; }

  function measure(){
    vh = innerHeight;
    tops = cards.map(function(c){ return c.offsetTop; });
    hs = cards.map(function(c){ return c.offsetHeight; });
    update();
  }
  function update(){
    ticking = false;
    var y = scrollY;
    cards.forEach(function(c, i){
      var speed = reduce ? 1 : (parseFloat(c.dataset.speed) || 1);
      // desplazamiento extra (parallax): es 0 cuando la tarjeta está a mitad de pantalla
      var extra = -(speed - 1) * (y - (tops[i] - vh*.5));
      var vt = tops[i] - y + extra;                       // posición de su borde superior en pantalla
      var o = Math.min(cl((vh - vt)/(vh*.22)), cl((vt + hs[i])/(vh*.22))); // aparece abajo, se va arriba
      c.style.opacity = o.toFixed(3);
      c.style.transform = "translate3d(0," + extra.toFixed(1) + "px,0)";
    });
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }

  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure);
  addEventListener("load", measure);
  measure();
})();
