export interface PhysicsState {
  angle: number;
  speed: number;
  gravity: number;
  bounciness: number;
  friction: number;
  isPaused: boolean;
  mode: PhysicsStateMode;
}

export type PhysicsStateSetter = (key: keyof PhysicsState, value: number | boolean) => void;

export type PhysicsStateMode = 'sandbox' | 'coordinate';

export interface AppSelectItem {
  label: string;
  value: string;
}
