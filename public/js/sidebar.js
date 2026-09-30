// Barra lateral de subforos (icono a la izquierda del nombre). activeSlug marca el subforo actual.
async function renderSidebar(activeSlug) {
  var nav = document.getElementById("side-boards");
  try {
    var data = await api("/boards");
    nav.replaceChildren.apply(nav, data.boards.map(function (b) {
      var a = document.createElement("a");
      a.className = "side__item" + (b.slug === activeSlug ? " is-active" : "");
      a.href = "forum.html?b=" + encodeURIComponent(b.slug);
      if (b.slug === activeSlug) a.setAttribute("aria-current", "page");
      var img = document.createElement("img"); img.className = "logo logo--sm"; img.src = b.logo; img.alt = "";
      var name = document.createElement("span"); name.textContent = b.name;
      a.append(img, name);
      return a;
    }));
  } catch (err) {
    nav.textContent = err.message;
  }
}
