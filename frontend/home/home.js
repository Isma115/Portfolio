// region Componente Home | Funcionalidad | Estado inicial de navegacion
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);
// endregion

// region Componente Home | Funcionalidad | Topografia fluida reactiva
const topographicCanvas = document.querySelector("#topographic-flow");
const topographicContext = topographicCanvas?.getContext("2d");
const backgroundParticles = Array.from(document.querySelectorAll(".background-particles span"));
const topographicPointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
  force: 0,
  targetForce: 0,
};
let topographicPixelRatio = 1;
let topographicScrollProgress = 0;

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function hash2D(x, y) {
  const seed = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return seed - Math.floor(seed);
}

function valueNoise2D(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const sx = smoothstep(x - x0);
  const sy = smoothstep(y - y0);

  const n00 = hash2D(x0, y0);
  const n10 = hash2D(x1, y0);
  const n01 = hash2D(x0, y1);
  const n11 = hash2D(x1, y1);

  const nx0 = lerp(n00, n10, sx);
  const nx1 = lerp(n01, n11, sx);
  return lerp(nx0, nx1, sy);
}

function resizeTopographicFlow() {
  if (!topographicCanvas || !topographicContext) {
    return;
  }

  topographicPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  topographicCanvas.width = Math.round(window.innerWidth * topographicPixelRatio);
  topographicCanvas.height = Math.round(window.innerHeight * topographicPixelRatio);
  topographicCanvas.style.width = `${window.innerWidth}px`;
  topographicCanvas.style.height = `${window.innerHeight}px`;
  topographicContext.setTransform(topographicPixelRatio, 0, 0, topographicPixelRatio, 0, 0);
}

function drawTopographicFlow(time = 0) {
  if (!topographicContext) {
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const lineCount = width < 700 ? 34 : 44;
  const amplitude = width < 700 ? 24 : 34;
  const sampleStep = width < 700 ? 12 : 14;
  const sidePadding = 80;
  const scrollDrift = topographicScrollProgress * 460;

  topographicPointer.x += (topographicPointer.targetX - topographicPointer.x) * 0.08;
  topographicPointer.y += (topographicPointer.targetY - topographicPointer.y) * 0.08;
  topographicPointer.force += (topographicPointer.targetForce - topographicPointer.force) * 0.05;

  topographicContext.clearRect(0, 0, width, height);
  topographicContext.lineWidth = 1.05;

  for (let index = 0; index < lineCount; index += 1) {
    const t = index / (lineCount - 1);
    const baseY = -30 + t * (height + 60);
    const red = Math.round(122 + t * 52);
    const green = Math.round(140 + t * 38);
    const blue = Math.round(170 + t * 34);
    const alpha = 0.1 + (1 - Math.abs(t - 0.5) * 1.7) * 0.14;

    topographicContext.beginPath();

    for (let x = -sidePadding; x <= width + sidePadding; x += sampleStep) {
      const waveA = Math.sin(x * 0.011 + time * 0.00042 + index * 0.52) * amplitude * 0.44;
      const waveB = Math.cos(x * 0.0043 - time * 0.0003 + index * 0.35) * amplitude * 0.3;
      const noise = (valueNoise2D(x * 0.0046 + time * 0.00008, baseY * 0.006 - scrollDrift * 0.0018) - 0.5) * amplitude * 1.3;
      const dx = x - topographicPointer.x;
      const dy = baseY - topographicPointer.y;
      const distance = Math.hypot(dx, dy);
      const reach = Math.min(width, height) * 0.5;
      const pull = Math.max(0, 1 - distance / reach) ** 2 * topographicPointer.force;
      const ripple = Math.sin(distance * 0.038 - time * 0.0026) * 18 * pull;
      const swirl = Math.sin((x + baseY) * 0.004 + time * 0.0007) * 7 * pull;
      const y = baseY + waveA + waveB + noise + ripple + swirl;

      if (x === -sidePadding) {
        topographicContext.moveTo(x, y);
      } else {
        topographicContext.lineTo(x, y);
      }
    }

    topographicContext.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${Math.max(0.04, alpha)})`;
    topographicContext.stroke();
  }

  window.requestAnimationFrame(drawTopographicFlow);
}

if (topographicCanvas && topographicContext) {
  window.addEventListener("resize", resizeTopographicFlow);

  window.addEventListener("pointermove", (event) => {
    topographicPointer.targetX = event.clientX;
    topographicPointer.targetY = event.clientY;
    topographicPointer.targetForce = 0.72;
  });

  window.addEventListener("pointerleave", () => {
    topographicPointer.targetForce = 0.08;
  });

  window.addEventListener("scroll", () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    topographicScrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }, { passive: true });

  resizeTopographicFlow();
  drawTopographicFlow();
}
// endregion

// region Componente Home | Funcionalidad | Particulas de fondo aleatorias
const particleSymbols = ["+", "x", "{}", "[]", "</>", "@", "#"];

function randomizeParticle(particle) {
  const size = Math.round(11 + Math.random() * 10);
  const delay = Math.round(Math.random() * 6800);
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
const menuCloseLayoutLockMs = 320;
let homeLayoutLockUntil = 0;

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
    const isLeavingHomeLayout = document.body.classList.contains("is-home-active") && sectionId !== "home";

    if (isLeavingHomeLayout) {
      homeLayoutLockUntil = window.performance.now() + menuCloseLayoutLockMs;
      document.body.classList.add("is-home-active");
    }
    
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (isLeavingHomeLayout) {
      window.setTimeout(() => {
        updateActiveMenu();
      }, menuCloseLayoutLockMs + 20);
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
  const shouldKeepHomeLayout = window.performance.now() < homeLayoutLockUntil;
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

  document.body.classList.toggle("is-home-active", currentSection === "home" || shouldKeepHomeLayout);
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
const pendingExitTimers = new WeakMap();
const latestIntersectionRatios = new WeakMap();

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

function clearTitleGlitchState(element) {
  element.classList.remove("is-title-glitching");
}

function triggerTitleGlitch(element) {
  clearTitleGlitchState(element);
  void element.offsetWidth;
  element.classList.add("is-title-glitching");
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

    clearTitleGlitchState(element);
    applyExitDirection(element);
    element.classList.add("is-exiting");
    element.classList.remove("is-visible");
  }, exitDebounceMs);

  pendingExitTimers.set(element, timer);
}

function handleGlitchAnimationEvent(event) {
  if (event.animationName !== "glitch-flicker" && event.animationName !== "glitch-title-enter") {
    return;
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
