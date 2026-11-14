// region Componente Home | Funcionalidad | Animacion de secciones al hacer scroll
const sectionContents = Array.from(document.querySelectorAll(".section-content"));
const entryVisibilityRatio = 0.22;
// Temporal: revelar una sola vez y mantener visible al salir de pantalla.
const observerOptions = {
  threshold: [0, entryVisibilityRatio],
  rootMargin: "-50px 0px -50px 0px"
};

function clearTitleGlitchState(element) {
  element.classList.remove("is-title-glitching");
}

function triggerTitleGlitch(element) {
  clearTitleGlitchState(element);
  void element.offsetWidth;
  element.classList.add("is-title-glitching");
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
    if (entry.intersectionRatio < entryVisibilityRatio) return;
    if (!entry.target.classList.contains("is-visible")) {
      entry.target.classList.add("is-visible");
      triggerTitleGlitch(entry.target);
    }
    sectionObserver.unobserve(entry.target);
  });
}, observerOptions);

sectionContents.forEach((content) => {
  content.addEventListener("animationend", handleGlitchAnimationEvent);
  content.addEventListener("animationcancel", handleGlitchAnimationEvent);
  sectionObserver.observe(content);
});
// endregion


// region Componente Home | Funcionalidad | Indicador de scroll
// Ajusta suavemente solo cuando el desplazamiento termina cerca de una sección.
(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sections = Array.from(document.querySelectorAll(".portfolio-container > section"));
  let timer;
  let frame;
  let snapping = false;
  let lastScrollY = window.scrollY;

  function cancelSnap() {
    window.clearTimeout(timer);
    window.cancelAnimationFrame(frame);
    snapping = false;
  }

  ["wheel", "touchstart", "pointerdown", "keydown"].forEach((event) => {
    window.addEventListener(event, cancelSnap, { passive: true });
  });

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const scrollDirection = currentScrollY >= lastScrollY ? 1 : -1;
    lastScrollY = currentScrollY;

    if (snapping || motion.matches) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const start = window.scrollY;
      const nearest = sections.reduce((best, section) => {
        const top = section.getBoundingClientRect().top + window.scrollY;
        return best === null || Math.abs(top - start) < Math.abs(best - start) ? top : best;
      }, null);
      if (nearest === null) return;

      const distance = nearest - start;
      if (Math.abs(distance) < 2 || Math.abs(distance) > window.innerHeight * 0.4) return;
      if (distance * scrollDirection <= 0) return;

      snapping = true;
      let started;
      function animate(time) {
        if (started === undefined) started = time;
        const progress = Math.min((time - started) / 650, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo({ top: start + (nearest - start) * ease, behavior: "instant" });
        if (progress < 1) frame = window.requestAnimationFrame(animate);
        else snapping = false;
      }
      frame = window.requestAnimationFrame(animate);
    }, 180);
  }, { passive: true });
})();

const scrollIndicators = Array.from(document.querySelectorAll(".scroll-indicator"));
const navigationSections = Array.from(document.querySelectorAll(".portfolio-container > section"));
navigationSections.slice(1).forEach((section, index) => {
  const zone = document.createElement("div");
  zone.className = "section-up-zone";
  const button = document.createElement("button");
  button.className = "section-up-button";
  button.type = "button";
  button.setAttribute("aria-label", "Ir a la sección anterior");
  button.innerHTML = '<span aria-hidden="true"></span>';
  button.addEventListener("click", () => navigationSections[index].scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start"
  }));
  zone.appendChild(button);
  section.prepend(zone);
});
// Marca las secciones fuera de pantalla para pausar sus animaciones infinitas (ver animaciones.css)
if ("IntersectionObserver" in window) {
  const offscreenObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-offscreen", !entry.isIntersecting));
  });
  navigationSections.forEach((section) => offscreenObserver.observe(section));
}
let scrollHideTimer = null;

window.addEventListener("scroll", () => {
  // classList.add reescribe el atributo aunque la clase ya exista, disparando observadores
  // y recalculo de estilos en cada evento de scroll: solo se añade si falta
  if (!document.body.classList.contains("is-user-scrolling")) {
    document.body.classList.add("is-user-scrolling");
  }
  window.clearTimeout(scrollHideTimer);
  scrollHideTimer = window.setTimeout(() => {
    document.body.classList.remove("is-user-scrolling");
  }, 200);
}, { passive: true });

if (scrollIndicators.length) {
  const scrollIndicatorObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      window.setTimeout(() => {
        entry.target.classList.add("is-ready");
      }, 100);
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



// region Componente Home | Funcionalidad | Decodificacion de textos
// Los titulos aparecen "descifrandose": cada letra pasa por caracteres aleatorios hasta fijarse.
// Trabaja sobre los nodos de texto, asi que respeta los <span> internos.
window.scrambleText = (() => {
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+/<>=_";
  const running = new WeakMap();
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  return function scrambleText(element, { duration = 750, delay = 0 } = {}) {
    if (!element || motion.matches) return;
    const previous = running.get(element);
    if (previous) {
      window.cancelAnimationFrame(previous.frame);
      window.clearTimeout(previous.timer);
    }

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.nodeValue.trim()) {
        node.originalText = node.originalText ?? node.nodeValue;
        nodes.push(node);
      }
    }
    if (!nodes.length) return;

    const totalLength = nodes.reduce((sum, node) => sum + node.originalText.length, 0);
    if (!element.hasAttribute("aria-label")) {
      element.setAttribute("aria-label", nodes.map((node) => node.originalText).join("").trim());
      element.dataset.scrambleLabel = "true";
    }

    const state = {};
    running.set(element, state);

    const render = (progress) => {
      let offset = 0;
      nodes.forEach((node) => {
        const original = node.originalText;
        node.nodeValue = Array.from(original, (char, index) => {
          if (char.trim() === "") return char;
          if (progress >= (offset + index) / totalLength) return char;
          return glyphs[Math.floor(Math.random() * glyphs.length)];
        }).join("");
        offset += original.length;
      });
    };

    const finish = () => {
      nodes.forEach((node) => { node.nodeValue = node.originalText; });
      if (element.dataset.scrambleLabel) {
        element.removeAttribute("aria-label");
        delete element.dataset.scrambleLabel;
      }
    };

    render(0);
    state.timer = window.setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        render(progress * 1.05);
        if (progress < 1) {
          state.frame = window.requestAnimationFrame(tick);
        } else {
          finish();
        }
      };
      state.frame = window.requestAnimationFrame(tick);
    }, delay);
  };
})();
// endregion


// region Componente Home | Funcionalidad | Entrada escalonada de componentes
// Marca los componentes de cada seccion para que aparezcan uno tras otro con su propio estilo.
(() => {
  const revealGroups = {
    skills: ".skills-section-heading__eyebrow, .skills-section-heading h3, .skills-group__title, .skills-list li",
    experience: ".experience-card, .experience-card__logo, .experience-card__meta, .experience-card__description",
    contact: ".contact-card",
  };
  const maxStagger = 14;
  const scrambleSelector = ".skills-section-heading__eyebrow, .skills-section-heading h3, .skills-group__title, .experience-card__meta";

  Object.entries(revealGroups).forEach(([sectionId, selector]) => {
    const content = document.querySelector(`#${sectionId} .section-content`);
    if (!content) return;

    content.dataset.reveal = sectionId;
    content.querySelectorAll(selector).forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-index", Math.min(index, maxStagger));
    });

    // Al hacerse visible la seccion, los titulos se descifran siguiendo el mismo orden escalonado
    const scrambleTargets = Array.from(content.querySelectorAll(scrambleSelector));
    new MutationObserver(() => {
      const isVisible = content.classList.contains("is-visible");
      if (isVisible && !content.dataset.scrambled) {
        content.dataset.scrambled = "true";
        scrambleTargets.forEach((target) => {
          const index = Number(target.style.getPropertyValue("--reveal-index")) || 0;
          window.scrambleText(target, { delay: index * 60 + 220 });
        });
      } else if (!isVisible) {
        delete content.dataset.scrambled;
      }
    }).observe(content, { attributes: true, attributeFilter: ["class"] });
  });
})();
// endregion
