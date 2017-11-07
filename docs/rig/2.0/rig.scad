include <config.scad>;

use <roundedCube.scad>;
use <dexcom.scad>;
use <samsung.scad>;
use <mophie.scad>;

$fn = 25;
// $fn = 50;

// rig();

wall = 3;
tol = 0.75;
bump = 1;
r = 5;

// Body:
difference() {
  roundedCube(
    40,
    40,
    30,
    r = r,
    flatTop = true
  );
  translate([ wall, wall, wall ])
  roundedCube(
    40 - wall * 2,
    40 - wall * 2,
    30,
    r = r - wall,
    flatTop = true
  );
  // Grooves:
  translate([ 0, 0, 25 ])
  rotate([ 0, 90, 0 ])
  cylinder(r = bump, h = 40);
  translate([ 0, 0 + 40, 25 ])
  rotate([ 0, 90, 0 ])
  cylinder(r = bump, h = 40);
  translate([ 40, 0, 25 ])
  rotate([ 0, 90, 90 ])
  cylinder(r = bump, h = 40);
  translate([ 0, 0, 25 ])
  rotate([ 0, 90, 90 ])
  cylinder(r = bump, h = 40);
}
// Lid:
*union() {
  translate([ -wall - tol, -wall - tol, 30 - 15 + r - 0 ])
  difference() {
    roundedCube(
      40 + wall * 2 + tol * 2,
      40 + wall * 2 + tol * 2,
      15,
      r = r + tol,
      flatBottom = true
    );
    translate([ wall, wall, 0 ])
    roundedCube(
      40 + tol * 2,
      40 + tol * 2,
      15 - wall,
      r = 1,
      flatBottom = true
    );
  }

  // Bumps:
  translate([ r, 0 - tol, 25 ])
  rotate([ 0, 90, 0 ])
  cylinder(r = bump, h = 40 - r * 2);
  translate([ r, 0 + 40 + tol, 25 ])
  rotate([ 0, 90, 0 ])
  cylinder(r = bump, h = 40 - r * 2);
  translate([ 40 + tol, 0 + r, 25 ])
  rotate([ 0, 90, 90 ])
  cylinder(r = bump, h = 40 - r * 2);
  translate([ 0 - tol, 0 + r, 25 ])
  rotate([ 0, 90, 90 ])
  cylinder(r = bump, h = 40 - r * 2);
}

toleranceAroundDevices = 0.5;
toleranceBetweenDevices = 2;
longestDevice = SAMSUNG_HEIGHT;
widestDevice = SAMSUNG_WIDTH;

module rig() {
  difference() {
    bottomHalf();
    translate([ 0, 0, RIG_WALL_THICKNESS ])
    deviceStack();
  }
}

module deviceStack() {
  // Dexcom:
  color("SandyBrown")
  translate([ 0, longestDevice - DEXCOM_HEIGHT, DEXCOM_DEPTH ])
  rotate([ 0, 180, 0 ])
  dexcom(toleranceAroundDevices, extendDownBy = toleranceBetweenDevices);
  // Mophie:
  color("LightGreen")
  translate([ 0, longestDevice - MOPHIE_HEIGHT, DEXCOM_DEPTH + toleranceBetweenDevices ])
  mophie(toleranceAroundDevices, extendUpBy = toleranceBetweenDevices);
  // Samsung:
  color("LightSkyBlue")
  translate([ 0, 0, DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices ])
  samsung(toleranceAroundDevices);
}

module bottomHalf() {
  color("Thistle")
  translate([ RIG_WIDTH / -2, 0, 0 ])
  roundedCube(
    RIG_WIDTH,
    longestDevice + RIG_WALL_THICKNESS,
    RIG_WALL_THICKNESS + DEXCOM_DEPTH + MOPHIE_DEPTH + SAMSUNG_DEPTH + toleranceBetweenDevices * 2,
    r = GLOBAL_ROUNDING,
    flatTop = true
  );
}
