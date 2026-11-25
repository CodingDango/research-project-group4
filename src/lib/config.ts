import type { ThemeColors } from "@/types/types";

export const CONFIG = {
  ASPECT: 800 / 500,
  GROUND_Y: 350,
  BALL_RADIUS: 15,
  SIM_SPEED: 4,
  CLOUD_SEED: 6767,
  PPM: 2, // 2 pixels for 1 meter i think
  DASH_LENGTH: 6,
  DASH_GAP: 4,
  GRID_STEP: 15,
  MIN_ZOOM: 0.25,
  MAX_ZOOM: 4,
  GRID: {
    dark: {
      gridLineStroke: 0.8,
    },

    light: {
      gridLineStroke: 0.25,
    },
  },

  COLORS: {
    dark: {
      ball: "#df6035",
      ballBorder: "#FFFFFF",
      apexLine: "#FFFFFF",
      rangeLine: "#FFFFFF",
      trajectory: "#f33e54",
      gridText: "#FFFFFF",
      badgeBg: "#202020",
      badgeOutline: "#484848",
      badgeSecondaryText: "#df6035",
      gridBg: "#202020",
      gridLines: "#2a2a2a",
      gridAxis: "#7a787a",
      hudText: "#FFF",
      point: "#df6035",
      pointOutline: "#df6035",
    } as ThemeColors,
    light: {
      gridBg: "#ffffff",
      gridLine: "#999999",
      gridAxis: "#161616",
      ball: "#df6035",
      ballBorder: "#df6035",
      rangeLine: "#1A1919",
      apexLine: "#1A1919",
      badgeBg: "rgba(30, 30, 30, 0.9)",
      badgeOutline: "#444",
      badgeText: "#efefef",
      badgeTextSecondary: "#aaa",
      hudText: "#000000",
      trajectory: "#f33e54",
      gridText: "#FFFFFF",
      badgeSecondaryText: "#df6035",
      gridLines: "#2a2a2a",
      point: "#df6035",
      pointOutline: "#df6035",
    } as ThemeColors,
  },
};

// export const CONFIG = {
//   ASPECT: 800 / 500,
//   GROUND_Y: 350,
//   BALL_RADIUS: 15,
//   SIM_SPEED: 4,
//   CLOUD_SEED: 6767,
//   PPM: 2, // 2 pixels for 1 meter i think
//   DASH_LENGTH: 6,
//   DASH_GAP: 4,
//   GRID_STEP: 15,
//   MIN_ZOOM: 0.25,
//   MAX_ZOOM: 4,
//   COLORS: {
//     ball: "#df6035",
//     ballBorder: "#FFFFFF",
//     apexLineColorCoords: "#FFFFFF",
//     rangeLineColorCoords: "#FFFFFF",
//     trajectoryColor: "#f33e54",
//     coordinateTextColor: "#FFFFFF",
//     floatingBadgeBg: '#202020',
//     floatingBadgeOutline: '#484848',
//     floatingBadgeSecondaryText: '#df6035'
//   },
// };
