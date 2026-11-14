const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(`${__dirname}/inicio.js`, "utf8");
async function scenario({ failedFont = false, loaded = false, failedImage = false } = {}) {
  const classes = new Set(["is-loading"]);
  let delayDone, loadDone;
  const frames = [];
  let cleared;
  let elapsed;
  let finishFont, finishImage;
  const image = new Promise((resolve, reject) => { finishImage = failedImage ? reject : resolve; });
  const font = new Promise((resolve, reject) => { finishFont = failedFont ? reject : resolve; });
  const window = {
    portfolioIntroFallback: 99,
    requestAnimationFrame: callback => frames.push(callback),
    setTimeout: (callback, delay) => { delayDone = callback; elapsed = delay; },
    clearTimeout: id => { cleared = id; },
    addEventListener: (event, callback, options) => { assert.equal(event, "load"); assert.ok(options.once); loadDone = callback; },
  };
  vm.runInNewContext(source, {
    window, performance: { now: () => 400 },
    document: {
      readyState: loaded ? "complete" : "interactive",
      fonts: { load: () => font },
      images: [{ decode: () => image }],
      documentElement: { classList: { add: name => classes.add(name), remove: (...names) => names.forEach(name => classes.delete(name)) } },
    },
  });
  const flush = () => new Promise(resolve => setImmediate(resolve));
  assert.equal(elapsed, undefined, "The delay must wait until the intro can be painted");
  frames.shift()();
  assert.equal(elapsed, undefined);
  frames.shift()();
  assert.ok(classes.has("intro-running"));
  assert.equal(elapsed, 1250);
  assert.ok(classes.has("is-loading"));
  delayDone(); await flush();
  assert.ok(classes.has("is-loading"), "The delay alone must not expose unloaded fonts");
  if (!loaded) loadDone();
  await flush();
  assert.ok(classes.has("is-loading"));
  finishFont(); await flush();
  assert.ok(classes.has("is-loading"), "The intro must wait for images in distant sections to decode");
  finishImage(); await flush();
  assert.ok(!classes.has("is-loading"));
  assert.ok(!classes.has("intro-running"));
  assert.equal(cleared, 99);
  assert.ok(!("portfolioIntroFallback" in window));
}
(async () => {
  await scenario();
  await scenario({ failedFont: true, loaded: true });
  await scenario({ failedImage: true });
  console.log("Intro: minimum delay, page/font/image gates, resource failures and fallback cleanup passed.");
})().catch(error => { console.error(error); process.exitCode = 1; });
