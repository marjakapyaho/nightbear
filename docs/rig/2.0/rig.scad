include <config.scad>;

use <roundedCube.scad>;
use <dexcom.scad>;
use <samsung.scad>;
use <mophie.scad>;

$fn = 50;

rig();

magic = 0.0001;
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
  translate([ RIG_WIDTH / -2, -RIG_TRUNK_LENGTH, 0 ])
  difference() {
    roundedCube(
      RIG_WIDTH,
      RIG_TRUNK_LENGTH + longestDevice + RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + DEXCOM_DEPTH + MOPHIE_DEPTH + SAMSUNG_DEPTH + toleranceBetweenDevices * 2 + toleranceAroundDevices - magic,
      r = GLOBAL_ROUNDING,
      flatTop = true
    );
    // Dexcom trunk space:
    translate([
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS - toleranceAroundDevices
    ])
    cube([
      RIG_WIDTH - RIG_WALL_THICKNESS * 2,
      longestDevice - DEXCOM_HEIGHT - RIG_WALL_THICKNESS * 2 + RIG_TRUNK_LENGTH,
      DEXCOM_DEPTH + toleranceBetweenDevices
    ]);
    // Mophie trunk space:
    translate([
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + DEXCOM_DEPTH
    ])
    cube([
      RIG_WIDTH - RIG_WALL_THICKNESS * 2,
      longestDevice - MOPHIE_HEIGHT - RIG_WALL_THICKNESS * 2 + RIG_TRUNK_LENGTH,
      MOPHIE_DEPTH + toleranceBetweenDevices * 2
    ]);
    // Samsung trunk space:
    translate([
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices - toleranceAroundDevices
    ])
    cube([
      RIG_WIDTH - RIG_WALL_THICKNESS * 2,
      longestDevice - SAMSUNG_HEIGHT - RIG_WALL_THICKNESS * 2 + RIG_TRUNK_LENGTH,
      SAMSUNG_DEPTH + toleranceAroundDevices * 2
    ]);

  }
}
