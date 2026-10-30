// region Componente Home | Funcionalidad | Escritura de codigo de fondo
const backgroundCodeSamples = [
  'const greet = (name) => {\n  return "Hola, " + name;\n};\nconsole.log(greet("mundo"));',
  'def square_numbers(values):\n    return [value ** 2 for value in values]\n\nprint(square_numbers([1, 2, 3]))',
  'SELECT name, created_at\nFROM projects\nWHERE active = TRUE\nORDER BY created_at DESC;',
  'const total = [10, 20, 30]\n  .reduce((sum, value) => sum + value, 0);\nconsole.log(total);',
  'type Project = {\n  name: string;\n  complete: boolean;\n};\nconst project: Project = {\n  name: "Portfolio", complete: true\n};',
  '.card {\n  display: grid;\n  gap: 1rem;\n  color: #eaf2ff;\n}',
  'fn square(value: i32) -> i32 {\n    value * value\n}\n\nfn main() {\n    println!("{}", square(4));\n}',
  'for file in *.txt; do\n  printf "%s\\n" "$file"\ndone',
];
const backgroundCodeLayer = document.querySelector(".background-code");
const backgroundCodeMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const backgroundCodeBlocks = Array.from(document.querySelectorAll(".background-code pre"), (block) => ({
  block,
  code: block.querySelector("code"),
  sampleIndex: -1,
  text: "",
  timer: null,
}));

function positionBackgroundCode(item) {
  const visibleText = item.code.textContent;
  item.code.textContent = item.text;
  const bounds = item.block.getBoundingClientRect();
  const availableX = Math.max(0, window.innerWidth - bounds.width - 40);
  const availableY = Math.max(0, window.innerHeight - bounds.height - 40);
  item.block.style.left = `${8 + Math.random() * availableX}px`;
  item.block.style.top = `${32 + Math.random() * availableY}px`;
  item.code.textContent = visibleText;
}

function chooseBackgroundCode(item) {
  let index = Math.floor(Math.random() * (backgroundCodeSamples.length - (item.sampleIndex >= 0 ? 1 : 0)));
  if (item.sampleIndex >= 0 && index >= item.sampleIndex) index += 1;
  item.sampleIndex = index;
  item.text = backgroundCodeSamples[index];
  positionBackgroundCode(item);
}

function startBackgroundCode() {
  backgroundCodeBlocks.forEach((item, index) => {
    window.clearTimeout(item.timer);
    item.block.classList.remove("is-fading");
    if (item.sampleIndex < 0) chooseBackgroundCode(item);
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
            chooseBackgroundCode(item);
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
window.addEventListener("resize", () => backgroundCodeBlocks.forEach(positionBackgroundCode));
startBackgroundCode();
backgroundCodeLayer.classList.add("is-ready");
// endregion
