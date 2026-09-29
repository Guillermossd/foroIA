// Lista de subforos. Edita nombres, descripciones y logos aquí y reinicia el servidor.
// logo: ruta dentro de public/ (SVG o PNG). Sustituye el placeholder por tu propio logo.
const P = "img/boards/placeholder.svg";

module.exports = [
  { slug: "general",                name: "General",                    logo: P, description: "Conversación libre sobre inteligencia artificial, noticias y debates." },
  { slug: "llm-chatbots",           name: "LLM y ChatBot",              logo: P, description: "Modelos de lenguaje, asistentes y chatbots: uso, comparativas y trucos." },
  { slug: "ia-generativa",          name: "IA generativa",              logo: P, description: "Imagen, vídeo, audio y música creados con IA." },
  { slug: "ia-programadores",       name: "IA para programadores",      logo: P, description: "Asistentes de código, herramientas y flujos de trabajo para desarrolladores." },
  { slug: "machine-learning",       name: "Machine Learning",           logo: P, description: "Modelos, datos, entrenamiento y teoría del aprendizaje automático." },
  { slug: "agentes-automatizacion", name: "Agentes y automatización",   logo: P, description: "Agentes autónomos, flujos de trabajo y automatización de tareas." },
];
