import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SeedUsersRoles1570200490072 } from './migrations/1570200490072-SeedUsersRoles';
import { CreateTables1570200270081 } from './migrations/1570200270081-CreateTables';
import { User } from './domain/user.entity';
import { Authority } from './domain/authority.entity';
// jhipster-needle-add-entity-to-ormconfig-imports - JHipster will add code here, do not remove

function ormConfig(): TypeOrmModuleOptions {
  let ormconfig: TypeOrmModuleOptions;

  if (process.env.BACKEND_ENV === 'prod') {
    ormconfig = {
      name: 'default',
      type: 'postgres',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('pg'),
      database: 'gateway',
      host: 'postgresql',
      // port: ,
      username: 'gateway',
      password: '',
      logging: false,
      // synchronize: false,
    };
  } else if (process.env.BACKEND_ENV === 'test') {
    ormconfig = {
      name: 'default',
      type: 'sqlite',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('sqlite3'),
      database: ':memory:',
      logging: true,
    };
  } else if (process.env.BACKEND_ENV === 'dev') {
    ormconfig = {
      name: 'default',
      type: 'postgres',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('sqlite3'),
      database: 'gateway',
      host: '127.0.0.1',
      // port: ,
      username: 'gateway',
      password: '',
      logging: false,
    };
  } else {
    ormconfig = {
      name: 'default',
      type: 'sqlite',
      // typeorm fails to auto load driver due to workspaces resolution
      driver: require('sqlite3'),
      database: `${__dirname}../../target/db/sqlite-dev-db.sql`,
      logging: true,
    };
  }

  return {
    synchronize: process.env.BACKEND_ENV === 'test',
    migrationsRun: true,
    entities: [
      User,
      Authority,
      // jhipster-needle-add-entity-to-ormconfig-entities - JHipster will add code here, do not remove
    ],
    migrations: [
      CreateTables1570200270081,
      SeedUsersRoles1570200490072,
      // jhipster-needle-add-migration-to-ormconfig-migrations - JHipster will add code here, do not remove
    ],
    autoLoadEntities: true,
    ...ormconfig,
  };
}

export { ormConfig };
