// region Componente Home | Funcionalidad | Estado inicial de navegacion
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

// endregion

// region Componente Home | Funcionalidad | Menu hamburguesa y navegacion
const menuToggle = document.querySelector(".menu-toggle");
const menuButtons = Array.from(document.querySelectorAll(".top-menu__item"));
const sections = Array.from(document.querySelectorAll("section[id]"));
let activeMenuSection = null;
const menuCloseLayoutLockMs = 320;
let homeLayoutLockUntil = 0;

function closeMenu() {
  document.body.classList.remove("is-menu-open");
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
}

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

    if (window.matchMedia("(max-width: 900px)").matches) {
      closeMenu();
    }

    if (isLeavingHomeLayout) {
      window.setTimeout(() => {
        updateActiveMenu();
      }, menuCloseLayoutLockMs + 20);
    }
  });
});

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("is-menu-open")) {
    return;
  }

  const clickedInsideMenu = event.target.closest(".portfolio-top-menu");
  const clickedToggle = event.target.closest(".menu-toggle");

  if (!clickedInsideMenu && !clickedToggle) {
    if (window.matchMedia("(max-width: 900px)").matches) {
      closeMenu();
    }
  }
});

window.addEventListener("resize", () => {
  if (window.matchMedia("(max-width: 900px)").matches) {
    closeMenu();
  }
});

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
  
  menuButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === currentSection);
  });

  document.body.classList.toggle("is-home-active", currentSection === "home" || shouldKeepHomeLayout);
  document.body.classList.toggle("is-scrolled-down", currentScrollY > 24);
  // Solo se escribe al cambiar: cada escritura dispara observadores y recalculo de estilos
  if (document.body.dataset.section !== currentSection) {
    document.body.dataset.section = currentSection;
  }
  activeMenuSection = currentSection;
}

let activeMenuFrame = 0;
window.addEventListener("scroll", () => {
  if (activeMenuFrame) return;
  activeMenuFrame = window.requestAnimationFrame(() => {
    activeMenuFrame = 0;
    updateActiveMenu();
  });
}, { passive: true });
// La portada arranca arriba: no hace falta medir todas las secciones antes del primer pintado.
document.body.classList.add("is-home-active");
document.body.dataset.section = "home";
activeMenuSection = "home";
// endregion

// region Componente Home | Funcionalidad | Ocultar menu superpuesto al contenido
const topMenu = document.querySelector(".portfolio-top-menu");
const menuOverlapContent = Array.from(document.querySelectorAll(
  ".portfolio-container > section :is(h1, h2, h3, h4, p, img, li, a)"
));

function updateMenuNameOverlap() {
  let overlaps = false;

  if (window.matchMedia("(min-width: 901px)").matches && document.body.classList.contains("is-menu-open")) {
    const menuRect = topMenu.getBoundingClientRect();
    overlaps = menuOverlapContent.some((element) => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && menuRect.left < rect.right &&
        menuRect.right > rect.left && menuRect.top < rect.bottom && menuRect.bottom > rect.top;
    });
  }

  topMenu.classList.toggle("is-overlapping-name", overlaps);
}

// Se recalcula solo cuando algo puede cambiar el solapamiento (no en cada frame)
let menuOverlapFrame = 0;
function scheduleMenuNameOverlap() {
  if (menuOverlapFrame) return;
  menuOverlapFrame = window.requestAnimationFrame(() => {
    menuOverlapFrame = 0;
    updateMenuNameOverlap();
  });
}

if (topMenu) {
  window.addEventListener("scroll", () => {
    if (document.body.classList.contains("is-menu-open")) scheduleMenuNameOverlap();
  }, { passive: true });
  window.addEventListener("resize", scheduleMenuNameOverlap);
  // Solo interesa cuando el menu se abre o se cierra, no cualquier cambio de clase del body
  let wasMenuOpen = document.body.classList.contains("is-menu-open");
  new MutationObserver(() => {
    const isMenuOpen = document.body.classList.contains("is-menu-open");
    if (isMenuOpen === wasMenuOpen) return;
    wasMenuOpen = isMenuOpen;
    scheduleMenuNameOverlap();
    // La apertura del menu tiene transicion: se vuelve a medir cuando termina
    window.setTimeout(scheduleMenuNameOverlap, 480);
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  topMenu.addEventListener("transitionend", scheduleMenuNameOverlap);
  updateMenuNameOverlap();
}
// endregion
