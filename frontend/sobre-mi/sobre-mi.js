// region Componente Sobre Mi | Funcionalidad | Entrada de pagina
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);

const transitionSource = window.sessionStorage.getItem("portfolio-transition");
const initialSection = window.sessionStorage.getItem("portfolio-active-section") || "profile";
let currentSectionKey = initialSection;
const sectionOrder = ["profile", "projects", "skills", "experience", "contact"];
window.sessionStorage.removeItem("portfolio-transition");
window.sessionStorage.removeItem("portfolio-active-section");

const sectionContent = {
  profile: {
    eyebrow: "Seccion personal",
    title: "Sobre mi",
    description: "Soy un perfil orientado a construir interfaces claras, experiencias cuidadas y soluciones tecnicas sostenibles. Me interesa unir criterio visual, estructura de codigo y pequenas interacciones que hagan que cada proyecto se entienda rapido y se use sin friccion.",
  },
  projects: {
    eyebrow: "Seccion de trabajo",
    title: "Proyectos",
    description: "Seleccion de entregas tecnicas y productos funcionales, con foco en arquitectura, decisiones clave e impacto real en el uso.",
  },
  skills: {
    eyebrow: "Seccion tecnica",
    title: "Habilidades",
    description: "Resumen de capacidades aplicadas en desarrollo frontend, estructura de componentes, rendimiento y experiencia de usuario.",
  },
  experience: {
    eyebrow: "Trayectoria",
    title: "Experiencia",
    description: "Recorrido por responsabilidades, colaboraciones y resultados que han consolidado criterio tecnico y ritmo de entrega.",
  },
  contact: {
    eyebrow: "Comunicacion",
    title: "Contacto",
    description: "Canal directo para hablar de colaboraciones, propuestas y nuevos proyectos con una respuesta clara y enfocada.",
  },
};
const menuButtons = Array.from(document.querySelectorAll("[data-top-section]"));
const contentRoot = document.querySelector("[data-about-content]");
const eyebrow = document.querySelector("#about-eyebrow");
const title = document.querySelector("#about-title");
const description = document.querySelector("#about-description");
const menuToggle = document.querySelector(".menu-toggle");

menuToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("is-menu-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

window.requestAnimationFrame(() => {
  document.body.classList.add("is-menu-ready");
  document.body.classList.add("is-ready");
});

function setActiveMenu(sectionKey) {
  menuButtons.forEach((button) => {
    const isActive = button.dataset.topSection === sectionKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applySection(sectionKey, animate = true) {
  const oldSectionKey = currentSectionKey;
  const section = sectionContent[sectionKey] || sectionContent.profile;

  currentSectionKey = sectionKey;
  setActiveMenu(sectionKey);

  if (!animate) {
    eyebrow.textContent = section.eyebrow;
    title.textContent = section.title;
    description.textContent = section.description;
    return;
  }

  const oldIndex = sectionOrder.indexOf(oldSectionKey);
  const newIndex = sectionOrder.indexOf(sectionKey);
  const direction = newIndex >= oldIndex ? "down" : "up";

  // 1. Add exit class to fade/slide out
  const exitClass = direction === "down" ? "exit-left" : "exit-right";
  contentRoot.classList.remove("exit-left", "exit-right", "enter-from-left", "enter-from-right");
  contentRoot.classList.add(exitClass);

  window.setTimeout(() => {
    // 2. Update content
    eyebrow.textContent = section.eyebrow;
    title.textContent = section.title;
    description.textContent = section.description;

    // 3. Remove exit class and add start position of entry class
    contentRoot.classList.remove(exitClass);
    const enterClass = direction === "down" ? "enter-from-right" : "enter-from-left";
    contentRoot.classList.add(enterClass);

    // 4. Force reflow so the browser registers the entry start position
    void contentRoot.offsetWidth;

    // 5. Remove entry class to animate to normal center state
    contentRoot.classList.remove(enterClass);
  }, 400);
}

applySection(initialSection, false);

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextSection = button.dataset.topSection;

    document.body.classList.remove("is-menu-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");

    if (nextSection === "home") {
      navigateHome();
      return;
    }

    applySection(nextSection);
  });
});
// endregion

// region Componente Sobre Mi | Funcionalidad | Malla reactiva de fondo
const meshCanvas = document.querySelector("#about-mesh");
const meshContext = meshCanvas.getContext("2d");
const meshPointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
  force: transitionSource === "home-to-about" ? 0.22 : 0.08,
  targetForce: 0.08,
};
let meshPixelRatio = 1;
let meshAnimationFrame = 0;

function resizeMesh() {
  meshPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  meshCanvas.width = Math.round(window.innerWidth * meshPixelRatio);
  meshCanvas.height = Math.round(window.innerHeight * meshPixelRatio);
  meshCanvas.style.width = `${window.innerWidth}px`;
  meshCanvas.style.height = `${window.innerHeight}px`;
  meshContext.setTransform(meshPixelRatio, 0, 0, meshPixelRatio, 0, 0);
}

function distortPoint(x, y, time) {
  const waveX = Math.sin(y * 0.018 + time * 0.00018) * 5 + Math.sin((x + y) * 0.006) * 3;
  const waveY = Math.cos(x * 0.015 + time * 0.00016) * 5 + Math.sin((x - y) * 0.007) * 3;
  const baseX = x + waveX;
  const baseY = y + waveY;
  const dx = meshPointer.x - baseX;
  const dy = meshPointer.y - baseY;
  const distance = Math.hypot(dx, dy);
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.56;
  const pull = Math.max(0, 1 - distance / radius) ** 2 * meshPointer.force;
  const angle = Math.atan2(dy, dx);

  return {
    x: baseX + Math.cos(angle) * 8 * pull,
    y: baseY + Math.sin(angle) * 8 * pull,
  };
}

function drawLine(points, time) {
  meshContext.beginPath();

  points.forEach((point, index) => {
    const warped = distortPoint(point.x, point.y, time);

    if (index === 0) {
      meshContext.moveTo(warped.x, warped.y);
      return;
    }

    meshContext.lineTo(warped.x, warped.y);
  });

  meshContext.stroke();
}

function drawMesh(time = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const step = width < 700 ? 36 : 46;
  const sample = 16;
  const padding = step * 2;

  meshPointer.x += (meshPointer.targetX - meshPointer.x) * 0.08;
  meshPointer.y += (meshPointer.targetY - meshPointer.y) * 0.08;
  meshPointer.force += (meshPointer.targetForce - meshPointer.force) * 0.06;

  meshContext.clearRect(0, 0, width, height);
  meshContext.lineWidth = 1;
  meshContext.strokeStyle = "rgba(184, 190, 200, 0.16)";

  for (let y = -padding; y <= height + padding; y += step) {
    const points = [];

    for (let x = -padding; x <= width + padding; x += sample) {
      points.push({ x, y });
    }

    drawLine(points, time);
  }

  for (let x = -padding; x <= width + padding; x += step) {
    const points = [];

    for (let y = -padding; y <= height + padding; y += sample) {
      points.push({ x, y });
    }

    drawLine(points, time);
  }

  meshAnimationFrame = window.requestAnimationFrame(drawMesh);
}

window.addEventListener("resize", resizeMesh);
window.addEventListener("pointermove", (event) => {
  meshPointer.targetX = event.clientX;
  meshPointer.targetY = event.clientY;
  meshPointer.targetForce = 0.7;
});

window.addEventListener("pointerleave", () => {
  meshPointer.targetForce = 0.08;
});

resizeMesh();
drawMesh();
// endregion

// region Componente Sobre Mi | Funcionalidad | Navegacion hacia Home por scroll
let isNavigatingHome = false;
let isTransitioning = false;

function navigateHome() {
  if (isNavigatingHome) {
    return;
  }

  isNavigatingHome = true;
  document.body.classList.add("is-leaving-home");
  window.setTimeout(() => {
    window.sessionStorage.setItem("portfolio-transition", "about-to-home");
    window.location.href = "../home/index.html";
  }, 420);
}

window.addEventListener("wheel", (event) => {
  if (isTransitioning || isNavigatingHome) {
    return;
  }

  const currentIndex = sectionOrder.indexOf(currentSectionKey);

  if (event.deltaY > 18) {
    // Scroll DOWN: next section
    if (currentIndex < sectionOrder.length - 1) {
      const nextSection = sectionOrder[currentIndex + 1];
      isTransitioning = true;
      applySection(nextSection);
      setTimeout(() => {
        isTransitioning = false;
      }, 950);
    }
  } else if (event.deltaY < -18) {
    // Scroll UP: previous section or Home
    if (currentIndex === 0) {
      navigateHome();
    } else {
      const prevSection = sectionOrder[currentIndex - 1];
      isTransitioning = true;
      applySection(prevSection);
      setTimeout(() => {
        isTransitioning = false;
      }, 950);
    }
  }
}, { passive: true });

// Touch support for swiping gestures
let touchStartY = 0;

window.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0].clientY;
}, { passive: true });

window.addEventListener("touchend", (event) => {
  if (isTransitioning || isNavigatingHome) {
    return;
  }

  const touchEndY = event.changedTouches[0].clientY;
  const deltaY = touchStartY - touchEndY; // Positive is swipe UP (scrolling down)

  const currentIndex = sectionOrder.indexOf(currentSectionKey);

  if (deltaY > 50) {
    // Swipe UP / Scroll DOWN: next section
    if (currentIndex < sectionOrder.length - 1) {
      const nextSection = sectionOrder[currentIndex + 1];
      isTransitioning = true;
      applySection(nextSection);
      setTimeout(() => {
        isTransitioning = false;
      }, 950);
    }
  } else if (deltaY < -50) {
    // Swipe DOWN / Scroll UP: previous section or Home
    if (currentIndex === 0) {
      navigateHome();
    } else {
      const prevSection = sectionOrder[currentIndex - 1];
      isTransitioning = true;
      applySection(prevSection);
      setTimeout(() => {
        isTransitioning = false;
      }, 950);
    }
  }
}, { passive: true });
// endregion

// region Componente Sobre Mi | Backend | Sin backend (frontend estatico)
// endregion
