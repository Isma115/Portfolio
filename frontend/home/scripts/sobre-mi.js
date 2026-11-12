// region Componente Home | Funcionalidad | Entrada independiente Sobre mi
(() => {
  const section = document.querySelector("#about");
  if (!section || !("IntersectionObserver" in window)) return;

  const elements = Array.from(section.querySelectorAll(
    ".about-header, .about-photo, .about-content h3, .about-content__description p, .about-actions a"
  ));
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("is-pending");
      if (entry.target.matches(".about-content h3")) {
        window.scrambleText?.(entry.target, { delay: 120, duration: 900 });
      }
      elementObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

  // Temporal: los elementos revelados no se ocultan de nuevo.
  elements.forEach((element) => {
    element.classList.add("about-reveal", "is-pending");
    elementObserver.observe(element);
  });
})();
// endregion
