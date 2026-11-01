(() => {
  if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const cards = document.querySelectorAll(".project-preview, .skills-stack, .skills-tools, .experience-card, .contact-card, .news-empty-state, .news-publishing-note");
  const revealed = new WeakSet();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        entry.target.classList.remove("hologram-enter", "hologram-return");
        return;
      }
      entry.target.classList.add(revealed.has(entry.target) ? "hologram-return" : "hologram-enter");
      revealed.add(entry.target);
    });
  }, { threshold: 0.08 });

  cards.forEach((card) => observer.observe(card));
})();
