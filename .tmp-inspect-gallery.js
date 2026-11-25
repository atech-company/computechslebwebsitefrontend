const fs = require("fs");
const h = fs.readFileSync(".tmp-product.html", "utf8");
for (const needle of [
  "catalog-knockout",
  "catalog-stage",
  "object-contain",
  "aspect-[4/3]",
  "aspect-square",
]) {
  console.log(needle, h.includes(needle));
}
const img = h.match(/<img[^>]+>/g) || [];
console.log("img count", img.length);
for (const tag of img.slice(0, 6)) {
  console.log(tag.slice(0, 500));
  console.log("---");
}
