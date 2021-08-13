import { random } from 'lodash';
import { Collection } from 'src/collections/collection.entity';
import { MonPotential } from 'src/types';

export const statNames = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

export const getPotential: (number: number) => MonPotential = (number) => {
  switch (true) {
    case number < 2:
      return 'SS';
    case number < 10:
      return 'S';
    case number < 70:
      return 'A';
    case number < 250:
      return 'B';
    case number < 500:
      return 'C';
    case number < 750:
      return 'D';
    case number < 998:
      return 'E';
    default:
      return 'F';
  }
};

export const getLevelUpCollection = (collection: Collection) => {
  const mon = collection.mon;

  const { colPoint } = mon;
  const updatedCollection: Collection = {
    ...collection,
    level: collection.level + 1,
    total: collection.total + colPoint,
  };
  Array.from({ length: colPoint }).forEach(() => {
    const statIndex = random(0, 5);
    const statName = statNames[statIndex];
    updatedCollection[statName]++;
  });

  return updatedCollection;
};
