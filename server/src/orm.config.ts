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
      type: 'mysql',
      // explicitly load driver to work in monorepo / workspace
      driver: require('mysql2'),
      host: 'sql.microservices.appf4s.io.vn', // your container/service hostname
      port: 3307, // default MySQL port
      database: 'ms_route', // your DB name
      username: 'root', // your DB user
      password: '', // your password
      logging: false,
      // synchronize: false,
    };
  } else if (process.env.BACKEND_ENV === 'test') {
    ormconfig = {
      name: 'default',
      type: 'mysql',
      // explicitly load driver to work in monorepo / workspace
      driver: require('mysql2'),
      host: 'sql.microservices.appf4s.io.vn', // your container/service hostname
      port: 3307, // default MySQL port
      database: 'ms_route', // your DB name
      username: 'root', // your DB user
      password: '', // your password
      logging: false,
      // synchronize: false,
    };
  } else if (process.env.BACKEND_ENV === 'dev') {
    ormconfig = {
      name: 'default',
      type: 'mysql',
      // explicitly load driver to work in monorepo / workspace
      driver: require('mysql2'),
      host: 'sql.microservices.appf4s.io.vn', // your container/service hostname
      port: 3307, // default MySQL port
      database: 'ms_route', // your DB name
      username: 'root', // your DB user
      password: '', // your password
      logging: false,
      // synchronize: false,
    };
  } else {
    ormconfig = {
      name: 'default',
      type: 'mysql',
      // explicitly load driver to work in monorepo / workspace
      driver: require('mysql2'),
      host: 'sql.microservices.appf4s.io.vn', // your container/service hostname
      port: 3307, // default MySQL port
      database: 'ms_route', // your DB name
      username: 'root', // your DB user
      password: '', // your password
      logging: false,
      // synchronize: false,
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
