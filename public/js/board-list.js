// Página de selección de subforos (boards.html).
(function(){
  var list = document.getElementById("boards");

  function row(b){
    var a = document.createElement("a");
    a.className = "board";
    a.href = "forum.html?b=" + encodeURIComponent(b.slug);

    var h = document.createElement("h3");
    var name = document.createElement("span"); name.textContent = b.name;
    var logo = document.createElement("img"); logo.className = "logo"; logo.src = b.logo; logo.alt = "";
    h.append(name, logo);

    var d = document.createElement("p"); d.textContent = b.description;
    var m = document.createElement("div"); m.className = "meta";
    m.textContent = b.posts + (b.posts === 1 ? " publicación" : " publicaciones");

    a.append(h, d, m);
    return a;
  }

  // La barra superior y la lista son independientes: si una falla, la otra sigue.
  initNav().catch(function(){});

  api("/boards").then(function(data){
    list.replaceChildren.apply(list, data.boards.map(row));
  }).catch(function(err){
    list.textContent = "No se pudieron cargar los subforos: " + err.message;
  });
})();
