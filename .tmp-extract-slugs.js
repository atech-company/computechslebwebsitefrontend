const fs = require("fs");
const h = fs.readFileSync(".tmp-shop.html", "utf8");
const m = [...h.matchAll(/href="(?:\/en)?\/product\/([^"]+)"/g)].map((x) => x[1]);
console.log([...new Set(m)].slice(0, 20).join("\n"));
console.log("catalog-knockout", h.includes("catalog-knockout"));
