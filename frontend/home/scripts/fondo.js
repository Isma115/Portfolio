// region Componente Home | Funcionalidad | Topografia fluida reactiva
const topographicCanvas = document.querySelector("#topographic-flow");
const topographicContext = topographicCanvas?.getContext("2d");
const backgroundParticles = Array.from(document.querySelectorAll(".background-particles span"));
const topographicPointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
  force: 0,
  targetForce: 0,
};
let topographicPixelRatio = 1;
let topographicScrollProgress = 0;
let topographicMaxScroll = 0;
let topographicLineStyles = [];
let topographicLastFrame = -Infinity;
let topographicFrame = 0;
let topographicFrameInterval = 1000 / 30;
const topographicMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function hash2DSlow(x, y) {
  const seed = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return seed - Math.floor(seed);
}

// El ruido se evalua miles de veces por frame: se precalcula una tabla 256x256 con los
// mismos valores que el hash original y se consulta por indice (sin Math.sin en el bucle)
const NOISE_TABLE_SIZE = 256;
const NOISE_TABLE_MASK = NOISE_TABLE_SIZE - 1;
const noiseTable = new Float32Array(NOISE_TABLE_SIZE * NOISE_TABLE_SIZE);
for (let y = 0; y < NOISE_TABLE_SIZE; y += 1) {
  for (let x = 0; x < NOISE_TABLE_SIZE; x += 1) {
    noiseTable[y * NOISE_TABLE_SIZE + x] = hash2DSlow(x, y);
  }
}

function hash2D(x, y) {
  return noiseTable[((y & NOISE_TABLE_MASK) << 8) | (x & NOISE_TABLE_MASK)];
}

function valueNoise2D(x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const sx = smoothstep(x - x0);
  const sy = smoothstep(y - y0);

  const n00 = hash2D(x0, y0);
  const n10 = hash2D(x1, y0);
  const n01 = hash2D(x0, y1);
  const n11 = hash2D(x1, y1);

  const nx0 = lerp(n00, n10, sx);
  const nx1 = lerp(n01, n11, sx);
  return lerp(nx0, nx1, sy);
}

function resizeTopographicFlow() {
  if (!topographicCanvas || !topographicContext) {
    return;
  }

  // El dibujo tenue se rasteriza a un máximo de 1280 px de ancho, sin reducir fotos ni texto.
  topographicPixelRatio = Math.min(1, 1280 / window.innerWidth);
  topographicFrameInterval = 1000 / (window.innerWidth < 700 ? 20 : 30);
  topographicCanvas.width = Math.round(window.innerWidth * topographicPixelRatio);
  topographicCanvas.height = Math.round(window.innerHeight * topographicPixelRatio);
  topographicCanvas.style.width = `${window.innerWidth}px`;
  topographicCanvas.style.height = `${window.innerHeight}px`;
  topographicContext.setTransform(topographicPixelRatio, 0, 0, topographicPixelRatio, 0, 0);

  // Los colores de cada linea solo dependen de su indice: se calculan una vez, no en cada frame
  const lineCount = window.innerWidth < 700 ? 34 : 44;
  topographicLineStyles = Array.from({ length: lineCount }, (_, index) => {
    const t = index / (lineCount - 1);
    const red = Math.round(122 + t * 52);
    const green = Math.round(140 + t * 38);
    const blue = Math.round(170 + t * 34);
    const alpha = 0.1 + (1 - Math.abs(t - 0.5) * 1.7) * 0.14;
    return `rgba(${red}, ${green}, ${blue}, ${Math.max(0.04, alpha)})`;
  });

  topographicMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
}

function drawTopographicFlow(time = 0) {
  topographicFrame = 0;
  if (!topographicContext || document.hidden) {
    return;
  }

  if (!topographicMotion.matches) {
    topographicFrame = window.requestAnimationFrame(drawTopographicFlow);
  }

  // Fondo fluido a 30 fps en escritorio y 20 en móvil, con margen para el jitter.
  if (time - topographicLastFrame < topographicFrameInterval - 4 && time !== 0) {
    return;
  }
  topographicLastFrame = time;
  time *= 0.5;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const lineCount = topographicLineStyles.length;
  const amplitude = width < 700 ? 24 : 34;
  const sampleStep = width < 700 ? 24 : 32;
  const sidePadding = 80;
  const scrollDrift = topographicScrollProgress * 460;
  const noiseTime = time * 0.00008;

  topographicPointer.x += (topographicPointer.targetX - topographicPointer.x) * 0.08;
  topographicPointer.y += (topographicPointer.targetY - topographicPointer.y) * 0.08;
  topographicPointer.force += (topographicPointer.targetForce - topographicPointer.force) * 0.05;

  const reach = Math.min(width, height) * 0.68;
  const reachSquared = reach * reach;
  const pointerActive = topographicPointer.force > 0.001;

  topographicContext.clearRect(0, 0, width, height);
  topographicContext.lineWidth = 1.05;

  for (let index = 0; index < lineCount; index += 1) {
    const t = index / (lineCount - 1);
    const baseY = -30 + t * (height + 60);
    const noiseY = baseY * 0.006 - scrollDrift * 0.0018;
    const phaseA = time * 0.00042 + index * 0.52;
    const phaseB = -time * 0.0003 + index * 0.35;

    topographicContext.beginPath();

    for (let x = -sidePadding; x <= width + sidePadding; x += sampleStep) {
      const waveA = Math.sin(x * 0.011 + phaseA) * amplitude * 0.44;
      const waveB = Math.cos(x * 0.0043 + phaseB) * amplitude * 0.3;
      const noise = (valueNoise2D(x * 0.0046 + noiseTime, noiseY) - 0.5) * amplitude * 1.3;
      let y = baseY + waveA + waveB + noise;

      if (pointerActive) {
        const dx = x - topographicPointer.x;
        const dy = baseY - topographicPointer.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared < reachSquared) {
          const distance = Math.sqrt(distanceSquared);
          const pull = (1 - distance / reach) ** 2.4 * topographicPointer.force;
          y += Math.sin(distance * 0.038 - time * 0.0026) * 9 * pull;
          y += Math.sin((x + baseY) * 0.004 + time * 0.0007) * 3 * pull;
        }
      }

      if (x === -sidePadding) {
        topographicContext.moveTo(x, y);
      } else {
        topographicContext.lineTo(x, y);
      }
    }

    topographicContext.strokeStyle = topographicLineStyles[index];
    topographicContext.stroke();
  }
}

function updateTopographicAnimation() {
  window.cancelAnimationFrame(topographicFrame);
  topographicFrame = 0;
  topographicLastFrame = -Infinity;
  drawTopographicFlow();
}

if (topographicCanvas && topographicContext) {
  window.addEventListener("resize", () => {
    resizeTopographicFlow();
    updateTopographicAnimation();
  });
  topographicMotion.addEventListener("change", updateTopographicAnimation);

  window.addEventListener("pointermove", (event) => {
    topographicPointer.targetX = event.clientX;
    topographicPointer.targetY = event.clientY;
    topographicPointer.targetForce = 0.34;
  });

  window.addEventListener("pointerleave", () => {
    topographicPointer.targetForce = 0.03;
  });

  // La altura maxima se cachea en resize: leer scrollHeight en cada scroll forzaba layout
  window.addEventListener("scroll", () => {
    topographicScrollProgress = topographicMaxScroll > 0 ? Math.min(1, window.scrollY / topographicMaxScroll) : 0;
  }, { passive: true });
  window.addEventListener("load", () => {
    topographicMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
  });

  resizeTopographicFlow();
  drawTopographicFlow();
}

document.addEventListener("visibilitychange", () => {
  document.body.classList.toggle("effects-paused", document.hidden);
  updateTopographicAnimation();
});
// endregion

// region Componente Home | Funcionalidad | Particulas de fondo aleatorias
const particleSymbols = [
  "+",
  "x",
  "{}",
  "[]",
  "()",
  "<>",
  "</>",
  "=>",
  "&&",
  "||",
  "::",
  ";",
  "#",
  "@",
  "01",
  "101",
  "0x",
  "API",
  "git",
  "npm",
];

function randomizeParticle(particle) {
  const size = Math.round(9 + Math.random() * 13);
  const delay = Math.round(Math.random() * 16000);
  const symbol = particleSymbols[Math.floor(Math.random() * particleSymbols.length)];

  particle.style.setProperty("--x", `${Math.round(4 + Math.random() * 92)}%`);
  particle.style.setProperty("--y", `${Math.round(6 + Math.random() * 88)}%`);
  particle.style.setProperty("--size", `${size}px`);
  particle.style.setProperty("--delay", `${delay}ms`);
  particle.textContent = symbol;
}

backgroundParticles.forEach((particle) => {
  randomizeParticle(particle);

  particle.addEventListener("animationiteration", () => {
    randomizeParticle(particle);
  });
});
// endregion

// region Componente Home | Funcionalidad | Color aleatorio de la luz principal
const homeSection = document.querySelector(".section-home");

function randomizeHomeLightColor() {
  if (!homeSection) {
    return;
  }

  const allowedHueRanges = [
    { min: 25, max: 65 },
    { min: 100, max: 165 },
    { min: 185, max: 235 },
    { min: 245, max: 295 },
    { min: 300, max: 335 },
  ];
  const selectedRange = allowedHueRanges[Math.floor(Math.random() * allowedHueRanges.length)];
  const hue = Math.floor(selectedRange.min + Math.random() * (selectedRange.max - selectedRange.min));
  homeSection.style.setProperty("--section-accent-start", `hsl(${hue} 100% 82%)`);
  homeSection.style.setProperty("--section-accent-end", `hsl(${hue} 86% 56%)`);
  homeSection.style.setProperty("--section-accent-light", `hsl(${hue} 100% 90%)`);
  homeSection.style.setProperty("--section-accent-glow", `hsl(${hue} 86% 56% / 0.32)`);
}

randomizeHomeLightColor();
// endregion


// region Componente Home | Funcionalidad | Estelas de color con tamaño aleatorio
const colorTrails = document.querySelectorAll(".color-trail");
const trailShapes = [
  { radius: "50%", mask: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 0%, rgba(0, 0, 0, 0.75) 35%, rgba(0, 0, 0, 0.3) 65%, transparent 100%)", span: 160, blur: [44, 60], thick: 1, core: false },
  { radius: "58% 42% 64% 36% / 46% 54% 46% 54%", mask: "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.5) 12%, #000 30%, #000 70%, rgba(0, 0, 0, 0.5) 88%, transparent), linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.6) 25%, #000 45%, #000 55%, rgba(0, 0, 0, 0.6) 75%, transparent)", span: 185, blur: [32, 44], thick: 0.9, core: false },
  { radius: "0 calc(var(--trail-height) / 2) calc(var(--trail-height) / 2) 0 / 0 50% 50% 0", mask: "linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.15) 20%, rgba(0, 0, 0, 0.6) 50%, #000 85%, #000 100%), linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.5) 20%, #000 42%, #000 58%, rgba(0, 0, 0, 0.5) 80%, transparent)", span: 150, blur: [20, 28], thick: 0.75, core: true },
  { radius: "calc(var(--trail-height) / 2) 0 0 calc(var(--trail-height) / 2) / 50% 0 0 50%", mask: "linear-gradient(270deg, transparent 0%, rgba(0, 0, 0, 0.15) 20%, rgba(0, 0, 0, 0.6) 50%, #000 85%, #000 100%), linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.5) 20%, #000 42%, #000 58%, rgba(0, 0, 0, 0.5) 80%, transparent)", span: 150, blur: [20, 28], thick: 0.75, core: true },
  { radius: "999px", mask: "linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.4) 12%, #000 35%, #000 65%, rgba(0, 0, 0, 0.4) 88%, transparent), linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.6) 30%, #000 50%, rgba(0, 0, 0, 0.6) 70%, transparent)", span: 175, blur: [14, 20], thick: 0.45, core: true },
];

function withAlpha(color, alpha) {
  return color.replace(/[\d.]+\)$/, `${alpha})`);
}

function pickDistinctIndex(trail, datasetKey, count) {
  const usedByOthers = new Set([...colorTrails]
    .filter((other) => other !== trail)
    .map((other) => Number(other.dataset[datasetKey])));
  const previous = Number(trail.dataset[datasetKey]);
  const all = Array.from({ length: count }, (_, index) => index);
  const fresh = all.filter((index) => !usedByOthers.has(index) && index !== previous);
  const candidates = fresh.length ? fresh : all.filter((index) => index !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function randomizeTrailShape(trail) {
  const shapeIndex = pickDistinctIndex(trail, "shapeIndex", trailShapes.length);
  const shape = trailShapes[shapeIndex];
  const [minBlur, maxBlur] = shape.blur;
  const blur = minBlur + Math.random() * (maxBlur - minBlur);

  trail.dataset.shapeIndex = shapeIndex;
  trail.style.setProperty("--trail-radius", shape.radius);
  trail.style.setProperty("--trail-mask", shape.mask);
  trail.style.setProperty("--trail-span", shape.span);
  trail.style.setProperty("--trail-blur", `${blur.toFixed(1)}px`);
}

function randomizeTrailSize(trail) {
  const shape = trailShapes[Number(trail.dataset.shapeIndex)];
  const randomHeight = Math.round((Math.floor(Math.random() * 230) + 230) * shape.thick);
  trail.style.setProperty("--trail-height", `${randomHeight}px`);
}

function randomizeTrail(trail) {
  randomizeTrailShape(trail);
  randomizeTrailSize(trail);
  randomizeTrailPalette(trail);
}

// Cada seccion tiene sus propios destellos: tres paletas en la gama de su color de acento
const sectionTrailPalettes = {
  home: [
    ["rgba(59, 130, 246, 0.3)", "rgba(34, 211, 238, 0.32)", "rgba(134, 247, 255, 0.24)"],
    ["rgba(37, 99, 235, 0.32)", "rgba(96, 165, 250, 0.28)", "rgba(56, 189, 248, 0.3)"],
    ["rgba(14, 165, 233, 0.28)", "rgba(43, 143, 255, 0.32)", "rgba(129, 140, 248, 0.26)"],
  ],
  about: [
    ["rgba(45, 212, 191, 0.3)", "rgba(111, 240, 216, 0.3)", "rgba(20, 184, 166, 0.26)"],
    ["rgba(16, 185, 129, 0.28)", "rgba(63, 224, 197, 0.32)", "rgba(34, 211, 238, 0.24)"],
    ["rgba(31, 168, 146, 0.32)", "rgba(153, 246, 228, 0.24)", "rgba(52, 211, 153, 0.28)"],
  ],
  projects: [
    ["rgba(139, 92, 246, 0.32)", "rgba(198, 164, 255, 0.3)", "rgba(117, 84, 196, 0.3)"],
    ["rgba(168, 85, 247, 0.32)", "rgba(99, 102, 241, 0.3)", "rgba(192, 132, 252, 0.28)"],
    ["rgba(124, 58, 237, 0.3)", "rgba(217, 70, 239, 0.26)", "rgba(165, 180, 252, 0.26)"],
  ],
  skills: [
    ["rgba(34, 197, 94, 0.3)", "rgba(161, 255, 206, 0.28)", "rgba(33, 201, 139, 0.3)"],
    ["rgba(132, 204, 22, 0.26)", "rgba(74, 222, 128, 0.3)", "rgba(16, 185, 129, 0.28)"],
    ["rgba(52, 211, 153, 0.3)", "rgba(190, 242, 100, 0.24)", "rgba(34, 197, 94, 0.28)"],
  ],
  experience: [
    ["rgba(244, 63, 94, 0.32)", "rgba(255, 138, 143, 0.3)", "rgba(224, 38, 63, 0.3)"],
    ["rgba(239, 68, 68, 0.3)", "rgba(251, 146, 60, 0.26)", "rgba(244, 63, 94, 0.28)"],
    ["rgba(225, 29, 72, 0.3)", "rgba(253, 164, 175, 0.26)", "rgba(249, 115, 22, 0.24)"],
  ],
  contact: [
    ["rgba(236, 72, 153, 0.3)", "rgba(255, 193, 228, 0.28)", "rgba(224, 93, 159, 0.3)"],
    ["rgba(244, 114, 182, 0.3)", "rgba(217, 70, 239, 0.28)", "rgba(251, 113, 133, 0.26)"],
    ["rgba(219, 39, 119, 0.3)", "rgba(249, 168, 212, 0.26)", "rgba(192, 132, 252, 0.26)"],
  ],
};

function currentSectionPalettes() {
  return sectionTrailPalettes[document.body.dataset.section] || sectionTrailPalettes.home;
}

function applyTrailPalette(trail, palette) {
  palette.forEach((color, colorIndex) => {
    trail.style.setProperty(`--trail-color-${colorIndex + 1}`, color);
  });
  const shape = trailShapes[Number(trail.dataset.shapeIndex)];
  trail.style.setProperty("--trail-core", shape && shape.core ? withAlpha(palette[1], 0.45) : "transparent");
}

function randomizeTrailPalette(trail) {
  const palettes = currentSectionPalettes();
  const paletteIndex = pickDistinctIndex(trail, "paletteIndex", palettes.length);

  trail.dataset.paletteIndex = paletteIndex;
  applyTrailPalette(trail, palettes[paletteIndex]);
}

// Al cambiar de seccion, la capa de estelas se funde, adopta la nueva gama sin reiniciarse y reaparece.
// Los colores se cambian una sola vez (un repintado) en lugar de animarse frame a frame.
const colorTrailsLayer = document.querySelector(".color-trails");
const trailsMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let trailPaletteTimer = 0;

function applySectionPalettes() {
  const palettes = currentSectionPalettes();
  colorTrails.forEach((trail) => {
    const index = Number(trail.dataset.paletteIndex) % palettes.length;
    applyTrailPalette(trail, palettes[index]);
  });
  colorTrailsLayer?.classList.remove("is-palette-switching");
}

new MutationObserver(() => {
  window.clearTimeout(trailPaletteTimer);
  if (!colorTrailsLayer || trailsMotion.matches || document.hidden) {
    applySectionPalettes();
    return;
  }
  colorTrailsLayer.classList.add("is-palette-switching");
  trailPaletteTimer = window.setTimeout(applySectionPalettes, 600);
}).observe(document.body, { attributes: true, attributeFilter: ["data-section"] });

colorTrails.forEach((trail) => {
  randomizeTrail(trail);
  
  trail.addEventListener("animationiteration", () => randomizeTrail(trail));
});
// endregion

