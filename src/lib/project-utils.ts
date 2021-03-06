import { isEqual, random, round, xor } from 'lodash';
import { Collection } from 'src/collections/collection.entity';
import {
  RANK_RULE,
  TRAINER_CLASS,
  TRAINER_CLASS_LIMIT_UNIT,
} from 'src/constants/rules';
import { MonImage } from 'src/mon-images/mon-image.entity';
import { Mon } from 'src/mons/mon.entity';
import { MonPotential, MonTier } from 'src/types';
import { User } from 'src/users/user.entity';
import { capitalize } from './utils';

export const statNames = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

export const getLevelUpCollection = (
  collection: Collection,
  mon: Mon,
  user: User,
) => {
  if (
    collection.total - collection.baseTotal + mon.colPoint >
    user.trainerClass * TRAINER_CLASS_LIMIT_UNIT
  ) {
    // level up is not available due to trainer class limit
    return collection;
  }
  const { colPoint } = mon;
  const updatedCollection: Partial<Collection> = {
    level: collection.level + 1,
    total: collection.total + colPoint,
  };
  Array.from({ length: colPoint }).forEach(() => {
    const statIndex = random(0, 5);
    const statName = statNames[statIndex];
    if (!updatedCollection[statName]) {
      updatedCollection[statName] = collection[statName];
    }
    updatedCollection[statName]++;
  });

  return updatedCollection;
};

export const getLevelDownCollection = (
  collection: Collection,
  mon: Mon,
  amount: number,
) => {
  const { colPoint } = mon;
  const updatedCollection: Partial<Collection> = {
    level: collection.level - amount,
    total: collection.total - colPoint * amount,
    hp: collection.hp,
    attack: collection.attack,
    defense: collection.defense,
    specialAttack: collection.specialAttack,
    specialDefense: collection.specialDefense,
    speed: collection.speed,
  };
  const getStatName = () => {
    const statIndex = random(0, 5);
    const statName = statNames[statIndex];
    if (
      updatedCollection[statName] - 1 <
      collection[`base${capitalize(statName)}` as keyof Collection]
    ) {
      return getStatName();
    }
    return statName;
  };
  Array.from({ length: colPoint * amount }).forEach(() => {
    const statName = getStatName();
    if (!updatedCollection[statName]) {
      updatedCollection[statName] = collection[statName];
    }
    updatedCollection[statName]--;
  });

  return updatedCollection;
};

export const getCollectionFromMon = ({
  mon,
  monImages,
  userId,
}: {
  mon: Mon;
  monImages: MonImage[];
  userId: string;
}) => {
  const hp = getRandomStat(mon.hp);
  const attack = getRandomStat(mon.attack);
  const defense = getRandomStat(mon.defense);
  const specialAttack = getRandomStat(mon.specialAttack);
  const specialDefense = getRandomStat(mon.specialDefense);
  const speed = getRandomStat(mon.speed);
  const total = hp + attack + defense + specialAttack + specialDefense + speed;
  const monImage = monImages[random(0, monImages.length - 1)];
  const potential = getPotentialFromTotal(total, mon.total);
  const collection: Partial<Collection> = {
    monId: mon.id,
    level: 1,
    height: round(mon.height * random(0.5, 1.5), 1),
    weight: round(mon.weight * random(0.5, 1.5), 1),
    hp,
    attack,
    defense,
    specialAttack,
    specialDefense,
    speed,
    total,
    baseHp: hp,
    baseAttack: attack,
    baseDefense: defense,
    baseSpecialAttack: specialAttack,
    baseSpecialDefense: specialDefense,
    baseSpeed: speed,
    baseTotal: total,
    monImageId: monImage.id,
    monImageUrl: monImage.imageUrl,
    potential,
    userId,
    stars: mon.stars,
    tier: mon.tier,
    firstType: mon.firstType,
    secondType: mon.secondType,
    evolutionLevel: mon.evolutionLevel,
    name: mon.name,
    nameKo: mon.nameKo,
    nameJa: mon.nameJa,
    nameZh: mon.nameZh,
    colPoint: mon.colPoint,
  };
  return collection;
};

export const getRandomStat = (stat: number) => {
  const idx = random(0, 100);
  if (idx > 100 - RANK_RULE.SS.CHANCE) {
    return round(stat * random(RANK_RULE.SS.RANGE.MIN, RANK_RULE.SS.RANGE.MAX));
  } else if (idx > 100 - RANK_RULE.SS.CHANCE - RANK_RULE.S.CHANCE) {
    return round(stat * random(RANK_RULE.S.RANGE.MIN, RANK_RULE.S.RANGE.MAX));
  } else if (
    idx >
    100 - RANK_RULE.SS.CHANCE - RANK_RULE.S.CHANCE - RANK_RULE.A.CHANCE
  ) {
    return round(stat * random(RANK_RULE.A.RANGE.MIN, RANK_RULE.A.RANGE.MAX));
  } else if (
    idx >
    100 -
      RANK_RULE.SS.CHANCE -
      RANK_RULE.S.CHANCE -
      RANK_RULE.A.CHANCE -
      RANK_RULE.B.CHANCE
  ) {
    return round(stat * random(RANK_RULE.B.RANGE.MIN, RANK_RULE.B.RANGE.MAX));
  } else if (
    idx >
    100 -
      RANK_RULE.SS.CHANCE -
      RANK_RULE.S.CHANCE -
      RANK_RULE.A.CHANCE -
      RANK_RULE.B.CHANCE -
      RANK_RULE.C.CHANCE
  ) {
    return round(stat * random(RANK_RULE.C.RANGE.MIN, RANK_RULE.C.RANGE.MAX));
  } else if (
    idx >
    100 -
      RANK_RULE.SS.CHANCE -
      RANK_RULE.S.CHANCE -
      RANK_RULE.A.CHANCE -
      RANK_RULE.B.CHANCE -
      RANK_RULE.C.CHANCE -
      RANK_RULE.D.CHANCE
  ) {
    return round(stat * random(RANK_RULE.D.RANGE.MIN, RANK_RULE.D.RANGE.MAX));
  } else if (
    idx >
    100 -
      RANK_RULE.SS.CHANCE -
      RANK_RULE.S.CHANCE -
      RANK_RULE.A.CHANCE -
      RANK_RULE.B.CHANCE -
      RANK_RULE.C.CHANCE -
      RANK_RULE.D.CHANCE -
      RANK_RULE.E.CHANCE
  ) {
    return round(stat * random(RANK_RULE.E.RANGE.MIN, RANK_RULE.E.RANGE.MAX));
  } else {
    return round(stat * random(RANK_RULE.F.RANGE.MIN, RANK_RULE.F.RANGE.MAX));
  }
};

export const getPotentialFromTotal: (
  total: number,
  monTotal: number,
) => MonPotential = (total, monTotal) => {
  const ratio = total / monTotal;
  if (ratio >= RANK_RULE.SS.RANGE.MIN) return 'SS';
  else if (ratio >= RANK_RULE.S.RANGE.MIN) return 'S';
  else if (ratio >= RANK_RULE.A.RANGE.MIN) return 'A';
  else if (ratio >= RANK_RULE.B.RANGE.MIN) return 'B';
  else if (ratio >= RANK_RULE.C.RANGE.MIN) return 'C';
  else if (ratio >= RANK_RULE.D.RANGE.MIN) return 'D';
  else if (ratio >= RANK_RULE.E.RANGE.MIN) return 'E';
  else if (ratio >= RANK_RULE.F.RANGE.MIN) return 'F';
};

export const getBlendResultTier: (tiers: MonTier[]) => MonTier = (tiers) => {
  const number = random(0, 100);
  if (
    isEqual(tiers, ['rare', 'rare']) ||
    isEqual(tiers, ['s.rare', 's.rare'])
  ) {
    if (number < 15) return 'elite';
    if (number < 50) return 'rare';
    else return 'basic';
  } else if (isEqual(tiers, ['elite', 'elite'])) {
    if (number < 20) return 'legend';
    else return 'elite';
  } else if (isEqual(tiers, ['legend', 'legend'])) {
    if (number < 20) return 'myth';
    else return 'legend';
  } else if (isEqual(tiers, ['myth', 'myth'])) {
    return 'myth';
  } else {
    if (number < 30) return 'rare';
    else return 'basic';
  }
};

export const getSpecialBlendResult: (
  collections: Collection[],
) => number[] | undefined = (collections) => {
  if (
    xor(
      collections.map((collection) => collection.monId),
      [90, 79],
    ).length === 0
  ) {
    // ?????? & ??????
    return [80, 199];
  } else if (
    xor(
      collections.map((collection) => collection.monId),
      [588, 616],
    ).length === 0
  ) {
    // ????????? & ?????????
    return [589, 617];
  } else if (
    xor(
      collections.map((collection) => collection.monId),
      [223, 458],
    ).length === 0
  ) {
    // ?????? & ?????????
    return [226];
  } else {
    return undefined;
  }
};

export const getTrainerClass = (colPoint: number) => {
  return (
    TRAINER_CLASS.findIndex(
      (number, index) =>
        colPoint >= number && TRAINER_CLASS[index + 1] > colPoint,
    ) + 1
  );
};

export const checkIsRareCaseCollection = (collection: Collection) => {
  return (
    collection.tier === 'myth' ||
    collection.tier === 'legend' ||
    collection.potential === 'SS' ||
    collection.potential === 'S'
  );
};
