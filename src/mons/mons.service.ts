import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { map } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateMonDto } from './dto/create-mon.dto';
import { UpdateMonDto } from './dto/update-mon.dto';
import { Mon } from './mon.entity';

@Injectable()
export class MonsService {
  constructor(
    @InjectRepository(Mon)
    private readonly monRepository: Repository<Mon>,
    private readonly httpService: HttpService,
  ) {}

  async findActiveMons() {
    return await this.monRepository
      .createQueryBuilder('mon')
      .innerJoin('mon.monImages', 'monImage')
      .getMany();
  }

  async findInactiveMons() {
    return await this.monRepository
      .createQueryBuilder('mon')
      .leftJoin('mon.monImages', 'monImage')
      .where('monImage.id IS NULL')
      .getMany();
  }

  async findOne(id: number) {
    const mon = await this.monRepository.findOne(id);

    if (!mon) {
      throw new NotFoundException();
    }

    return mon;
  }

  async update(id: number, updateMonDto: UpdateMonDto) {
    const oldMon = await this.monRepository.findOne(id);

    if (!oldMon) {
      throw new NotFoundException();
    }

    return await this.monRepository.update(id, {
      ...oldMon,
      ...updateMonDto,
    });
  }

  async save(createMonDto: CreateMonDto) {
    return await this.monRepository.save(createMonDto);
  }

  async delete(id: number) {
    return await this.monRepository.delete(id);
  }

  async findAll() {
    const mons = await this.monRepository.find();
    return mons;
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

              const attack: number = mon.stats.find(
                (stat) => stat.stat.name === 'attack',
              ).base_stat;
              const defense: number = mon.stats.find(
                (stat) => stat.stat.name === 'defense',
              ).base_stat;
              const specialAttack: number = mon.stats.find(
                (stat) => stat.stat.name === 'special-attack',
              ).base_stat;
              const specialDefense: number = mon.stats.find(
                (stat) => stat.stat.name === 'special-defense',
              ).base_stat;
              const hp: number = mon.stats.find(
                (stat) => stat.stat.name === 'hp',
              ).base_stat;
              const speed: number = mon.stats.find(
                (stat) => stat.stat.name === 'speed',
              ).base_stat;
              const total: number =
                attack + defense + specialAttack + specialDefense + hp + speed;

              const stars = Math.min(Math.ceil((total - 185) / 50), 10);

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
                hp,
                attack,
                defense,
                specialAttack,
                specialDefense,
                speed,
                total,
                evolveFromId,
                stars,
              });
            });
        });
    });
  }
}
