import { CONFIG } from "@/lib/config";

export function degToRad(angle: number) {
  return (angle * Math.PI) / 180;
}

export function calculateRange(
  speed: number,
  angleDeg: number,
  gravity: number,
) {
  if (gravity === 0) return 0;
  const rad = degToRad(angleDeg);
  return (speed ** 2 * Math.sin(2 * rad)) / Math.abs(gravity);
}

export function calculateMaxHeight(
  speed: number,
  angleDeg: number,
  gravity: number,
) {
  if (gravity === 0) return 0;
  const rad = degToRad(angleDeg);
  return (speed ** 2 * Math.sin(rad) ** 2) / (2 * Math.abs(gravity));
}

export function getPhysicsAtTime(
  t: number,
  v0: number,
  angleDeg: number,
  g = 9.81,
) {
  const rad = degToRad(angleDeg);
  const v0x = v0 * Math.cos(rad);
  const v0y = v0 * Math.sin(rad);

  const x = v0x * t;
  const y = Math.max(0, v0y * t - 0.5 * g * t * t);

  const vx = v0x;
  const vy = v0y - g * t;

  return { x, y, vx, vy };
}

export const calculateFlightTime = (
  speed: number,
  deg: number,
  gravity: number
) => (gravity > 0 ? (2 * speed * Math.sin(degToRad(deg))) / gravity : 0);
export const metersToPx = (meters: number) => meters * CONFIG.PPM;
export const pxToMeters = (pixels: number) => pixels / CONFIG.PPM;
