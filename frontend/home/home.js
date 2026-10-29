// region Componente Home | Funcionalidad | Estado inicial de navegacion
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.scrollTo(0, 0);
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
    closeMenu();
  }
});

window.addEventListener("resize", () => {
  if (!window.matchMedia("(max-width: 900px)").matches) {
    closeMenu();
  }
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

  const sectionChanged = activeMenuSection !== currentSection;

  if (activeMenuSection !== null && sectionChanged) {
    pulseActiveMenuButton(activeButton);
  }

  document.body.classList.toggle("is-home-active", currentSection === "home" || shouldKeepHomeLayout);
  document.body.classList.toggle("is-scrolled-down", currentScrollY > 24);
  activeMenuSection = currentSection;
}

window.addEventListener("scroll", updateActiveMenu, { passive: true });
updateActiveMenu();
// endregion

// region Componente Home | Funcionalidad | Ocultar menu superpuesto al nombre
const topMenu = document.querySelector(".portfolio-top-menu");
const heroName = document.querySelector(".hero-center__name");
const desktopMenu = window.matchMedia("(min-width: 901px)");

function updateMenuNameOverlap() {
  let overlaps = false;

  if (desktopMenu.matches && document.body.classList.contains("is-home-active") &&
      document.body.classList.contains("is-menu-open")) {
    const menuRect = topMenu.getBoundingClientRect();
    const nameRect = heroName.getBoundingClientRect();
    overlaps = menuRect.left < nameRect.right && menuRect.right > nameRect.left &&
      menuRect.top < nameRect.bottom && menuRect.bottom > nameRect.top;
  }

  topMenu.classList.toggle("is-overlapping-name", overlaps);
  topMenu.inert = overlaps;
  window.requestAnimationFrame(updateMenuNameOverlap);
}

if (topMenu && heroName) {
  updateMenuNameOverlap();
}
// endregion
