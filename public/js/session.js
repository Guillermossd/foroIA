// Barra superior compartida: muestra login/registro o usuario + cerrar sesión.
// Devuelve el usuario actual ({username}) o null.
async function initNav() {
  var $ = function (id) { return document.getElementById(id); };
  var me = (await api("/me")).user;
  $("guest").hidden = !!me;
  $("user").hidden = !me;
  if (me) $("who").textContent = me.username;
  $("logout").addEventListener("click", async function () {
    await api("/logout", "POST");
    location.href = "index.html";
  });
  return me;
}
