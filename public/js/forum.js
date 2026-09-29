// Vista de un subforo: forum.html?b=<slug>
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var slug = new URLSearchParams(location.search).get("b");

  function fmt(s){ return new Date(s.replace(" ", "T") + "Z").toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }); }

  function render(posts){
    var box = $("posts");
    box.replaceChildren();
    if (!posts.length) { var p = document.createElement("p"); p.className = "hint"; p.textContent = "Aún no hay publicaciones en este subforo. Escribe la primera."; box.append(p); return; }
    posts.forEach(function(x){
      var art = document.createElement("article"); art.className = "post";
      var h = document.createElement("h3"); h.textContent = x.title;
      var m = document.createElement("div"); m.className = "meta"; m.textContent = x.username + " · " + fmt(x.created_at);
      var b = document.createElement("p"); b.className = "body"; b.textContent = x.body; // textContent evita inyección de HTML
      art.append(h, m, b); box.append(art);
    });
  }

  async function load(){
    var data = await api("/boards/" + encodeURIComponent(slug));
    document.title = data.board.name + " · DEEPSEEKAI";
    $("name").textContent = data.board.name;
    $("logo").src = data.board.logo;
    $("desc").textContent = data.board.description;
    render(data.posts);
  }

  async function init(){
    if (!slug) { location.replace("boards.html"); return; }
    var me = await initNav();
    await load();
    $("composer").hidden = !me;
  }

  $("composer").addEventListener("submit", async function(e){
    e.preventDefault();
    var f = e.currentTarget, msg = $("msg"), btn = f.querySelector("button[type=submit]");
    msg.textContent = ""; btn.disabled = true;
    try { await api("/boards/" + encodeURIComponent(slug) + "/posts", "POST", Object.fromEntries(new FormData(f))); f.reset(); await load(); }
    catch (err) { msg.textContent = err.message; }
    btn.disabled = false;
  });

  init().catch(function(err){ $("posts").textContent = err.message; });
})();
