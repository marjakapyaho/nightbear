include <config.scad>;

use <roundedCube.scad>;

// Example:
samsung(0.5);

module samsung(
  withTolerance = 0,
  bottomSpace = 10
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
  roundedCube(
    SAMSUNG_WIDTH - screenHorMargin * 2,
    SAMSUNG_HEIGHT - screenVerMargin,
    screenSpace,
    r = 2.5,
    flatTop = true,
    flatBottom = true
  );

  // Bottom access:
  bottomWidth = 25;
  bottomMargin = (SAMSUNG_WIDTH - bottomWidth) / 2;
  translate([ SAMSUNG_WIDTH / -2 + bottomMargin, -bottomSpace, -withTolerance ])
  cube([
    SAMSUNG_WIDTH - bottomMargin * 2,
    bottomSpace,
    SAMSUNG_DEPTH + withTolerance * 2
  ]);

  // Camera bump:
  cameraDiameter = 25;
  cameraDistance = 15;
  translate([
    cameraDiameter / -2 + cameraDiameter / 2,
    SAMSUNG_HEIGHT - cameraDistance,
    -SAMSUNG_CAM_BUMP_HEIGHT
  ])
  cylinder(r = cameraDiameter / 2, h = SAMSUNG_CAM_BUMP_HEIGHT);

  // Buttons access:
  buttonsSpace = 30;
  buttonsHeight = 46 - 17;
  buttonsVertExtra = 0.7;
  translate([
    SAMSUNG_WIDTH / -2 - buttonsSpace,
    SAMSUNG_HEIGHT - buttonsHeight - 17,
    -buttonsVertExtra
  ])
  roundedCube(
    SAMSUNG_WIDTH + buttonsSpace * 2, // note: use "* 2" to have the power button also accessible
    buttonsHeight,
    SAMSUNG_DEPTH + buttonsVertExtra * 2,
    r = 2.5,
    flatTop = true
  );

  // Notification LED access:
  ledDiameter = 7;
  translate([ SAMSUNG_WIDTH / -2 + 12.7, SAMSUNG_HEIGHT - ledDiameter / 2, SAMSUNG_DEPTH ])
  cylinder(r = ledDiameter / 2, h = screenSpace);

  // Ambient light sensor access:
  translate([ SAMSUNG_WIDTH / -2 + 23, SAMSUNG_HEIGHT - ledDiameter / 2, SAMSUNG_DEPTH ])
  cylinder(r = ledDiameter / 2, h = screenSpace);

}
