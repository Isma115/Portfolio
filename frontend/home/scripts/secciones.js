// region Componente Home | Funcionalidad | Animacion de secciones al hacer scroll
const sectionContents = Array.from(document.querySelectorAll(".section-content"));
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


// region Logica Pagina Home: transicion hacia la pagina de novedades
const newsLinks = Array.from(document.querySelectorAll("[data-news-link]"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const newsNavigationDelay = 980;
let isNavigatingToNews = false;

newsLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const opensInNewContext = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    if (opensInNewContext || prefersReducedMotion.matches || isNavigatingToNews) {
      return;
    }

    event.preventDefault();
    isNavigatingToNews = true;
    document.body.classList.add("is-navigating-to-news");
    document.body.setAttribute("aria-busy", "true");

    window.setTimeout(() => {
      window.location.assign(link.href);
    }, newsNavigationDelay);
  });
});
// endregion

// region Componente Home | Funcionalidad | Indicador de scroll
const scrollIndicators = Array.from(document.querySelectorAll(".scroll-indicator"));
let scrollHideTimer = null;

window.addEventListener("scroll", () => {
  document.body.classList.add("is-user-scrolling");
  window.clearTimeout(scrollHideTimer);
  scrollHideTimer = window.setTimeout(() => {
    document.body.classList.remove("is-user-scrolling");
  }, 450);
}, { passive: true });

if (scrollIndicators.length) {
  const scrollIndicatorObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      window.setTimeout(() => {
        entry.target.classList.add("is-ready");
      }, 300);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  scrollIndicators.forEach((indicator) => {
    scrollIndicatorObserver.observe(indicator);
  });

  scrollIndicators.forEach((indicator) => {
    indicator.addEventListener("click", () => {
      const currentSection = indicator.closest("section");
      const sections = Array.from(document.querySelectorAll("section[id]"));
      const currentSectionIndex = sections.indexOf(currentSection);
      const nextSection = sections[currentSectionIndex + 1];

      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}
// endregion

