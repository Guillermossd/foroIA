// boards.html: barra lateral + últimas publicaciones de todos los subforos.
(function(){
  var feed = document.getElementById("feed");

  function fmt(s){ return new Date(s.replace(" ", "T") + "Z").toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }); }

  function item(x){
    var art = document.createElement("article"); art.className = "post";
    var h = document.createElement("h3"); h.textContent = x.title;
    var m = document.createElement("div"); m.className = "meta";
    var a = document.createElement("a"); a.className = "link"; a.href = "forum.html?b=" + encodeURIComponent(x.board_slug); a.textContent = x.board_name;
    m.append(a, document.createTextNode(" · " + x.username + " · " + fmt(x.created_at)));
    var b = document.createElement("p"); b.className = "body clamp"; b.textContent = x.body;
    art.append(h, m, b);
    return art;
  }

  // Cada parte es independiente: si una falla, las demás siguen.
  initNav().catch(function(){});
  renderSidebar(null);

  api("/latest").then(function(data){
    if (!data.posts.length) { feed.textContent = "Aún no hay publicaciones. Elige un subforo y escribe la primera."; return; }
    feed.replaceChildren.apply(feed, data.posts.map(item));
  }).catch(function(err){
    feed.textContent = "No se pudieron cargar las publicaciones: " + err.message;
  });
})();
