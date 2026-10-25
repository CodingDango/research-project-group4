export interface PhysicsState {
  angle: number;
  speed: number;
  gravity: number;
  bounciness: number;
  friction: number;
}

export interface AppSelectItem {
  label: string;
  value: string;
}