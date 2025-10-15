import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('catalogs')
@UseGuards(JwtAuthGuard)
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get(':catalog')
  findAll(@Param('catalog') catalog: 'offices' | 'positions') {
    return this.catalogsService.findAll(catalog);
  }

  @Post(':catalog')
  @UseGuards(AdminGuard)
  create(@Param('catalog') catalog: 'offices' | 'positions', @Body() createDto: { name: string }) {
    return this.catalogsService.create(catalog, createDto);
  }
}