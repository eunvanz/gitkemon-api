const RANK_UNIT = 0.06;

export const MYTH_CHANCE = 1200;

export const RANK_RULE = {
  SS: {
    CHANCE: 7,
    RANGE: { MIN: 1.01 + RANK_UNIT * 3, MAX: 1 + RANK_UNIT * 4 },
  },
  S: {
    CHANCE: 13,
    RANGE: { MIN: 1.01 + RANK_UNIT * 2, MAX: 1 + RANK_UNIT * 3 },
  },
  A: {
    CHANCE: 15,
    RANGE: { MIN: 1.01 + RANK_UNIT * 1, MAX: 1 + RANK_UNIT * 2 },
  },
  B: {
    CHANCE: 15,
    RANGE: { MIN: 1.01, MAX: 1 + RANK_UNIT * 1 },
  },
  C: {
    CHANCE: 20,
    RANGE: { MIN: 1.01 - RANK_UNIT, MAX: 1 },
  },
  D: {
    CHANCE: 10,
    RANGE: { MIN: 1.01 - RANK_UNIT * 2, MAX: 1 - RANK_UNIT },
  },
  E: {
    CHANCE: 10,
    RANGE: { MIN: 1.01 - RANK_UNIT * 3, MAX: 1 - RANK_UNIT * 2 },
  },
  F: {
    CHANCE: 10,
    RANGE: { MIN: 1.01 - RANK_UNIT * 4, MAX: 1 - RANK_UNIT * 3 },
  },
};

export const DAYS_IN_A_ROW_PAYBACK = {
  RARE: 3,
  ELITE: 15,
  LEGEND: 30,
};

export const EVERY_CONTRIBUTION_PAYBACK = {
  BASIC_RARE: 3,
  RARE: 20,
  ELITE: 500,
  LEGEND: 1000,
};

export const TRAINER_CLASS = [
  -1, 200, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000,
  7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 999999999,
];
