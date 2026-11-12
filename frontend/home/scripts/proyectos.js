// region Componente Home | Funcionalidad | Carrusel de proyectos
const projectsCarousel = document.querySelector(".projects-carousel");
if (projectsCarousel) {
  projectsCarousel.classList.add("is-enhanced");

  const projectsTrack = projectsCarousel.querySelector(".projects-track");
  projectsTrack?.addEventListener("wheel", (event) => {
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

    event.preventDefault();
    const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? window.innerHeight
        : 1;
    window.scrollBy({ top: event.deltaY * multiplier, behavior: "instant" });
  }, { passive: false });
}
// endregion
