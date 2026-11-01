const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync(require("node:path").join(__dirname, "hologram.js"), "utf8");
const card = { classList: { add: (name) => added.push(name), remove: (...names) => removed.push(...names) } };
const added = [];
const removed = [];
let callback;
let observed = 0;
class Observer {
  constructor(fn) { callback = fn; }
  observe() { observed++; }
}
const window = { IntersectionObserver: Observer, matchMedia: () => ({ matches: false }) };
const document = { querySelectorAll: () => [card] };
vm.runInNewContext(source, { window, document, IntersectionObserver: Observer });
assert.equal(observed, 1);
callback([{ target: card, isIntersecting: false }]);
assert.deepEqual(added, []);
callback([{ target: card, isIntersecting: true }]);
assert.deepEqual(added, ["hologram-enter"]);
callback([{ target: card, isIntersecting: false }]);
assert.deepEqual(removed, ["hologram-enter", "hologram-return", "hologram-enter", "hologram-return"]);
callback([{ target: card, isIntersecting: true }]);
assert.deepEqual(added, ["hologram-enter", "hologram-return"]);

window.matchMedia = () => ({ matches: true });
vm.runInNewContext(source, { window, document, IntersectionObserver: Observer });
assert.equal(observed, 1);
delete window.IntersectionObserver;
vm.runInNewContext(source, { window, document, IntersectionObserver: Observer });
assert.equal(observed, 1);
