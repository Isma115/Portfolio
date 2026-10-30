// region Componente Home | Funcionalidad | Entrada independiente Sobre mi
(() => {
  const section = document.querySelector("#about");
  if (!section || !("IntersectionObserver" in window)) return;

  const elements = Array.from(section.querySelectorAll(
    ".about-header, .about-photo, .about-content h3, .about-content__description p, .about-skills-window, .about-actions a"
  ));
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove("is-pending");
      elementObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });

  let wasInView = false;
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        wasInView = true;
      } else if (wasInView) {
        wasInView = false;
        elements.forEach((element) => {
          element.classList.add("is-pending");
          elementObserver.observe(element);
        });
      }
    });
  }, { rootMargin: "-1px 0px -1px 0px" });

  elements.forEach((element) => {
    element.classList.add("about-reveal", "is-pending");
    elementObserver.observe(element);
  });
  sectionObserver.observe(section);
})();
// endregion
