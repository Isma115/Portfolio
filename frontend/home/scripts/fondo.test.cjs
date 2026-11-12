const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const frames = new Map();
const events = {};
let nextFrame = 0;
let draws = 0;
const classes = new Set();
const motion = { matches: false, addEventListener: (_, callback) => { motion.change = callback; } };
const context2d = {
  setTransform() {}, clearRect() { draws++; }, beginPath() {},
  moveTo() {}, lineTo() {}, stroke() {},
};
const canvas = { style: {}, getContext: () => context2d };
const document = {
  hidden: false,
  body: { classList: { contains: name => classes.has(name), toggle: (name, value) => value ? classes.add(name) : classes.delete(name) } },
  documentElement: { scrollHeight: 4000 },
  querySelector: () => canvas,
  querySelectorAll: () => [],
  addEventListener: (name, callback) => { events[name] = callback; },
};
const window = {
  innerWidth: 1366, innerHeight: 768, devicePixelRatio: 2, scrollY: 0,
  matchMedia: () => motion,
  requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
  cancelAnimationFrame: id => frames.delete(id),
  addEventListener: (name, callback) => { events[name] = callback; },
};
const source = fs.readFileSync(`${__dirname}/fondo.js`, 'utf8').split('// endregion')[0];
vm.runInNewContext(source, { window, document });
assert.equal(frames.size, 1);
for (let i = 0; i < 3; i++) events.resize();
assert.equal(frames.size, 1, 'Resize must not create extra animation loops');
assert.equal(canvas.width, 1280, 'Large screens cap the decorative canvas width');
classes.add('is-user-scrolling');
const scrollingDraws = draws;
function tick(time) {
  const [id, callback] = frames.entries().next().value;
  frames.delete(id);
  callback(time);
}
tick(100);
assert.ok(draws > scrollingDraws, 'The restored background keeps moving during scrolling');
assert.equal(frames.size, 1, 'Scrolling must preserve a single loop');
classes.delete('is-user-scrolling');
tick(200);
assert.ok(draws > scrollingDraws, 'The canvas resumes when scrolling ends');
window.innerWidth = 390;
events.resize();
assert.equal(canvas.width, 390, 'Small screens keep their CSS resolution');

document.hidden = true;
events.visibilitychange();
assert.equal(frames.size, 0);
assert.ok(classes.has('effects-paused'));
const hiddenDraws = draws;
events.resize();
motion.change();
assert.equal(draws, hiddenDraws, 'A hidden tab must not redraw the canvas');
document.hidden = false;
events.visibilitychange();
assert.equal(frames.size, 1);
assert.ok(!classes.has('effects-paused'));
motion.matches = true;
motion.change();
assert.equal(frames.size, 0, 'Reduced motion draws a static frame without a loop');
assert.ok(draws > hiddenDraws);
motion.matches = false;
motion.change();
motion.change();
assert.equal(frames.size, 1, 'Repeated preference changes keep only one animation loop');
console.log('Canvas: single loop, resize, hidden-tab pause/resume and reduced motion passed.');
