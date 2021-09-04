import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mon } from 'src/mons/mon.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { RareNews } from 'src/rare-news/rare-news.entity';
import { User } from 'src/users/user.entity';
import { Collection } from './collection.entity';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PokeBall, Collection, Mon, RareNews]),
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionModule {}
