include <config.scad>;

use <roundedCube.scad>;
use <dexcom.scad>;
use <samsung.scad>;
use <mophie.scad>;

// Example:
rig(0.5);

magic = 0.001;
withTolerance = 0.5;
dexUpShift = 30;
layer1Depth = (RIG_WALL_THICKNESS * 2 + DEXCOM_DEPTH) / 2;
layer2Depth = MOPHIE_DEPTH / 2;

module rig() {
  layer1();
  layer2();
}

module layer1() {
  color("green")
  difference() {
    translate([ RIG_WIDTH / -2, 0, 0 ])
    roundedCube(
      RIG_WIDTH,
      RIG_HEIGHT,
      layer1Depth,
      r = GLOBAL_ROUNDING,
      flatTop = true
    );
    translate([ 0, dexUpShift, DEXCOM_DEPTH + RIG_WALL_THICKNESS ])
    rotate([ 0, 180, 0 ])
    dexcom(withTolerance);
  }
}

module layer2() {
  color("blue")
  difference() {
    translate([ RIG_WIDTH / -2, 0, layer1Depth ])
    roundedCube(
      RIG_WIDTH,
      RIG_HEIGHT,
      layer2Depth,
      r = GLOBAL_ROUNDING,
      flatTop = true,
      flatBottom = true
    );
    translate([ 0, dexUpShift, layer1Depth ])
    mophie(withTolerance);
  }
}
