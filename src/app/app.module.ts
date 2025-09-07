import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from 'src/upload/upload.module';
import { AllExceptionsFilter } from 'src/commom/filters/all-exceptions.filter';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PostModule,
    ConfigModule.forRoot({
      isGlobal: true, // para ñ precisar importar em cada módulo
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 10,
          blockDuration: 5000,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return {
          type: 'postgres',
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME,
          database: process.env.DB_DATABASE,
          password: process.env.DB_PASSWORD,
          autoLoadEntities: process.env.DB_AUTO_LOAD_ENTITIES === '1', // Carrega entidades sem precisar especificá-las
          synchronize: process.env.DB_SYNCHRONIZE === '1', // Sincroniza com o BD. Ñ deve ser usado em prod
        };
      },
    }),
    UploadModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
