const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(`${__dirname}/home.js`, "utf8")
  .split("// region Componente Home | Funcionalidad | Ocultar menu superpuesto al nombre\n")[1]
  .split("// endregion")[0];
let hidden;
let nextFrame;
let desktop = true;
const states = new Set(["is-home-active", "is-menu-open"]);
const menuRect = { left: 100, right: 500, top: 20, bottom: 60 };
const nameRect = { left: 50, right: 550, top: 200, bottom: 300 };
const menu = {
  getBoundingClientRect: () => menuRect,
  classList: { toggle: (_, value) => { hidden = value; } },
};
vm.runInNewContext(source, {
  document: {
    querySelector: (selector) => selector === ".portfolio-top-menu"
      ? menu : { getBoundingClientRect: () => nameRect },
    body: { classList: { contains: (state) => states.has(state) } },
  },
  window: {
    matchMedia: () => ({ get matches() { return desktop; } }),
    requestAnimationFrame: (callback) => { nextFrame = callback; },
  },
});
function check(expected) {
  nextFrame();
  assert.equal(hidden, expected);
  assert.equal(menu.inert, expected);
}
check(false);
nameRect.top = 40;
check(true);
nameRect.bottom = 20;
check(false);
nameRect.bottom = 100;
check(true);
desktop = false;
check(false);
desktop = true;
states.delete("is-home-active");
check(false);
states.add("is-home-active");
states.delete("is-menu-open");
check(false);
states.add("is-menu-open");
nameRect.left = 500;
check(false);
console.log("Menu overlap checks passed");
