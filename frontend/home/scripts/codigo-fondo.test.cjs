const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let nextId = 0;
const timers = new Map();
const media = { matches: false, addEventListener: (_, listener) => { media.change = listener; } };
const code = { textContent: "" };
const classes = new Set();
const block = {
  querySelector: () => code,
  getBoundingClientRect: () => ({ width: 100, height: 40 }),
  style: {},
  classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
};
const layerClasses = new Set();
const window = {
  innerWidth: 390, innerHeight: 800,
  matchMedia: () => media,
  addEventListener: (_, listener) => { window.resize = listener; },
  setTimeout: (callback, delay) => { const id = ++nextId; timers.set(id, { callback, delay }); return id; },
  clearTimeout: (id) => timers.delete(id),
};
const math = Object.create(Math); math.random = () => 0;
const context = vm.createContext({
  window, Math: math,
  document: { querySelector: () => ({ classList: { add: (name) => layerClasses.add(name) } }), querySelectorAll: () => [block] },
});
vm.runInContext(fs.readFileSync(`${__dirname}/codigo-fondo.js`, "utf8"), context);
function advance() {
  const [id, timer] = timers.entries().next().value;
  timers.delete(id); timer.callback(); return timer.delay;
}
assert.ok(layerClasses.has("is-ready"));
assert.equal(code.textContent, "");
assert.equal(block.style.left, "8px"); assert.equal(block.style.top, "32px");
const first = vm.runInContext("backgroundCodeBlocks[0].text", context);
assert.ok(first.includes("\n"));
advance(); assert.equal(code.textContent, first.slice(0, 1));
while (code.textContent.length < first.length) assert.equal(advance(), 75);
assert.equal(code.textContent, first);
assert.equal(advance(), 2500); assert.ok(classes.has("is-fading"));
assert.equal(advance(), 3000); assert.ok(!classes.has("is-fading"));
const second = vm.runInContext("backgroundCodeBlocks[0].text", context);
assert.notEqual(first, second); assert.equal(code.textContent, second.slice(0, 1));
media.matches = true; media.change();
assert.equal(code.textContent, second); assert.equal(timers.size, 0);
window.resize(); assert.equal(code.textContent, second);
media.matches = false; media.change();
assert.equal(code.textContent, ""); assert.equal(timers.size, 1);
assert.ok(vm.runInContext("backgroundCodeSamples.length", context) > 3);
console.log("Background variety, position, typing, fade, resize and motion preference passed.");
