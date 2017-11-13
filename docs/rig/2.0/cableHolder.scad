include <config.scad>;

use <roundedCube.scad>;

$fn = 50;

wallThickness = 3;
width = 25;
height = 15;
betweenPlugs = 14;
topPlug = 7.3;
botPlug = 11.5;
rounding = 3;
totalOuterHeight = wallThickness + botPlug + betweenPlugs + topPlug + wallThickness;

difference() {

  // Main body:
  roundedCube(
    width,
    height,
    totalOuterHeight,
    r = rounding
  );

  // Bottom plug holder:
  translate([ wallThickness, height / -2, wallThickness ])
  roundedCube(
    width * 2,
    height * 2,
    botPlug,
    r = rounding
  );

  // Top plug holder:
  translate([ wallThickness, height / -2, wallThickness + botPlug + betweenPlugs ])
  roundedCube(
    width * 2,
    height * 2,
    topPlug,
    r = rounding
  );

  // Middle excess space:
  translate([ wallThickness, height / -2, wallThickness + botPlug + wallThickness ])
  roundedCube(
    width * 2,
    height * 2,
    betweenPlugs - wallThickness * 2,
    r = rounding
  );

}
