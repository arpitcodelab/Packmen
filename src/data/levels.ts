import { FruitType } from '../core/types';

export interface LevelConfig {
  level: number;
  fruit: FruitType;
  fruitPoints: number;
  pacSpeed: number;
  ghostSpeed: number;
  ghostTunnelSpeed: number;
  elroy1Dots: number;
  elroy1Speed: number;
  elroy2Dots: number;
  elroy2Speed: number;
  pacFrightSpeed: number;
  ghostFrightSpeed: number;
  frightDuration: number;
  frightFlashes: number;
}

export const FRUIT_POINTS: Record<FruitType, number> = {
  cherry: 100,
  strawberry: 300,
  orange: 500,
  apple: 700,
  melon: 1000,
  galaxian: 2000,
  bell: 3000,
  key: 5000,
};

export const LEVELS: LevelConfig[] = [
  // Level 1
  {
    level: 1,
    fruit: 'cherry',
    fruitPoints: 100,
    pacSpeed: 0.80,
    ghostSpeed: 0.75,
    ghostTunnelSpeed: 0.40,
    elroy1Dots: 20,
    elroy1Speed: 0.80,
    elroy2Dots: 10,
    elroy2Speed: 0.85,
    pacFrightSpeed: 0.90,
    ghostFrightSpeed: 0.50,
    frightDuration: 6.0,
    frightFlashes: 5,
  },
  // Level 2
  {
    level: 2,
    fruit: 'strawberry',
    fruitPoints: 300,
    pacSpeed: 0.90,
    ghostSpeed: 0.85,
    ghostTunnelSpeed: 0.45,
    elroy1Dots: 30,
    elroy1Speed: 0.90,
    elroy2Dots: 15,
    elroy2Speed: 0.95,
    pacFrightSpeed: 0.95,
    ghostFrightSpeed: 0.55,
    frightDuration: 5.0,
    frightFlashes: 5,
  },
  // Level 3
  {
    level: 3,
    fruit: 'orange',
    fruitPoints: 500,
    pacSpeed: 0.90,
    ghostSpeed: 0.85,
    ghostTunnelSpeed: 0.45,
    elroy1Dots: 40,
    elroy1Speed: 0.90,
    elroy2Dots: 20,
    elroy2Speed: 0.95,
    pacFrightSpeed: 0.95,
    ghostFrightSpeed: 0.55,
    frightDuration: 4.0,
    frightFlashes: 5,
  },
  // Level 4
  {
    level: 4,
    fruit: 'orange',
    fruitPoints: 500,
    pacSpeed: 0.90,
    ghostSpeed: 0.85,
    ghostTunnelSpeed: 0.45,
    elroy1Dots: 40,
    elroy1Speed: 0.90,
    elroy2Dots: 20,
    elroy2Speed: 0.95,
    pacFrightSpeed: 0.95,
    ghostFrightSpeed: 0.55,
    frightDuration: 3.0,
    frightFlashes: 5,
  },
  // Level 5
  {
    level: 5,
    fruit: 'apple',
    fruitPoints: 700,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 40,
    elroy1Speed: 1.00,
    elroy2Dots: 20,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 2.0,
    frightFlashes: 5,
  },
  // Level 6
  {
    level: 6,
    fruit: 'apple',
    fruitPoints: 700,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 50,
    elroy1Speed: 1.00,
    elroy2Dots: 25,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 5.0,
    frightFlashes: 5,
  },
  // Level 7
  {
    level: 7,
    fruit: 'melon',
    fruitPoints: 1000,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 50,
    elroy1Speed: 1.00,
    elroy2Dots: 25,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 2.0,
    frightFlashes: 5,
  },
  // Level 8
  {
    level: 8,
    fruit: 'melon',
    fruitPoints: 1000,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 50,
    elroy1Speed: 1.00,
    elroy2Dots: 25,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 2.0,
    frightFlashes: 5,
  },
  // Level 9
  {
    level: 9,
    fruit: 'galaxian',
    fruitPoints: 2000,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 60,
    elroy1Speed: 1.00,
    elroy2Dots: 30,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 1.0,
    frightFlashes: 3,
  },
  // Level 10
  {
    level: 10,
    fruit: 'galaxian',
    fruitPoints: 2000,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 60,
    elroy1Speed: 1.00,
    elroy2Dots: 30,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 5.0,
    frightFlashes: 5,
  },
  // Level 11
  {
    level: 11,
    fruit: 'bell',
    fruitPoints: 3000,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 60,
    elroy1Speed: 1.00,
    elroy2Dots: 30,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 2.0,
    frightFlashes: 5,
  },
  // Level 12
  {
    level: 12,
    fruit: 'bell',
    fruitPoints: 3000,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 80,
    elroy1Speed: 1.00,
    elroy2Dots: 40,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 1.0,
    frightFlashes: 3,
  },
  // Level 13+
  {
    level: 13,
    fruit: 'key',
    fruitPoints: 5000,
    pacSpeed: 1.00,
    ghostSpeed: 0.95,
    ghostTunnelSpeed: 0.50,
    elroy1Dots: 80,
    elroy1Speed: 1.00,
    elroy2Dots: 40,
    elroy2Speed: 1.05,
    pacFrightSpeed: 1.00,
    ghostFrightSpeed: 0.60,
    frightDuration: 1.0,
    frightFlashes: 3,
  },
];

export function getLevelConfig(level: number): LevelConfig {
  const idx = Math.max(0, Math.min(level - 1, LEVELS.length - 1));
  return LEVELS[idx];
}
