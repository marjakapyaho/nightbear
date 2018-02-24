// Example:
color("red")
cube([ 40, 5, 5 ]);
color("green")
distributeChildren(
  alongX = 40,
  childX = 5,
  paddingX = 5
) {
  cube([ 5, 5, 30 ]);
  cube([ 5, 5, 30 ]);
  cube([ 5, 5, 30 ]);
}

module distributeChildren(
  alongX, // space available for distributing the children into
  childX = 0, // i.e. the width of a single child
  paddingX = 0 // distance of 1st and last children "from the sides"
) {
  if ($children == 1) {
    // A single child is just centered:
    translate([ alongX / 2 - childX / 2, 0, 0 ]) children(0);
  } else {
    // More children will be distributed:
    for (i = [ 0 : $children - 1 ]) {
      x = paddingX + (alongX - paddingX * 2 - childX) / ($children - 1) * i;
      translate([ x, 0, 0 ]) children(i);
    }
  }
}
