const fs = require('fs');
let borders = JSON.parse( fs.readFileSync('../v1/borders.geojson', 'utf8'));

let features = borders.features;
let allDistances = []
let maxDistance = 0;

features.forEach( f => {
  if (f.geometry.type !== 'Polygon') return;
  let centroid = getPolygonCentroid(f.geometry.coordinates[0]);
  let distanceToZero = Math.sqrt(centroid[0]*centroid[0] + centroid[1]*centroid[1]);
  allDistances.push(distanceToZero);
  if (distanceToZero > maxDistance) {
    maxDistance = distanceToZero;
  }
});

features.forEach( f => {

  if (f.geometry.type !== 'Polygon') return;
  let centroid = getPolygonCentroid(f.geometry.coordinates[0]);
  let distanceToZero = Math.sqrt(centroid[0]*centroid[0] + centroid[1]*centroid[1]);
  let distanceToZeroNormalized = distanceToZero / maxDistance;
  let hue = 360 * distanceToZeroNormalized;
  let originalColor = hexToHSL(f.properties.fill);
  f.properties.fill = `hsl(${hue}, ${originalColor[1]}%, ${originalColor[2]}%)`;
});
fs.writeFileSync('borders-hue.geojson', JSON.stringify(borders));

function hexToHSL(hex) {
  // Convert hex to RGB first
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length == 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r,g,b),
      cmax = Math.max(r,g,b),
      delta = cmax - cmin,
      h = 0,
      s = 0,
      l = 0;
  if (delta == 0)
    h = 0;
  else if (cmax == r)
    h = ((g - b) / delta) % 6;
  else if (cmax == g)
    h = (b - r) / delta + 2;
  else
    h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0)
    h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return [h, s, l];
}

function getPolygonCentroid(polygon) {
  let area = 0;
  let x = 0;
  let y = 0;
  let points = polygon.length;
  let i, j, f, point1, point2;

  for (i = 0, j = points - 1; i < points; j = i, i++) {
    point1 = polygon[i];
    point2 = polygon[j];
    f = point1[1] * point2[0] - point2[1] * point1[0];
    x += (point1[0] + point2[0]) * f;
    y += (point1[1] + point2[1]) * f;
    area += f * 3;
  }
  return [x / area, y / area];
}