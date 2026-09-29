// Botones de la portada: llevan a las páginas de acceso.
(function(){
  document.querySelectorAll("[data-auth]").forEach(function(btn){
    btn.addEventListener("click", function(){
      location.href = btn.dataset.auth + ".html"; // login.html | register.html
    });
  });
})();
