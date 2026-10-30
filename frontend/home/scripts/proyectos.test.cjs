const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync(`${__dirname}/proyectos.js`, "utf8");
const classes = new Set();
vm.runInNewContext(source, { document: { querySelector: () => ({ classList: { add: (name) => classes.add(name) } }) } });
assert.ok(classes.has("is-enhanced"));
vm.runInNewContext(source, { document: { querySelector: () => null } });
console.log("Project carousel initialization passed.");
