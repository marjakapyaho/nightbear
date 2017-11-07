include <config.scad>;

use <roundedCube.scad>;
use <dexcom.scad>;
use <samsung.scad>;
use <mophie.scad>;

$fn = 50;

rig();

stripTopDownBy = 0;
magic = 0.001;
toleranceAroundDevices = 0.25;
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
  translate([ (RIG_WIDTH - DEXCOM_WIDTH) / -2 + RIG_WALL_THICKNESS, longestDevice - DEXCOM_HEIGHT, DEXCOM_DEPTH ])
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
      RIG_WIDTH + RIG_SIDE_COMPT,
      RIG_TRUNK_LENGTH + longestDevice + RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + DEXCOM_DEPTH + MOPHIE_DEPTH + SAMSUNG_DEPTH + toleranceBetweenDevices * 2 + toleranceAroundDevices - magic - stripTopDownBy,
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
      RIG_WIDTH - RIG_WALL_THICKNESS * 2 + RIG_SIDE_COMPT,
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
      RIG_WIDTH - RIG_WALL_THICKNESS * 2 + RIG_SIDE_COMPT,
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
      RIG_WIDTH - RIG_WALL_THICKNESS * 2 + RIG_SIDE_COMPT,
      longestDevice - SAMSUNG_HEIGHT - RIG_WALL_THICKNESS * 2 + RIG_TRUNK_LENGTH,
      SAMSUNG_DEPTH + toleranceAroundDevices * 2
    ]);
    // Dexcom right side compartment:
    translate([
      RIG_WALL_THICKNESS + DEXCOM_WIDTH + RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + RIG_TRUNK_LENGTH + (longestDevice - DEXCOM_HEIGHT) - RIG_WALL_THICKNESS * 2 - magic,
      RIG_WALL_THICKNESS - toleranceAroundDevices
    ])
    cube([
      (RIG_WIDTH + RIG_SIDE_COMPT - DEXCOM_WIDTH) - RIG_WALL_THICKNESS * 3,
      RIG_WALL_THICKNESS + DEXCOM_HEIGHT,
      DEXCOM_DEPTH + toleranceBetweenDevices
    ]);
    // Mophie & Samsung right side compartment:
    translate([
      RIG_WALL_THICKNESS + SAMSUNG_WIDTH + RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + RIG_TRUNK_LENGTH - RIG_WALL_THICKNESS * 2 - magic,
      RIG_WALL_THICKNESS
    ])
    cube([
      (RIG_WIDTH + RIG_SIDE_COMPT - SAMSUNG_WIDTH) - RIG_WALL_THICKNESS * 3,
      RIG_WALL_THICKNESS + SAMSUNG_HEIGHT,
      DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices - toleranceAroundDevices + SAMSUNG_DEPTH + toleranceAroundDevices * 2
    ]);
  }
  // Support pillar:
  translate([ RIG_WIDTH / -2, -RIG_TRUNK_LENGTH, 0 ])
  translate([
    RIG_WALL_THICKNESS + SAMSUNG_WIDTH,
    RIG_WALL_THICKNESS + RIG_TRUNK_LENGTH - RIG_WALL_THICKNESS * 2,
    RIG_WALL_THICKNESS
  ])
  cube([
    RIG_WALL_THICKNESS,
    25, // this is kind of arbitrary, as long as it's enough to support the weight of the overhang
    DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices - toleranceAroundDevices + SAMSUNG_DEPTH + toleranceAroundDevices * 2
  ]);
}
