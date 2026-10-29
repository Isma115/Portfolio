const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

let nextId = 0;
const timers = new Map();
const media = { matches: false, addEventListener: (_, listener) => { media.change = listener; } };
const code = { textContent: "a\nb" };
const classes = new Set();
const block = {
  querySelector: () => code,
  classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) },
};
const window = {
  matchMedia: () => media,
  setTimeout: (callback, delay) => { const id = ++nextId; timers.set(id, { callback, delay }); return id; },
  clearTimeout: (id) => timers.delete(id),
};
vm.runInNewContext(fs.readFileSync(`${__dirname}/codigo-fondo.js`, "utf8"), {
  window,
  document: { querySelectorAll: () => [block] },
});
function advance() {
  const [id, timer] = timers.entries().next().value;
  timers.delete(id);
  timer.callback();
  return timer.delay;
}
assert.equal(code.textContent, "");
advance(); assert.equal(code.textContent, "a");
assert.equal(advance(), 75); assert.equal(code.textContent, "a\n");
advance(); assert.equal(code.textContent, "a\nb");
assert.equal(advance(), 2500); assert.ok(classes.has("is-fading"));
assert.equal(advance(), 3000); assert.equal(code.textContent, "a"); assert.ok(!classes.has("is-fading"));
media.matches = true; media.change();
assert.equal(code.textContent, "a\nb"); assert.equal(timers.size, 0);
media.matches = false; media.change();
assert.equal(code.textContent, ""); assert.equal(timers.size, 1);
console.log("Background typing, newlines, fade, restart and motion preference passed.");
