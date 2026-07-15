// region Logica Pagina Novedades: topografia fluida de fondo
const newsTopographicCanvas = document.querySelector("#news-topographic-flow");
const newsTopographicContext = newsTopographicCanvas?.getContext("2d");
const newsTopographicPointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
};
let newsPixelRatio = 1;

function resizeNewsTopography() {
  if (!newsTopographicCanvas || !newsTopographicContext) {
    return;
  }

  newsPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  newsTopographicCanvas.width = Math.round(window.innerWidth * newsPixelRatio);
  newsTopographicCanvas.height = Math.round(window.innerHeight * newsPixelRatio);
  newsTopographicCanvas.style.width = `${window.innerWidth}px`;
  newsTopographicCanvas.style.height = `${window.innerHeight}px`;
  newsTopographicContext.setTransform(newsPixelRatio, 0, 0, newsPixelRatio, 0, 0);
}

function drawNewsTopography(time = 0) {
  if (!newsTopographicContext) {
    return;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const lineCount = width < 700 ? 26 : 34;
  const sampleStep = width < 700 ? 14 : 18;

  newsTopographicPointer.x += (newsTopographicPointer.targetX - newsTopographicPointer.x) * 0.06;
  newsTopographicPointer.y += (newsTopographicPointer.targetY - newsTopographicPointer.y) * 0.06;
  newsTopographicContext.clearRect(0, 0, width, height);
  newsTopographicContext.lineWidth = 1;

  for (let index = 0; index < lineCount; index += 1) {
    const progress = index / (lineCount - 1);
    const baseY = -42 + progress * (height + 84);
    const pointerDistance = Math.abs(baseY - newsTopographicPointer.y);
    const pointerInfluence = Math.max(0, 1 - pointerDistance / (height * 0.5)) * 16;

    newsTopographicContext.beginPath();

    for (let x = -50; x <= width + 50; x += sampleStep) {
      const wave = Math.sin(x * 0.009 + time * 0.00042 + index * 0.46) * (18 + pointerInfluence * 0.25);
      const ripple = Math.cos(x * 0.004 - time * 0.0003 + index * 0.22) * 10;
      const pull = Math.sin((x - newsTopographicPointer.x) * 0.012) * pointerInfluence;
      const y = baseY + wave + ripple + pull;

      if (x === -50) {
        newsTopographicContext.moveTo(x, y);
      } else {
        newsTopographicContext.lineTo(x, y);
      }
    }

    newsTopographicContext.strokeStyle = `rgba(190, 166, 235, ${0.055 + (1 - Math.abs(progress - 0.5) * 1.6) * 0.14})`;
    newsTopographicContext.stroke();
  }

  window.requestAnimationFrame(drawNewsTopography);
}

if (newsTopographicCanvas && newsTopographicContext) {
  window.addEventListener("resize", resizeNewsTopography);
  window.addEventListener("pointermove", (event) => {
    newsTopographicPointer.targetX = event.clientX;
    newsTopographicPointer.targetY = event.clientY;
  });

  resizeNewsTopography();
  drawNewsTopography();
}
// endregion

// region Logica Pagina Novedades: entrada progresiva de componentes
window.requestAnimationFrame(() => {
  document.body.classList.add("is-ready");
});
// endregion

// region Logica Pagina Novedades: vuelta hacia proyectos
const backToProjectsLink = document.querySelector("[data-back-to-projects]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

backToProjectsLink?.addEventListener("click", (event) => {
  const opensInNewContext = event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

  if (opensInNewContext || reducedMotionQuery.matches) {
    return;
  }

  event.preventDefault();
  document.body.classList.add("is-leaving");
  document.body.setAttribute("aria-busy", "true");

  window.setTimeout(() => {
    window.location.assign(backToProjectsLink.href);
  }, 560);
});
// endregion
