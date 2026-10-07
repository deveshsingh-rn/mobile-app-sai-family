export type NaamJapSwipeDirection = "right" | "up";

type GestureVector = {
  dx: number;
  dy: number;
  vx: number;
  vy: number;
};

export const getNaamJapSwipeDirection = (
  gesture: GestureVector,
  relaxed = false
): NaamJapSwipeDirection | null => {
  const distance = relaxed ? 10 : 14;
  const quickDistance = 7;
  const quickVelocity = 0.3;
  const right =
    gesture.dx >= distance ||
    (!relaxed && gesture.dx >= quickDistance && gesture.vx > quickVelocity);
  const up =
    gesture.dy <= -distance ||
    (!relaxed && gesture.dy <= -quickDistance && gesture.vy < -quickVelocity);

  if (right && up) {
    return gesture.dx >= Math.abs(gesture.dy) ? "right" : "up";
  }
  if (right) return "right";
  if (up) return "up";
  return null;
};
