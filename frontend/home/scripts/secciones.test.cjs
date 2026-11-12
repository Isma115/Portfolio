const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(`${__dirname}/secciones.js`, 'utf8').split('// endregion')[0];
const classes = new Set();
const element = {
  classList: { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name) },
  addEventListener() {},
  get offsetWidth() { return 100; }
};
let observer, glitchCount = 0;
const originalAdd = element.classList.add;
element.classList.add = name => { if (name === 'is-title-glitching') glitchCount++; originalAdd(name); };
class Observer {
  constructor(callback) { this.callback = callback; this.observed = new Set(); observer = this; }
  observe(target) { this.observed.add(target); }
  unobserve(target) { this.observed.delete(target); }
}
vm.runInNewContext(source, { document: { querySelectorAll: () => [element] }, IntersectionObserver: Observer });
assert.ok(observer.observed.has(element));
observer.callback([{ target: element, intersectionRatio: 0.1 }]);
assert.ok(!classes.has('is-visible'));
observer.callback([{ target: element, intersectionRatio: 0.3 }]);
assert.ok(classes.has('is-visible'));
assert.ok(!observer.observed.has(element));
observer.callback([{ target: element, intersectionRatio: 0 }]);
assert.ok(classes.has('is-visible'));
assert.ok(!classes.has('is-exiting'));
observer.callback([{ target: element, intersectionRatio: 0.3 }]);
assert.equal(glitchCount, 1, 'Returning must not replay the title animation');
console.log('Sections: first reveal, persistent visibility and no replay passed.');
