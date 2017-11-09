include <config.scad>;

use <roundedCube.scad>;
use <distributeChildren.scad>;

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
gillHeight = 27;
gillSlit = 4;
gillStrikeThrough = RIG_WALL_THICKNESS * 2;

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
    roundedCube(
      RIG_WIDTH - RIG_WALL_THICKNESS * 2 + RIG_SIDE_COMPT,
      longestDevice - DEXCOM_HEIGHT - RIG_WALL_THICKNESS * 2 + RIG_TRUNK_LENGTH,
      DEXCOM_DEPTH + toleranceBetweenDevices,
      r = GLOBAL_ROUNDING,
      flatTop = true,
      flatBack = true
    );
    // Mophie trunk space:
    translate([
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + DEXCOM_DEPTH
    ])
    roundedCube(
      RIG_WIDTH - RIG_WALL_THICKNESS * 2 + RIG_SIDE_COMPT,
      longestDevice - MOPHIE_HEIGHT - RIG_WALL_THICKNESS * 2 + RIG_TRUNK_LENGTH,
      MOPHIE_DEPTH + toleranceBetweenDevices * 2,
      r = GLOBAL_ROUNDING,
      flatTop = true,
      flatBottom = true
    );
    // Samsung trunk space:
    translate([
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices - toleranceAroundDevices
    ])
    roundedCube(
      RIG_WIDTH - RIG_WALL_THICKNESS * 2 + RIG_SIDE_COMPT,
      longestDevice - SAMSUNG_HEIGHT - RIG_WALL_THICKNESS * 2 + RIG_TRUNK_LENGTH,
      SAMSUNG_DEPTH + toleranceAroundDevices * 2,
      r = GLOBAL_ROUNDING,
      flatTop = true,
      flatBottom = true,
      flatBack = true
    );
    // Dexcom right side compartment:
    translate([
      RIG_WALL_THICKNESS + DEXCOM_WIDTH + RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + RIG_TRUNK_LENGTH + (longestDevice - DEXCOM_HEIGHT) - RIG_WALL_THICKNESS * 2 - magic,
      RIG_WALL_THICKNESS - toleranceAroundDevices
    ])
    roundedCube(
      (RIG_WIDTH + RIG_SIDE_COMPT - DEXCOM_WIDTH) - RIG_WALL_THICKNESS * 3,
      RIG_WALL_THICKNESS + DEXCOM_HEIGHT,
      DEXCOM_DEPTH + toleranceBetweenDevices,
      r = GLOBAL_ROUNDING,
      flatTop = true,
      flatFront = true
    );
    // Mophie & Samsung right side compartment:
    translate([
      RIG_WALL_THICKNESS + SAMSUNG_WIDTH + RIG_WALL_THICKNESS,
      RIG_WALL_THICKNESS + RIG_TRUNK_LENGTH - RIG_WALL_THICKNESS * 2 - magic,
      RIG_WALL_THICKNESS
    ])
    roundedCube(
      (RIG_WIDTH + RIG_SIDE_COMPT - SAMSUNG_WIDTH) - RIG_WALL_THICKNESS * 3,
      RIG_WALL_THICKNESS + SAMSUNG_HEIGHT,
      DEXCOM_DEPTH + toleranceBetweenDevices + MOPHIE_DEPTH + toleranceBetweenDevices - toleranceAroundDevices + SAMSUNG_DEPTH + toleranceAroundDevices * 2,
      r = GLOBAL_ROUNDING,
      flatTop = true,
      flatFront = true
    );
    // Gills for the right side:
    translate([ RIG_WIDTH + RIG_SIDE_COMPT + gillStrikeThrough / 4, 0, RIG_WALL_THICKNESS + 5 ])
    rotate([ 0, 0, 90 ])
    distributeChildren(
      alongX = longestDevice + RIG_TRUNK_LENGTH + RIG_WALL_THICKNESS * 3, // space available for distributing the children into
      childX = gillSlit, // i.e. the width of a single child
      paddingX = 15 // distance of 1st and last children "from the sides"
    ) {
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit();
    }
    // Gills for the left side:
    translate([ gillStrikeThrough / 1.2, 0, RIG_WALL_THICKNESS + 5 ])
    rotate([ 0, 0, 90 ])
    distributeChildren(
      alongX = longestDevice + RIG_TRUNK_LENGTH + RIG_WALL_THICKNESS * 3, // space available for distributing the children into
      childX = gillSlit, // i.e. the width of a single child
      paddingX = 12 // distance of 1st and last children "from the sides"
    ) {
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit(5);
      gillSlit();
      group() {} // i.e. empty place
      group() {} // i.e. empty place
      group() {} // i.e. empty place
      gillSlit();
      gillSlit();
      gillSlit();
      gillSlit(10);
      gillSlit(10);
      gillSlit(10);
      gillSlit();
    }
    // Charger outlet:
    outletSize = 12;
    translate([ (RIG_WIDTH + RIG_SIDE_COMPT) / 2, 0, 0 ]) { // center
      translate([ 0, RIG_WALL_THICKNESS + 1, outletSize ])
      rotate([ 90, 0, 0 ])
      cylinder(r = outletSize / 2, h = 10);
    }
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
  translate([ RIG_WIDTH / -2 + (RIG_WIDTH + RIG_SIDE_COMPT) / 2, -RIG_TRUNK_LENGTH, 0 ]) { // center at the end
    // Charger cable floor attachment:
    translate([ 0, 10, 1 ])
    hook();
    // Cable flaps:
    cableFlap();
    mirror([ 1, 0, 0 ])
    cableFlap();
    // Cable hook:
    translate([ 0, 0, 32 ])
    difference() {
      hook();
      translate([ -5, 0, 0 ])
      cube([ 10, 10, 10 ]);
    }
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
