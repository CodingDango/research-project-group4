export interface PhysicsState {
  angle: number;
  speed: number;
  gravity: number;
  bounciness: number;
  friction: number;
  isPaused: boolean;
  mode: PhysicsStateMode;
  resetBallCount: number;
  launchCount: number;
  resetCameraCount: number;
  zoom: number;
}

export interface PhysicsStats {
  range: number;
  maxHeight: number;
  airTime: number;
  velocity: number;
}

export type PhysicsStatsSetter = React.Dispatch<React.SetStateAction<PhysicsStats>>;

export type PhysicsStateSetter = (
  key: keyof PhysicsState,
  value: number | boolean | PhysicsStateMode,
) => void;

export type PhysicsStateMode = "sandbox" | "coordinate";

export interface ThemeColors {
  ball: string;
  ballBorder: string;
  apexLine: string;
  rangeLine: string;
  trajectory: string;
  gridText: string;
  badgeBg: string;
  badgeOutline: string;
  badgeSecondaryText: string;
  gridBg: string;
  gridLines: string;
  gridAxis: string;
  hudText: string;
}

export type Theme = 'light' | 'dark';

export interface AppSelectItem {
  label: string;
  value: string;
}
