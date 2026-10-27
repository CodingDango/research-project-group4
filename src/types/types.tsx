export interface PhysicsState {
  angle: number;
  speed: number;
  gravity: number;
  bounciness: number;
  friction: number;
  isPaused: boolean;
}

export type PhysicsStateSetter = (key: keyof PhysicsState, value: number | boolean) => void;
  
export interface AppSelectItem {
  label: string;
  value: string;
}