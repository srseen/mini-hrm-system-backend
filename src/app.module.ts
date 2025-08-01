import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
<<<<<<< HEAD
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
=======
import { ConfigModule } from '@nestjs/config';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
>>>>>>> 77e3e419ebc681ce765a16a36f9174932ac24d75

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
<<<<<<< HEAD
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ตั้งค่า true ชั่วคราวตอน dev
      }),
    }),
    AuthModule,
    UserModule,
=======
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
>>>>>>> 77e3e419ebc681ce765a16a36f9174932ac24d75
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
