import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { map } from 'rxjs';
import { Repository } from 'typeorm';
import { Mon } from './mon.entity';

@Injectable()
export class MonsService {
  constructor(
    @InjectRepository(Mon)
    private readonly monRepository: Repository<Mon>,
    private readonly httpService: HttpService,
  ) {}

  async findInactiveMons() {
    return await this.monRepository
      .createQueryBuilder('mon')
      .leftJoin('mon.monImages', 'monImage')
      .where('monImage.id IS NULL')
      .getMany();
  }

  async findOne(id: number) {
    return await this.monRepository.findOne(id);
  }

  async initializeMons() {
    Array.from({ length: 898 }).forEach((_, index) => {
      this.httpService
        .get(`https://pokeapi.co/api/v2/pokemon/${index + 1}`)
        .pipe(map((res) => res.data))
        .forEach((mon) => {
          const speciesUrl = mon.species.url;
          this.httpService
            .get(speciesUrl)
            .pipe(map(({ data }) => data))
            .forEach((data) => {
              const {
                is_legendary,
                is_mythical,
                names,
                flavor_text_entries,
                evolves_from_species,
              } = data;

              const evolveFromId = evolves_from_species?.url
                ? Number(
                    (evolves_from_species.url as string)
                      .replace('https://pokeapi.co/api/v2/pokemon-species/', '')
                      .replace('/', ''),
                  )
                : undefined;

              this.monRepository.save({
                id: mon.id,
                order: mon.order,
                name: mon.species.name,
                nameKo: names.find((name) =>
                  (name.language.name as string).startsWith('ko'),
                )?.name,
                nameJa: names.find((name) =>
                  (name.language.name as string).startsWith('ja'),
                )?.name,
                nameZh: names.find((name) =>
                  (name.language.name as string).startsWith('zh'),
                )?.name,
                description: flavor_text_entries.find(
                  (item) => item.language.name === 'en',
                ).flavor_text,
                descriptionKo: flavor_text_entries.find(
                  (item) => item.language.name === 'ko',
                )?.flavor_text,
                descriptionJa: flavor_text_entries.find((item) =>
                  item.language.name.startsWith('ja'),
                )?.flavor_text,
                descriptionZh: flavor_text_entries.find((item) =>
                  item.language.name.startsWith('zh'),
                )?.flavor_text,
                firstType: mon.types[0].type.name,
                secondType: mon.types[1]?.type.name,
                height: mon.height,
                weight: mon.weight,
                tier: is_legendary ? 'elite' : is_mythical ? 'legend' : 'basic',
                hp: mon.stats.find((stat) => stat.stat.name === 'hp').base_stat,
                attack: mon.stats.find((stat) => stat.stat.name === 'attack')
                  .base_stat,
                defense: mon.stats.find((stat) => stat.stat.name === 'defense')
                  .base_stat,
                specialAttack: mon.stats.find(
                  (stat) => stat.stat.name === 'special-attack',
                ).base_stat,
                specialDefense: mon.stats.find(
                  (stat) => stat.stat.name === 'special-defense',
                ).base_stat,
                speed: mon.stats.find((stat) => stat.stat.name === 'speed')
                  .base_stat,
                evolveFromId,
              });
            });
        });
    });
  }
}
