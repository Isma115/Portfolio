// region Componente Home | Funcionalidad | Escritura de codigo de fondo
const backgroundCodeMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const backgroundCodeBlocks = Array.from(document.querySelectorAll(".background-code pre"), (block) => ({
  block,
  code: block.querySelector("code"),
  text: block.querySelector("code").textContent,
  timer: null,
}));

function startBackgroundCode() {
  backgroundCodeBlocks.forEach((item, index) => {
    window.clearTimeout(item.timer);
    item.block.classList.remove("is-fading");
    if (backgroundCodeMotion.matches) {
      item.code.textContent = item.text;
      return;
    }

    item.code.textContent = "";
    let position = 0;
    function typeCharacter() {
      position += 1;
      item.code.textContent = item.text.slice(0, position);
      if (position < item.text.length) {
        item.timer = window.setTimeout(typeCharacter, 75);
      } else {
        item.timer = window.setTimeout(() => {
          item.block.classList.add("is-fading");
          item.timer = window.setTimeout(() => {
            item.block.classList.remove("is-fading");
            position = 0;
            item.code.textContent = "";
            typeCharacter();
          }, 3000);
        }, 2500);
      }
    }
    item.timer = window.setTimeout(typeCharacter, index * 900);
  });
}

backgroundCodeMotion.addEventListener("change", startBackgroundCode);
startBackgroundCode();
// endregion
