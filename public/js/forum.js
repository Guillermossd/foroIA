// Vista de un subforo: forum.html?b=<slug>
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var slug = new URLSearchParams(location.search).get("b");

  function render(posts){
    var box = $("posts");
    box.replaceChildren();
    if (!posts.length) { var p = document.createElement("p"); p.className = "hint"; p.textContent = "Aún no hay publicaciones en este subforo. Escribe la primera."; box.append(p); return; }
    posts.forEach(function(x){ box.append(renderPost(x, { onChange: load })); }); // renderPost: js/post-card.js
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
    renderSidebar(slug);
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
