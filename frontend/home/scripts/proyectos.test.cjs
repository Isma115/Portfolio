const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(`${__dirname}/proyectos.js`, "utf8");
const classes = new Set();
const scrolls = [];
let wheel;
const carousel = {
  classList: { add: name => classes.add(name) },
  querySelector: () => ({ addEventListener: (name, callback, options) => {
    assert.equal(name, "wheel");
    assert.equal(options.passive, false);
    wheel = callback;
  } }),
};
vm.runInNewContext(source, {
  document: { querySelector: () => carousel },
  window: { innerHeight: 900, scrollBy: options => scrolls.push(options.top) },
  WheelEvent: { DOM_DELTA_LINE: 1, DOM_DELTA_PAGE: 2 },
});
assert.ok(classes.has("is-enhanced"));
let prevented = 0;
const event = { deltaX: 0, deltaY: 2, deltaMode: 0, preventDefault: () => prevented++ };
wheel(event);
wheel({ ...event, deltaMode: 1 });
wheel({ ...event, deltaMode: 2 });
assert.deepEqual(scrolls, [2, 32, 1800]);
assert.equal(prevented, 3);
wheel({ ...event, ctrlKey: true });
wheel({ ...event, deltaX: 10 });
assert.equal(scrolls.length, 3, "Zoom and horizontal gestures must retain native behavior");
assert.equal(prevented, 3);
vm.runInNewContext(source, { document: { querySelector: () => null } });
console.log("Project carousel initialization, wheel units and native gestures passed.");
