import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { map } from 'rxjs';
import { MonImage } from 'src/mons/mon-image.entity';
import { Repository, Transaction, TransactionRepository } from 'typeorm';
import { CreateMonDto } from './dto/create-mon.dto';
import { CreateMonImageDto } from './dto/create-mon-image.dto';
import { UpdateMonDto } from './dto/update-mon.dto';
import { Mon } from './mon.entity';
import { uploadFile } from 'src/lib/file-uploader';
import { UpdateMonImageDto } from './dto/update-mon-image.dto';

@Injectable()
export class MonsService {
  constructor(
    @InjectRepository(Mon)
    private readonly monRepository: Repository<Mon>,
    @InjectRepository(MonImage)
    private readonly monImageRepository: Repository<MonImage>,
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

  async saveMonImage(
    monId: number,
    file: Express.Multer.File,
    { designerId, designerName, imageUrl }: CreateMonImageDto,
  ) {
    let uploadedImageUrl: string;
    if (!imageUrl) {
      uploadedImageUrl = await this.uploadMonImage(file, monId, designerName);
    }

    const monToUpdatePromise = this.monRepository.findOne(monId);

    return await this.monImageRepository.save({
      mon: monToUpdatePromise,
      designerId,
      designerName,
      imageUrl: imageUrl || uploadedImageUrl,
    });
  }

  async updateMonImage(
    monId: number,
    monImageId: number,
    file: Express.Multer.File,
    { designerId, designerName, imageUrl }: UpdateMonImageDto,
  ) {
    let uploadedImageUrl: string;
    if (!imageUrl) {
      uploadedImageUrl = await this.uploadMonImage(file, monId, designerName);
    }

    const mon = await this.monRepository.findOne(monId);
    const oldMonImage = await this.monImageRepository.findOne(monImageId);
    const oldMonImageMon = await oldMonImage.mon;

    if (!mon || oldMonImage || oldMonImageMon.id !== mon.id) {
      throw new NotFoundException();
    }

    return await this.monImageRepository.update(monImageId, {
      designerId,
      designerName,
      imageUrl: imageUrl || uploadedImageUrl,
    });
  }

  async uploadMonImage(
    file: Express.Multer.File,
    monId: number,
    designerName: string,
  ) {
    return await uploadFile(file, {
      fileName: `mon_${monId}_${designerName}`,
      path: 'mon-images',
    });
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
