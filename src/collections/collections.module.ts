import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mon } from 'src/mons/mon.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { RareNews } from 'src/rare-news/rare-news.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { Collection } from './collection.entity';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PokeBall, Collection, Mon, RareNews]),
    HttpModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService, UsersService],
})
export class CollectionModule {}
