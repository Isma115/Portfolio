const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
let nextId = 0;
const timers = new Map();
const media = { matches: false, addEventListener: (_, listener) => { media.change = listener; } };
const code = { textContent: "" };
const classes = new Set();
const properties = {};
const block = {
  querySelector: () => code,
  getBoundingClientRect: () => { throw new Error("Background code must not force layout"); },
  style: { setProperty: (key, value) => { properties[key] = value; } },
  classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
};
const layerClasses = new Set();
const window = {
  matchMedia: () => media,
  addEventListener: (_, listener) => { window.resize = listener; },
  setTimeout: (callback, delay) => { const id = ++nextId; timers.set(id, { callback, delay }); return id; },
  clearTimeout: id => timers.delete(id),
};
const math = Object.create(Math); math.random = () => 0;
const document = {
  hidden: false,
  addEventListener: (_, listener) => { document.visibilitychange = listener; },
  querySelector: () => ({ classList: { add: name => layerClasses.add(name) } }),
  querySelectorAll: () => [block],
};
const context = vm.createContext({ window, Math: math, document });
vm.runInContext(fs.readFileSync(`${__dirname}/codigo-fondo.js`, "utf8"), context);
function advance() {
  const [id, timer] = timers.entries().next().value;
  timers.delete(id); timer.callback(); return timer.delay;
}
assert.ok(layerClasses.has("is-ready"));
assert.equal(properties["--code-x"], "8%");
assert.equal(code.textContent, "");
const first = vm.runInContext("backgroundCodeBlocks[0].text", context);
advance(); assert.equal(code.textContent, first.slice(0, 1));
while (code.textContent.length < first.length) assert.equal(advance(), 75);
assert.equal(advance(), 2500); assert.ok(classes.has("is-fading"));
assert.equal(advance(), 3000); assert.ok(!classes.has("is-fading"));
const second = vm.runInContext("backgroundCodeBlocks[0].text", context);
assert.notEqual(first, second);
media.matches = true; media.change();
assert.equal(code.textContent, second); assert.equal(timers.size, 0);
window.resize(); assert.equal(code.textContent, second);
media.matches = false; media.change();
assert.equal(timers.size, 1);
document.hidden = true; document.visibilitychange();
assert.equal(timers.size, 0);
document.hidden = false; document.visibilitychange();
assert.equal(timers.size, 1);
console.log("Background typing, fade, pause, resize and reduced motion passed without forced layout.");
