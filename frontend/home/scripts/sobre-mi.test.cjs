const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(`${__dirname}/sobre-mi.js`, "utf8");

function element() {
  const classes = new Set();
  return { classes, classList: { add: (...names) => names.forEach((name) => classes.add(name)), remove: (name) => classes.delete(name) } };
}
const items = [element(), element(), element()];
const section = { querySelectorAll: () => items };
const observers = [];
class Observer {
  constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
  observe(item) { this.observed.add(item); }
  unobserve(item) { this.observed.delete(item); }
}
vm.runInNewContext(source, { window: { IntersectionObserver: Observer }, document: { querySelector: () => section }, IntersectionObserver: Observer });
assert.ok(items.every((item) => item.classes.has("is-pending")));
const [elements, container] = observers;
elements.callback([{ target: items[0], isIntersecting: true }]);
assert.ok(!items[0].classes.has("is-pending"));
assert.ok(items[1].classes.has("is-pending"));
assert.ok(!elements.observed.has(items[0]));
container.callback([{ target: section, isIntersecting: true, intersectionRatio: 0.5 }]);
container.callback([{ target: section, isIntersecting: false, intersectionRatio: 0 }]);
assert.ok(items.every((item) => item.classes.has("is-pending")));
assert.equal(elements.observed.size, 3);
const fallback = element();
vm.runInNewContext(source, { window: {}, document: { querySelector: () => ({ querySelectorAll: () => [fallback] }) } });
assert.equal(fallback.classes.size, 0);
console.log("Independent reveals, re-entry and no-observer fallback passed.");
