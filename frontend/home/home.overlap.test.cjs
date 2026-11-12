const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(`${__dirname}/home.js`, "utf8");
const start = source.indexOf("function updateMenuNameOverlap()");
const end = source.indexOf("// Se recalcula solo", start);
assert.ok(start >= 0 && end > start);
let desktop = true;
let open = true;
let hidden;
let reads = 0;
const menu = { left: 100, right: 500, top: 20, bottom: 60 };
const content = { left: 50, right: 550, top: 40, bottom: 100, width: 500, height: 60 };
const context = vm.createContext({
  document: { body: { classList: { contains: () => open } } },
  window: { matchMedia: () => ({ matches: desktop }) },
  topMenu: {
    getBoundingClientRect: () => { reads++; return menu; },
    classList: { toggle: (_, value) => { hidden = value; } },
  },
  menuOverlapContent: [{ getBoundingClientRect: () => content }],
});
vm.runInContext(source.slice(start, end), context);
function check(expected) {
  vm.runInContext("updateMenuNameOverlap()", context);
  assert.equal(hidden, expected);
}
check(true);
content.top = 100; check(false);
content.top = 40;
desktop = false;
const previousReads = reads;
check(false);
assert.equal(reads, previousReads, "The mobile drawer must remain visible without geometry reads");
desktop = true;
open = false; check(false);
console.log("Menu: desktop overlap, mobile drawer and closed state passed.");
