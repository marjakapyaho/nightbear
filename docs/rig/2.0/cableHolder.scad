include <config.scad>;

use <roundedCube.scad>;

$fn = 50;

wallThickness = 3;
thinWallThickness = 1.5;
backStrengthening = 4;
width = 25;
height = 17;
betweenPlugs = 14;
topPlugDepth = 7.3;
topPlugWidth = 10.2 + 1;
botPlugDepth = 11.5;
botPlugWidth = 18 + 1;
botPlugOffset = 6;
plugsSpreadDeg = 1.7;
outerRounding = 3;
innerRounding = 1.2;
textEmbedBy = 1;
totalOuterHeight = thinWallThickness + botPlugDepth + betweenPlugs + topPlugDepth + thinWallThickness;
magic = 0.001;

difference() {

  // Main body:
  translate([ -backStrengthening, 0, 0 ])
  roundedCube(
    backStrengthening + width,
    height,
    totalOuterHeight,
    r = outerRounding
  );

  // Bottom plug holder:
  translate([ wallThickness, height / -2, thinWallThickness ])
  rotate([ plugsSpreadDeg / -2, 0, 0 ])
  roundedCube(
    botPlugWidth,
    height * 2,
    botPlugDepth,
    r = innerRounding
  );

  // Top plug holder:
  translate([ wallThickness, height / -2, thinWallThickness + botPlugDepth + betweenPlugs ])
  rotate([ plugsSpreadDeg / 2, 0, 0 ])
  roundedCube(
    topPlugWidth,
    height * 2,
    topPlugDepth,
    r = innerRounding
  );

  // Middle excess space:
  translate([ wallThickness, height / -2, thinWallThickness + botPlugDepth + wallThickness ])
  roundedCube(
    width,
    height * 2,
    betweenPlugs - wallThickness * 2,
    r = innerRounding
  );

  translate([ -backStrengthening + textEmbedBy - magic, height * 0.35, totalOuterHeight / 2 ])
  rotate([ 0, -90, 0 ])
  linear_extrude(height = textEmbedBy)
  text("^ ^ ^", halign = "center", valign = "center");

}
