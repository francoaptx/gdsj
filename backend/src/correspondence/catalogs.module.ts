import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from './office.entity';
import { Position } from './position.entity';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Office, Position])],
  controllers: [CatalogsController],
  providers: [CatalogsService],
})
export class CatalogsModule {}