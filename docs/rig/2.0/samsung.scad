include <config.scad>;

use <roundedCube.scad>;

// Example:
samsung(0.5);

module samsung(
  withTolerance = 0
) {

  // Main body:
  minkowski() {
    translate([ SAMSUNG_WIDTH / -2, 0, 0 ])
    roundedCube(
      SAMSUNG_WIDTH,
      SAMSUNG_HEIGHT,
      SAMSUNG_DEPTH,
      r = SAMSUNG_ROUNDING,
      flatTop = true,
      flatBottom = true
    );
    translate([ -withTolerance, -withTolerance, -withTolerance ])
    cube([ withTolerance * 2, withTolerance * 2, withTolerance * 2 ]);
  }

  // Screen access:
  screenHorMargin = 2.7;
  screenVerMargin = 10;
  screenSpace = 15;
  translate([ SAMSUNG_WIDTH / -2 + screenHorMargin, 0, SAMSUNG_DEPTH ])
  #roundedCube(
    SAMSUNG_WIDTH - screenHorMargin * 2,
    SAMSUNG_HEIGHT - screenVerMargin,
    screenSpace,
    r = GLOBAL_ROUNDING,
    flatTop = true,
    flatBottom = true
  );

  // Bottom access:
  bottomWith = 14;
  bottomSpace = 32;
  translate([ bottomWith / -2, -bottomSpace, 0 ])
  #cube([
    bottomWith,
    bottomSpace,
    SAMSUNG_DEPTH
  ]);

  // Camera bump:
  cameraDiameter = 25;
  cameraDistance = 15;
  translate([
    cameraDiameter / -2 + cameraDiameter / 2,
    SAMSUNG_HEIGHT - cameraDistance,
    -SAMSUNG_CAM_BUMP_HEIGHT
  ])
  #cylinder(r = cameraDiameter / 2, h = SAMSUNG_CAM_BUMP_HEIGHT);

  // Buttons access:
  buttonsSpace = 30;
  buttonsHeight = 46 - 17;
  buttonsVertExtra = 0;
  translate([
    SAMSUNG_WIDTH / -2 - buttonsSpace,
    SAMSUNG_HEIGHT - buttonsHeight - 17,
    -buttonsVertExtra
  ])
  #roundedCube(
    SAMSUNG_WIDTH + buttonsSpace * 2,
    buttonsHeight,
    SAMSUNG_DEPTH + buttonsVertExtra * 2,
    r = 2.5
  );

}
