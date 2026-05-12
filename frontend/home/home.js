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

// region Logica Pagina Home: malla gravitatoria reactiva
const gravityCanvas = document.querySelector("#gravity-mesh");
const gravityContext = gravityCanvas.getContext("2d");
const backgroundParticles = Array.from(document.querySelectorAll(".background-particles span"));
const gravityPointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
  force: 0,
  targetForce: 0,
};
let gravityPixelRatio = 1;
let gravityAnimationFrame = 0;

function resizeGravityMesh() {
  gravityPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  gravityCanvas.width = Math.round(window.innerWidth * gravityPixelRatio);
  gravityCanvas.height = Math.round(window.innerHeight * gravityPixelRatio);
  gravityCanvas.style.width = `${window.innerWidth}px`;
  gravityCanvas.style.height = `${window.innerHeight}px`;
  gravityContext.setTransform(gravityPixelRatio, 0, 0, gravityPixelRatio, 0, 0);
}

function distortGravityPoint(x, y, time) {
  const unevenX = Math.sin(y * 0.018 + time * 0.00018) * 5 + Math.sin((x + y) * 0.006) * 3;
  const unevenY = Math.cos(x * 0.015 + time * 0.00016) * 5 + Math.sin((x - y) * 0.007) * 3;
  const baseX = x + unevenX;
  const baseY = y + unevenY;
  const dx = gravityPointer.x - baseX;
  const dy = gravityPointer.y - baseY;
  const distance = Math.hypot(dx, dy);
  const radius = Math.min(window.innerWidth, window.innerHeight) * 0.56;
  const pull = Math.max(0, 1 - distance / radius) ** 2 * gravityPointer.force;
  const wave = Math.sin(distance * 0.006 - time * 0.00055) * 3.2 * pull;
  const gravity = 6 * pull + wave;
  const angle = Math.atan2(dy, dx);
  const orbit = Math.sin(time * 0.00045 + distance * 0.004) * 2.2 * pull;

  return {
    x: baseX + Math.cos(angle) * gravity + Math.cos(angle + Math.PI / 2) * orbit,
    y: baseY + Math.sin(angle) * gravity + Math.sin(angle + Math.PI / 2) * orbit,
  };
}

function drawGravityLine(points, time) {
  gravityContext.beginPath();

  points.forEach((point, index) => {
    const warped = distortGravityPoint(point.x, point.y, time);

    if (index === 0) {
      gravityContext.moveTo(warped.x, warped.y);
      return;
    }

    gravityContext.lineTo(warped.x, warped.y);
  });

  gravityContext.stroke();
}

function drawGravityMesh(time = 0) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const step = width < 700 ? 36 : 46;
  const sample = 16;
  const padding = step * 2;

  gravityPointer.x += (gravityPointer.targetX - gravityPointer.x) * 0.08;
  gravityPointer.y += (gravityPointer.targetY - gravityPointer.y) * 0.08;
  gravityPointer.force += (gravityPointer.targetForce - gravityPointer.force) * 0.06;

  gravityContext.clearRect(0, 0, width, height);
  gravityContext.lineWidth = 1;
  gravityContext.strokeStyle = "rgba(184, 190, 200, 0.16)";

  for (let y = -padding; y <= height + padding; y += step) {
    const points = [];

    for (let x = -padding; x <= width + padding; x += sample) {
      points.push({ x, y });
    }

    drawGravityLine(points, time);
  }

  for (let x = -padding; x <= width + padding; x += step) {
    const points = [];

    for (let y = -padding; y <= height + padding; y += sample) {
      points.push({ x, y });
    }

    drawGravityLine(points, time);
  }

  if (gravityPointer.force > 0.02) {
    const glow = gravityContext.createRadialGradient(gravityPointer.x, gravityPointer.y, 0, gravityPointer.x, gravityPointer.y, 180);
    glow.addColorStop(0, `rgba(184, 190, 200, ${0.05 * gravityPointer.force})`);
    glow.addColorStop(1, "rgba(184, 190, 200, 0)");
    gravityContext.fillStyle = glow;
    gravityContext.fillRect(0, 0, width, height);
}

  gravityAnimationFrame = window.requestAnimationFrame(drawGravityMesh);
}

window.addEventListener("resize", resizeGravityMesh);
window.addEventListener("pointermove", (event) => {
  gravityPointer.targetX = event.clientX;
  gravityPointer.targetY = event.clientY;
  gravityPointer.targetForce = 0.7; 
});

window.addEventListener("pointerleave", () => {
  gravityPointer.targetForce = 0.07; 
});

resizeGravityMesh();
drawGravityMesh();
// endregion

// region Logica Pagina Home: particulas de fondo aleatorias
const particleSymbols = ["+", "x", "{}", "[]", "</>", "@", "#"];

function randomizeParticle(particle) {
  const size = Math.round(11 + Math.random() * 10);
  const delay = Math.round(Math.random() * 2200);
  const symbol = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];

  particle.style.setProperty("--x", `${Math.round(4 + Math.random() * 92)}%`);
  particle.style.setProperty("--y", `${Math.round(6 + Math.random() * 88)}%`);
  particle.style.setProperty("--size", `${size}px`);
  particle.style.setProperty("--delay", `${delay}ms`);
  particle.textContent = symbol;
}

backgroundParticles.forEach((particle) => {
  randomizeParticle(particle);

  particle.addEventListener("animationiteration", () => {
    randomizeParticle(particle);
  });
});
// endregion

// region Logica Pagina Home: actualizacion de seccion activa
const tabs = Array.from(document.querySelectorAll(".section-tab"));
const image = document.querySelector("#section-image");
const title = document.querySelector("#home-title");
const description = document.querySelector("#section-description");
const panel = document.querySelector("[data-section-panel]");
let selectedSectionKey = "profile";
let imageChangeTimer = 0;
let clickGlitchTimer = 0;

function updatePanel(sectionKey, options = {}) {
  const section = sections[sectionKey];
  const shouldAnimate = options.animate !== false;

  if (!section) {
    return;
  }

  window.clearTimeout(imageChangeTimer);

  const applySection = () => {
    image.src = section.image;
    image.alt = section.alt;
    title.textContent = section.title;
    title.dataset.title = section.title;
    title.setAttribute("aria-label", section.title);
    description.textContent = section.description;
    panel.dataset.activeSection = sectionKey;
    image.classList.remove("is-changing");
  };

  if (shouldAnimate) {
    image.classList.add("is-changing");
    imageChangeTimer = window.setTimeout(applySection, 120);
    return;
  }

  applySection();
}

function markActiveSection(sectionKey) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.section === sectionKey;

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });
}

function triggerClickGlitch(tab) {
  window.clearTimeout(clickGlitchTimer);
  tabs.forEach((item) => item.classList.add("has-entered"));
  tabs.forEach((item) => item.classList.remove("is-click-glitch"));
  void tab.offsetWidth;

  window.requestAnimationFrame(() => {
    tab.classList.add("is-click-glitch");

    clickGlitchTimer = window.setTimeout(() => {
      tab.classList.remove("is-click-glitch");
    }, 940);
  });
}

function setActiveSection(sectionKey, tab) {
  selectedSectionKey = sectionKey;
  markActiveSection(sectionKey);
  updatePanel(sectionKey);

  if (tab) {
    triggerClickGlitch(tab);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("animationend", (event) => {
    if (event.animationName === "section-tab-enter") {
      tab.classList.add("has-entered");
    }
  });

  tab.addEventListener("pointerenter", () => {
    updatePanel(tab.dataset.section);
  });

  tab.addEventListener("pointerleave", () => {
    updatePanel(selectedSectionKey);
  });

  tab.addEventListener("focus", () => {
    updatePanel(tab.dataset.section);
  });

  tab.addEventListener("blur", () => {
    updatePanel(selectedSectionKey);
  });

  tab.addEventListener("click", () => {
    setActiveSection(tab.dataset.section, tab);
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
