include <config.scad>;

use <roundedCube.scad>;

// Example:
mophie(0.5);

module mophie(
  withTolerance = 0,
  extendUpBy = 0,
  bottomSpace = 10
) {

  // Main body:
  minkowski() {
    translate([ MOPHIE_WIDTH / -2, 0, 0 ])
    roundedCube(
      MOPHIE_WIDTH,
      MOPHIE_HEIGHT,
      MOPHIE_DEPTH + extendUpBy,
      r = MOPHIE_ROUNDING,
      flatTop = true,
      flatBottom = true
    );
    translate([ -withTolerance, -withTolerance, -withTolerance ])
    cube([ withTolerance * 2, withTolerance * 2, withTolerance * 2 ]);
  }

  // Button/lights access:
  buttonsSpace = 30;
  openingDiameter = 14;
  openingSmallerDiameter = 8;
  openingUpTo = 26;
  openingUpFrom = 11;
  translate([ MOPHIE_WIDTH / -2 - buttonsSpace, openingUpTo, MOPHIE_DEPTH / 2 ])
  rotate([ 0, 90, 0 ])
  cylinder(r = openingDiameter / 2, h = buttonsSpace);
  hull() {
    translate([ MOPHIE_WIDTH / -2 - buttonsSpace, openingUpTo, MOPHIE_DEPTH / 2 ])
    rotate([ 0, 90, 0 ])
    cylinder(r = openingSmallerDiameter / 2, h = buttonsSpace);
    translate([ MOPHIE_WIDTH / -2 - buttonsSpace, openingUpFrom, MOPHIE_DEPTH / 2 ])
    rotate([ 0, 90, 0 ])
    cylinder(r = openingSmallerDiameter / 2, h = buttonsSpace);
  }

  // Bottom access:
  bottomMargin = 7;
  translate([ MOPHIE_WIDTH / -2 + bottomMargin, -bottomSpace, -withTolerance ])
  cube([
    MOPHIE_WIDTH - bottomMargin * 2,
    bottomSpace,
    MOPHIE_DEPTH + extendUpBy + withTolerance * 2
  ]);

}
