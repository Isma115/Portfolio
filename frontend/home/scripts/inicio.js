// region Componente Home | Funcionalidad | Introduccion de carga
(() => {
  const minimumDelay = new Promise((resolve) => {
    // Dos frames permiten ver el estado ampliado antes de empezar el zoom.
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      document.documentElement.classList.add("intro-running");
      window.setTimeout(resolve, 2000);
    }));
  });
  const pageLoaded = document.readyState === "complete"
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
  const fontsLoaded = Promise.all([
    document.fonts.load('700 1em "Chakra Petch"'),
    document.fonts.load('400 1em "Space Grotesk"'),
  ]).catch(() => {});

  const imagesLoaded = Promise.all(
    Array.from(document.images, (image) => image.decode().catch(() => {}))
  );

  Promise.all([minimumDelay, pageLoaded, fontsLoaded, imagesLoaded]).then(() => {
    window.clearTimeout(window.portfolioIntroFallback);
    delete window.portfolioIntroFallback;
    document.documentElement.classList.remove("is-loading", "intro-running");
  });
})();
// endregion
