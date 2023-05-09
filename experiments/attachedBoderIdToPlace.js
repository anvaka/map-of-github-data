const fs = require('fs');
let borders = JSON.parse( fs.readFileSync('../v1/borders.geojson', 'utf8'));
let places = JSON.parse( fs.readFileSync('../v1/places.geojson', 'utf8'));

let centroids = []
let maxDistance = 0;

borders.features.forEach(f => {
  if (f.geometry.type !== 'Polygon') return;
  let centroid = getPolygonCentroid(f.geometry.coordinates[0]);
  centroids.push({
    id: f.id,
    centroid
  });
});

places.features.forEach(p => {
  let nearestCentroid = centroids.reduce((acc, c) => {
    let centroid = c.centroid;
    let distance = Math.sqrt( 
      Math.pow(p.geometry.coordinates[0] - centroid[0], 2) + 
      Math.pow(p.geometry.coordinates[1] - centroid[1], 2)
    );
    if (distance < acc.distance) {
      return {distance, id: c.id};
    }
    return acc;
  }, {distance: Infinity, id: null});
  p.properties.ownerId = nearestCentroid.id;
});

fs.writeFileSync('../v1/places-bound.geojson', JSON.stringify(places));

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