// Gestiona login.html y register.html (form[data-auth-form="login|register"]).
(function(){
  var form = document.querySelector("form[data-auth-form]");
  var msg = document.getElementById("msg");
  form.addEventListener("submit", async function(e){
    e.preventDefault();
    msg.textContent = "";
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      await api("/" + form.dataset.authForm, "POST", Object.fromEntries(new FormData(form)));
      location.href = "boards.html";
    } catch (err) {
      msg.textContent = err.message;
      btn.disabled = false;
    }
  });
})();
