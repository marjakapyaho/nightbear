// Example:
roundedCube(
  x = 30,
  y = 20,
  z = 10,
  r = 3,
  flatBottom = true
);

module roundedCube(
  x,
  y,
  z,
  r = 0,
  flatTop = false,
  flatBottom = false,
  flatLeft = false,
  flatRight = false,
  flatFront = false,
  flatBack = false
) {

  // Calculate [ x, y, z ] compensations based on requested roundings:
  rX = r * (flatLeft && flatRight ? 0 : (flatLeft || flatRight ? 1 : 2));
  rY = r * (flatFront && flatBack ? 0 : (flatFront || flatBack ? 1 : 2));
  rZ = r * (flatTop && flatBottom ? 0 : (flatTop || flatBottom ? 1 : 2));

  // Do some sanity checks:
  if (x - rX <= 0) {
    echo("<b style='color: red'>WARNING</b>: roundedCube() is too small along its x-axis");
  }
  if (y - rY <= 0) {
    echo("<b style='color: red'>WARNING</b>: roundedCube() is too small along its y-axis");
  }
  if (z - rZ <= 0) {
    echo("<b style='color: red'>WARNING</b>: roundedCube() is too small along its z-axis");
  }

  difference() {

    // Main rounded cube:
    translate([
      flatLeft ? 0 : r,
      flatFront ? 0 : r,
      flatBottom ? 0 : r
    ]) {
      minkowski() {
        cube([
          x - rX,
          y - rY,
          z - rZ
        ]);
        sphere(r = r);
      }
    }

    // Optional cutouts:
    // (let's not generate unnecessary geometry)
    if (flatTop) {
      translate([ x / -2, y / -2, z ])
      cube([ x * 2, y * 2, z ]);
    }
    if (flatBottom) {
      translate([ x / -2, y / -2, -z ])
      cube([ x * 2, y * 2, z ]);
    }
    if (flatLeft) {
      translate([ -x, y / -2, z / -2 ])
      cube([ x, y * 2, z * 2 ]);
    }
    if (flatRight) {
      translate([ x, y / -2, z / -2 ])
      cube([ x, y * 2, z * 2 ]);
    }
    if (flatFront) {
      translate([ x / -2, -y, z / -2 ])
      cube([ x * 2, y, z * 2 ]);
    }
    if (flatBack) {
      translate([ x / -2, y, z / -2 ])
      cube([ x * 2, y, z * 2 ]);
    }

  }

}
