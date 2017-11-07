include <config.scad>;

use <roundedCube.scad>;

// Example:
dexcom(0.5);

module dexcom(
  withTolerance = 0,
  extendDownBy = 0
) {

  // Main body:
  minkowski() {
    translate([ DEXCOM_WIDTH / -2, 0, -extendDownBy ])
    roundedCube(
      DEXCOM_WIDTH,
      DEXCOM_HEIGHT,
      DEXCOM_DEPTH + extendDownBy,
      r = DEXCOM_ROUNDING,
      flatTop = true,
      flatBottom = true
    );
    translate([ -withTolerance, -withTolerance, -withTolerance ])
    cube([ withTolerance * 2, withTolerance * 2, withTolerance * 2 ]);
  }

  // Screen access:
  screenMargin = 4.7;
  screenHeight = 46.9;
  screenSpace = 15;
  translate([ DEXCOM_WIDTH / -2 + screenMargin, DEXCOM_HEIGHT - screenHeight - screenMargin, DEXCOM_DEPTH ])
  roundedCube(
    DEXCOM_WIDTH - screenMargin * 2,
    screenHeight,
    screenSpace,
    r = GLOBAL_ROUNDING,
    flatTop = true,
    flatBottom = true
  );

  // Keypad access:
  keypadDiameter = 30;
  keypadDistance = 25; // from the bottom edge
  translate([ 0, keypadDistance, DEXCOM_DEPTH ])
  cylinder(r = keypadDiameter / 2, h = screenSpace);

  // Bottom access:
  bottomMargin = 7;
  bottomSpace = 10;
  translate([ DEXCOM_WIDTH / -2 + bottomMargin, -bottomSpace, -withTolerance ])
  translate([ 0, 0, -extendDownBy ])
  cube([
    DEXCOM_WIDTH - bottomMargin * 2,
    bottomSpace,
    DEXCOM_DEPTH + withTolerance * 2 + extendDownBy
  ]);

}
