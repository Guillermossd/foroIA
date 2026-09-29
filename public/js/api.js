// Cliente mínimo de la API. Lanza Error con el mensaje del servidor si algo falla.
async function api(path, method = "GET", body) {
  const res = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    var msg = data.error || "Error inesperado.";
    if (res.status === 404) msg += " (" + method + " /api" + path + ")"; // ayuda a detectar archivos desactualizados
    throw new Error(msg);
  }
  return data;
}
