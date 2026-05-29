// region Componente Home | Funcionalidad | Estado inicial de navegacion
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);
// endregion

// region Componente Home | Funcionalidad | Malla gravitatoria reactiva
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
let gravityScrollProgress = 0;

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
  const scrollPhase = gravityScrollProgress * 2200;
  const scrollShiftX = (gravityScrollProgress * 38) % step;
  const scrollShiftY = (gravityScrollProgress * -94) % step;

  gravityPointer.x += (gravityPointer.targetX - gravityPointer.x) * 0.08;
  gravityPointer.y += (gravityPointer.targetY - gravityPointer.y) * 0.08;
  gravityPointer.force += (gravityPointer.targetForce - gravityPointer.force) * 0.06;

  gravityContext.clearRect(0, 0, width, height);
  gravityContext.lineWidth = 1;
  gravityContext.strokeStyle = "rgba(184, 190, 200, 0.16)";

  for (let y = -padding + scrollShiftY; y <= height + padding; y += step) {
    const points = [];

    for (let x = -padding; x <= width + padding; x += sample) {
      points.push({ x, y });
    }

    drawGravityLine(points, time + scrollPhase);
  }

  for (let x = -padding + scrollShiftX; x <= width + padding; x += step) {
    const points = [];

    for (let y = -padding; y <= height + padding; y += sample) {
      points.push({ x, y });
    }

    drawGravityLine(points, time + scrollPhase);
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

window.addEventListener("scroll", () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  gravityScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
}, { passive: true });

resizeGravityMesh();
drawGravityMesh();
// endregion

// region Componente Home | Funcionalidad | Particulas de fondo aleatorias
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

// region Componente Home | Funcionalidad | Medicion del ancho real del typewriter
const typewriterEl = document.querySelector(".hero-center__typewriter");

if (typewriterEl) {
  const originalWidth = typewriterEl.style.width;
  const originalOverflow = typewriterEl.style.overflow;
  const originalPosition = typewriterEl.style.position;
  const originalVisibility = typewriterEl.style.visibility;

  typewriterEl.style.width = "auto";
  typewriterEl.style.overflow = "visible";
  typewriterEl.style.position = "absolute";
  typewriterEl.style.visibility = "hidden";

  const fullWidth = typewriterEl.scrollWidth;

  typewriterEl.style.width = originalWidth;
  typewriterEl.style.overflow = originalOverflow;
  typewriterEl.style.position = originalPosition;
  typewriterEl.style.visibility = originalVisibility;

  typewriterEl.style.setProperty("--typewriter-width", `${fullWidth}px`);
}
// endregion

// region Componente Home | Funcionalidad | Menu hamburguesa y navegacion
const menuToggle = document.querySelector(".menu-toggle");
const menuButtons = Array.from(document.querySelectorAll(".top-menu__item"));
const sections = Array.from(document.querySelectorAll("section[id]"));
let activeMenuSection = null;
let menuFontPulseTimer = 0;

menuToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("is-menu-open");
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
});

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const sectionId = button.dataset.section;
    const targetSection = document.getElementById(sectionId);
    
    document.body.classList.remove("is-menu-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

function pulseActiveMenuButton(activeButton) {
  window.clearTimeout(menuFontPulseTimer);

  menuButtons.forEach((button) => {
    button.classList.remove("is-font-pulse");
  });

  if (!activeButton) {
    return;
  }

  activeButton.classList.add("is-font-pulse");
  menuFontPulseTimer = window.setTimeout(() => {
    activeButton.classList.remove("is-font-pulse");
  }, 320);
}

function updateActiveMenu() {
  const currentScrollY = window.scrollY;
  const scrollPosition = currentScrollY + window.innerHeight / 3;
  
  let currentSection = "home";
  
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      currentSection = section.id;
    }
  });
  
  let activeButton = null;

  menuButtons.forEach((button) => {
    const isActive = button.dataset.section === currentSection;
    button.classList.toggle("is-active", isActive);

    if (isActive) {
      activeButton = button;
    }
  });

  if (activeMenuSection !== null && activeMenuSection !== currentSection) {
    pulseActiveMenuButton(activeButton);
  }

  document.body.classList.toggle("is-home-active", currentSection === "home");
  document.body.classList.toggle("is-scrolled-down", currentScrollY > 24);
  activeMenuSection = currentSection;
}

window.addEventListener("scroll", updateActiveMenu, { passive: true });
updateActiveMenu();
// endregion

// region Componente Home | Funcionalidad | Animacion de secciones al hacer scroll
const sectionContents = Array.from(document.querySelectorAll(".section-content, .about-layout"));
const entryVisibilityRatio = 0.22;
const exitVisibilityRatio = 0.06;
const exitDebounceMs = 120;
const glitchCooldownMs = 420;
const pendingExitTimers = new WeakMap();
const latestIntersectionRatios = new WeakMap();
const lastGlitchTimes = new WeakMap();

const observerOptions = {
  threshold: [0, 0.06, 0.15, 0.22],
  rootMargin: "-50px 0px -50px 0px"
};

function getRandomExitDirection() {
  const directions = [
    { x: -180, y: -120, rotate: -12, scale: 0.7 },
    { x: 200, y: -100, rotate: 15, scale: 0.75 },
    { x: -220, y: 80, rotate: -18, scale: 0.65 },
    { x: 180, y: 120, rotate: 10, scale: 0.8 },
    { x: -150, y: -150, rotate: -8, scale: 0.72 },
    { x: 240, y: -80, rotate: 20, scale: 0.68 },
    { x: -200, y: 100, rotate: -14, scale: 0.78 },
    { x: 160, y: -140, rotate: 12, scale: 0.74 },
  ];
  return directions[Math.floor(Math.random() * directions.length)];
}

function applyExitDirection(element) {
  const x = Math.random() > 0.5 ? 200 : -200;
  element.style.setProperty("--exit-x", `${x}px`);
}

function clearGlitchState(element) {
  element.classList.remove("is-glitching");
  element.style.removeProperty("clip-path");
  element.style.removeProperty("filter");
}

function clearTitleGlitchState(element) {
  element.classList.remove("is-title-glitching");
}

function triggerEntryGlitch(element) {
  clearGlitchState(element);
  void element.offsetWidth;
  element.classList.add("is-glitching");
}

function triggerTitleGlitch(element) {
  clearTitleGlitchState(element);
  void element.offsetWidth;
  element.classList.add("is-title-glitching");
}

function triggerEntryGlitchWithCooldown(element) {
  const now = performance.now();
  const lastGlitchTime = lastGlitchTimes.get(element) || 0;

  if (now - lastGlitchTime < glitchCooldownMs) {
    return;
  }

  lastGlitchTimes.set(element, now);
  triggerEntryGlitch(element);
}

function cancelPendingExit(element) {
  const pendingTimer = pendingExitTimers.get(element);

  if (!pendingTimer) {
    return;
  }

  window.clearTimeout(pendingTimer);
  pendingExitTimers.delete(element);
}

function scheduleExit(element) {
  if (pendingExitTimers.has(element)) {
    return;
  }

  const timer = window.setTimeout(() => {
    pendingExitTimers.delete(element);
    const latestRatio = latestIntersectionRatios.get(element) || 0;

    if (latestRatio > exitVisibilityRatio || !element.classList.contains("is-visible")) {
      return;
    }

    clearGlitchState(element);
    clearTitleGlitchState(element);
    applyExitDirection(element);
    element.classList.add("is-exiting");
    element.classList.remove("is-visible");
  }, exitDebounceMs);

  pendingExitTimers.set(element, timer);
}

function handleGlitchAnimationEvent(event) {
  if (
    event.animationName !== "glitch-enter" &&
    event.animationName !== "glitch-flicker" &&
    event.animationName !== "glitch-title-enter"
  ) {
    return;
  }

  if (event.animationName === "glitch-enter" || event.type === "animationcancel") {
    clearGlitchState(event.currentTarget);
  }

  if (event.animationName === "glitch-title-enter" || event.type === "animationcancel") {
    clearTitleGlitchState(event.currentTarget);
  }
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    latestIntersectionRatios.set(entry.target, entry.intersectionRatio);

    if (entry.intersectionRatio >= entryVisibilityRatio) {
      cancelPendingExit(entry.target);
      const wasVisible = entry.target.classList.contains("is-visible");
      entry.target.classList.remove("is-exiting");

      if (!wasVisible) {
        entry.target.classList.add("is-visible");
        triggerTitleGlitch(entry.target);
      }
      return;
    }

    if (entry.intersectionRatio <= exitVisibilityRatio && entry.target.classList.contains("is-visible")) {
      scheduleExit(entry.target);
      return;
    }

    cancelPendingExit(entry.target);
  });
}, observerOptions);

sectionContents.forEach((content) => {
  content.addEventListener("animationend", handleGlitchAnimationEvent);
  content.addEventListener("animationcancel", handleGlitchAnimationEvent);
  sectionObserver.observe(content);
});
// endregion

// region Componente Home | Funcionalidad | Indicador de scroll
const scrollIndicator = document.querySelector(".scroll-indicator");

if (scrollIndicator) {
  scrollIndicator.addEventListener("click", () => {
    const aboutSection = document.getElementById("about");
    
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}
// endregion

// region Componente Home | Funcionalidad | Estelas de color con tamaño aleatorio
const colorTrails = document.querySelectorAll(".color-trail");

function randomizeTrailSize(trail) {
  const randomHeight = Math.floor(Math.random() * 200) + 150;
  trail.style.setProperty("--trail-height", `${randomHeight}px`);
}

colorTrails.forEach((trail) => {
  randomizeTrailSize(trail);
  
  trail.addEventListener("animationiteration", () => {
    randomizeTrailSize(trail);
  });
});
// endregion

// region Componente Home | Backend | Sin backend (frontend estatico)
// endregion
