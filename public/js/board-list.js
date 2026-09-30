// boards.html: barra lateral + últimas publicaciones de todos los subforos.
(function(){
  var feed = document.getElementById("feed");

  function loadFeed(){
    return api("/latest").then(function(data){
      if (!data.posts.length) { feed.textContent = "Aún no hay publicaciones. Elige un subforo y escribe la primera."; return; }
      feed.replaceChildren.apply(feed, data.posts.map(function(x){
        return renderPost(x, { showBoard: true, clamp: true, onChange: loadFeed }); // renderPost: js/post-card.js
      }));
    }).catch(function(err){
      feed.textContent = "No se pudieron cargar las publicaciones: " + err.message;
    });
  }

  // Cada parte es independiente: si una falla, las demás siguen.
  initNav().catch(function(){});
  renderSidebar(null);
  loadFeed();
})();
