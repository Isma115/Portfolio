// region Logica Pagina Home: datos de secciones
const sections = {
  profile: {
    title: "Sobre mi",
    description: "Una entrada directa al perfil profesional, con una imagen clara para reconocer la seccion activa del portfolio.",
    image: "./assets/profile.svg",
    alt: "Ilustracion simplificada de perfil profesional",
  },
  projects: {
    title: "Proyectos",
    description: "Acceso a trabajos destacados, prototipos y piezas tecnicas organizadas para revisar el alcance de cada entrega.",
    image: "./assets/projects.svg",
    alt: "Ilustracion simplificada de proyectos de software",
  },
  skills: {
    title: "Habilidades",
    description: "Mapa visual de competencias, herramientas y capacidades tecnicas que sostienen el trabajo profesional.",
    image: "./assets/skills.svg",
    alt: "Ilustracion simplificada de habilidades tecnicas",
  },
  experience: {
    title: "Experiencia",
    description: "Linea de recorrido profesional preparada para conectar responsabilidades, impacto y aprendizaje acumulado.",
    image: "./assets/experience.svg",
    alt: "Ilustracion simplificada de experiencia profesional",
  },
  contact: {
    title: "Contacto",
    description: "Punto de salida para iniciar una conversacion profesional y conectar por los canales disponibles.",
    image: "./assets/contact.svg",
    alt: "Ilustracion simplificada de contacto profesional",
  },
};
// endregion

// region Logica Pagina Home: actualizacion de seccion activa
const tabs = Array.from(document.querySelectorAll(".section-tab"));
const image = document.querySelector("#section-image");
const title = document.querySelector("#home-title");
const description = document.querySelector("#section-description");
const panel = document.querySelector("[data-section-panel]");

function setActiveSection(sectionKey) {
  const section = sections[sectionKey];

  if (!section) {
    return;
  }

  tabs.forEach((tab) => {
    const isActive = tab.dataset.section === sectionKey;

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  image.classList.add("is-changing");

  window.setTimeout(() => {
    image.src = section.image;
    image.alt = section.alt;
    title.textContent = section.title;
    title.dataset.title = section.title;
    title.setAttribute("aria-label", section.title);
    description.textContent = section.description;
    panel.dataset.activeSection = sectionKey;
    image.classList.remove("is-changing");
  }, 140);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveSection(tab.dataset.section);
  });
});

panel.addEventListener("pointermove", (event) => {
  const bounds = panel.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -10;

  panel.style.setProperty("--tilt-x", `${y.toFixed(2)}deg`);
  panel.style.setProperty("--tilt-y", `${x.toFixed(2)}deg`);
});

panel.addEventListener("pointerleave", () => {
  panel.style.setProperty("--tilt-x", "0deg");
  panel.style.setProperty("--tilt-y", "0deg");
});
// endregion
