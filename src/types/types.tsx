export interface PhysicsState {
  angle: number;
  speed: number;
  gravity: number;
  bounciness: number;
  friction: number;
  isPaused: boolean;
  mode: PhysicsStateMode;
  resetCount: number;
}

export interface PhysicsStats {
  distance: number;
  maxHeight: number;
  airTime: number;
  speed: number;
}

export type PhysicsStatsSetter = React.Dispatch<React.SetStateAction<PhysicsStats>>;

export type PhysicsStateSetter = (
  key: keyof PhysicsState,
  value: number | boolean,
) => void;

export type PhysicsStateMode = "sandbox" | "coordinate";

export interface AppSelectItem {
  label: string;
  value: string;
}
