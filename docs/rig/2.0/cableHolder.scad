include <config.scad>;

use <roundedCube.scad>;

$fn = 50;

wallThickness = 1.8;
thinWallThickness = 1.5;
backStrengthening = 4;
width = 28;
height = 17;
betweenPlugs = 14 - 1;
topPlugDepth = 7.3 + 0.25; // +tolerance
topPlugWidth = 10.2 + 1.5; // +tolerance
topPlugSpread = 1;
botPlugDepth = 11.5 + 0.25; // +tolerance
botPlugWidth = 18 + 1.5; // +tolerance
botPlugSpread = 0;
botPlugOffset = 2.3;
botPlugExtension = 5;
outerRounding = 2;
innerRounding = 1.2;
textEmbedBy = 1;
totalOuterHeight = thinWallThickness + botPlugDepth + betweenPlugs + topPlugDepth + thinWallThickness;
magic = 0.001;

difference() {

  union() {

    // Main body:
    translate([ -backStrengthening, 0, 0 ])
    roundedCube(
      backStrengthening + width,
      height,
      totalOuterHeight,
      r = outerRounding
    );

    // Bottom plug support extension:
    translate([ -backStrengthening, 0, 0 ])
    roundedCube(
      backStrengthening + width,
      height + botPlugExtension,
      thinWallThickness + botPlugDepth + wallThickness,
      r = outerRounding,
      flatTop = true
    );

  }

  // Bottom plug holder:
  translate([ wallThickness + botPlugOffset, height / -2, thinWallThickness ])
  rotate([ -botPlugSpread, 0, 0 ])
  #roundedCube(
    botPlugWidth,
    height * 2,
    botPlugDepth,
    r = innerRounding
  );

  // Top plug holder:
  translate([ wallThickness, height / -2, thinWallThickness + botPlugDepth + betweenPlugs ])
  rotate([ topPlugSpread, 0, 0 ])
  #roundedCube(
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

  // Direction markers:
  translate([ -backStrengthening + textEmbedBy - magic, height * 0.35, totalOuterHeight / 2 ])
  rotate([ 0, -90, 0 ])
  linear_extrude(height = textEmbedBy)
  text("^ ^ ^", halign = "center", valign = "center");

}
