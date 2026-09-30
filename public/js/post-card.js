// Tarjeta de un hilo, compartida por forum.js (subforo) y board-list.js (últimas publicaciones).
// Si el hilo es del usuario (x.mine) muestra arriba a la derecha un lápiz (editar) y una papelera (eliminar).
// opts: { showBoard, clamp, onChange }  · onChange se llama tras editar o eliminar para recargar la lista.
var renderPost = (function(){
  // Iconos (SVG estático, sin datos del usuario)
  var ICONS = {
    edit:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg>'
  };

  function fmt(s){ return new Date(s.replace(" ", "T") + "Z").toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }); }
  function el(tag, cls, text){ var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function iconBtn(kind, label, danger){
    var b = el("button", "icon-btn" + (danger ? " icon-btn--danger" : ""));
    b.type = "button"; b.title = label; b.setAttribute("aria-label", label);
    b.innerHTML = ICONS[kind];
    return b;
  }

  return function(x, opts){
    opts = opts || {};
    var art = el("article", "post" + (x.mine ? " post--mine" : ""));

    // Contenido del hilo
    var h = el("h3", null, x.title);
    var m = el("div", "meta");
    if (opts.showBoard) {
      var a = el("a", "link", x.board_name);
      a.href = "forum.html?b=" + encodeURIComponent(x.board_slug);
      m.append(a, document.createTextNode(" · "));
    }
    m.append(document.createTextNode(x.username + " · " + fmt(x.created_at) + (x.edited_at ? " · editado" : "")));
    var b = el("p", "body" + (opts.clamp ? " clamp" : ""), x.body); // textContent evita inyección de HTML

    // Iconos de editar / eliminar (solo si el hilo es tuyo)
    var actions = null;
    if (x.mine) {
      actions = el("div", "post__actions");
      var ed = iconBtn("edit", "Editar"), del = iconBtn("trash", "Eliminar", true);
      ed.addEventListener("click", startEdit);
      del.addEventListener("click", remove);
      actions.append(ed, del);
    }

    function show(){ art.replaceChildren.apply(art, actions ? [actions, h, m, b] : [h, m, b]); }
    function reload(){ if (opts.onChange) opts.onChange(); }

    // Eliminar
    async function remove(){
      if (!confirm("¿Eliminar esta publicación? Esta acción no se puede deshacer.")) return;
      try { await api("/posts/" + x.id, "DELETE"); reload(); }
      catch (err) { alert(err.message); }
    }

    // Editar: sustituye el contenido por un formulario
    function startEdit(){
      var f = el("form", "stack");
      var lt = el("label", null, "Título");
      var ti = el("input"); ti.name = "title"; ti.value = x.title; ti.required = true; ti.minLength = 3; ti.maxLength = 120; lt.append(ti);
      var lb = el("label", null, "Texto");
      var ta = el("textarea"); ta.name = "body"; ta.value = x.body; ta.required = true; ta.maxLength = 5000; lb.append(ta);
      var msg = el("div", "msg"); msg.setAttribute("role", "alert");
      var row = el("div", "form-row");
      var save = el("button", "btn btn--solid btn--sm", "Guardar"); save.type = "submit";
      var cancel = el("button", "btn btn--ghost btn--sm", "Cancelar"); cancel.type = "button";
      row.append(save, cancel);
      f.append(lt, lb, msg, row);

      cancel.addEventListener("click", show);
      f.addEventListener("submit", async function(e){
        e.preventDefault(); save.disabled = true; msg.textContent = "";
        try { await api("/posts/" + x.id, "PUT", { title: ti.value, body: ta.value }); reload(); }
        catch (err) { msg.textContent = err.message; save.disabled = false; }
      });
      art.replaceChildren(f);
      ti.focus();
    }

    show();
    return art;
  };
})();
