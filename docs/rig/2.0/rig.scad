include <config.scad>;

use <roundedCube.scad>;
use <distributeChildren.scad>;

use <dexcom.scad>;
use <samsung.scad>;
use <mophie.scad>;

$fn = 50;

rig();

stripTopDownBy = 0;
magic = 0.01;
toleranceAroundDevices = 0.25;
toleranceBetweenDevices = 0.5;
longestDevice = SAMSUNG_HEIGHT;
widestDevice = SAMSUNG_WIDTH;
gillHeight = 27;
gillSlit = 4;
gillStrikeThrough = RIG_WALL_THICKNESS * 2;
deviceBottomSpace = 20;
internalDividerThickness = RIG_WALL_THICKNESS * 1.5;

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
  dexcom(
    toleranceAroundDevices,
    extendDownBy = toleranceBetweenDevices,
    bottomSpace = (longestDevice + deviceBottomSpace) - DEXCOM_HEIGHT
  );
  // Mophie:
  color("LightGreen")
  translate([ 0, longestDevice - MOPHIE_HEIGHT, DEXCOM_DEPTH + toleranceBetweenDevices ])
  mophie(
    toleranceAroundDevices,
    extendUpBy = toleranceBetweenDevices,
    bottomSpace = (longestDevice + deviceBottomSpace) - MOPHIE_HEIGHT
  );
  // Samsung:
  color("LightSkyBlue")
  translate([ 0, 0, DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices ])
  samsung(
    toleranceAroundDevices,
    bottomSpace = (longestDevice + deviceBottomSpace) - SAMSUNG_HEIGHT
  );
}

module bottomHalf() {
  color("Thistle")
  translate([ RIG_WIDTH / -2, -RIG_TRUNK_LENGTH, 0 ])
  difference() {
    // Rig main body:
    roundedCube(
      RIG_WIDTH,
      RIG_TRUNK_LENGTH + longestDevice + RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + DEXCOM_DEPTH + MOPHIE_DEPTH + SAMSUNG_DEPTH + toleranceBetweenDevices * 2 - magic - stripTopDownBy,
      r = OUTER_ROUNDING,
      flatTop = true
    );
    // Dexcom trunk space:
    dexcomTrunkWidth = RIG_WIDTH - 20.5; // arbitrary, but matches Dex's upstairs neighbor nicely
    translate([
      (RIG_WIDTH - dexcomTrunkWidth) / 2,
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS - toleranceAroundDevices
    ])
    roundedCube(
      dexcomTrunkWidth,
      longestDevice - DEXCOM_HEIGHT - RIG_WALL_THICKNESS - internalDividerThickness + RIG_TRUNK_LENGTH,
      DEXCOM_DEPTH + toleranceBetweenDevices + magic,
      r = INNER_ROUNDING,
      flatTop = true
    );
    // Shared trunk space:
    translate([
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS - toleranceAroundDevices
    ])
    roundedCube(
      RIG_WIDTH - RIG_WALL_THICKNESS * 2,
      longestDevice - SAMSUNG_HEIGHT - RIG_WALL_THICKNESS - internalDividerThickness + RIG_TRUNK_LENGTH,
      toleranceAroundDevices + DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices + SAMSUNG_DEPTH,
      r = INNER_ROUNDING,
      flatTop = true
    );
  }
}

module gillSlit(shortenBy = 0) {
  rotate([ 90, 0, 0 ])
  hull() {
    translate([ 0, 0, -gillStrikeThrough ])
    cylinder(r = gillSlit / 2 - magic, h = gillStrikeThrough);
    translate([ 0, gillHeight - shortenBy, -gillStrikeThrough ])
    cylinder(r = gillSlit / 2 - magic, h = gillStrikeThrough);
  }
}

module hook() {
  difference() {
    translate([ -5/2, 0, 0 ])
    rotate([ 0, 0, 90 ])
    rotate([ 90, 0, 0 ])
    difference() {
      cylinder(r = 8, h = 5);
      cylinder(r = 5, h = 5);
    }
    translate([ -10, -10, -8 ])
    cube([ 20, 20, 10 ]);
  }
}

module cableFlap() {
  cableFlapWidth = 15;
  cableFlapExtension = 16;
  cableFlapSpace = 4.5;
  cableFlapTop = 12;
  cableFlapLeft = 20;
  cableFlapRounding = RIG_WALL_THICKNESS / 2 - magic;
  translate([ -cableFlapLeft, -cableFlapSpace - RIG_WALL_THICKNESS, cableFlapTop ])
  roundedCube(
    RIG_WALL_THICKNESS,
    cableFlapSpace + RIG_WALL_THICKNESS,
    cableFlapWidth,
    r = cableFlapRounding,
    flatBack = true
  );
  translate([ -cableFlapLeft - cableFlapExtension + RIG_WALL_THICKNESS, -cableFlapSpace - RIG_WALL_THICKNESS, cableFlapTop ])
  roundedCube(
    cableFlapExtension,
    RIG_WALL_THICKNESS,
    cableFlapWidth,
    r = cableFlapRounding
  );
}
