import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CommomModule } from 'src/commom/commom.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CommomModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
