import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mon } from 'src/mons/mon.entity';
import { PokeBall } from 'src/poke-balls/poke-ball.entity';
import { User } from 'src/users/user.entity';
import { Collection } from './collection.entity';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, PokeBall, Collection, Mon])],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionModule {}
