require('dotenv').config({ path: '../../../../.env' });

import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import passport = require('passport');
import session = require('express-session');
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { config } from './config';
import { loadVaultSecrets, setupSSHTunnel, registerWithConsul } from '@repo/startup-utils';

const logger = new Logger('Main');
const port = process.env.NODE_SERVER_PORT ?? config.get('server.port');

async function bootstrap(): Promise<void> {
  await loadVaultSecrets(config, logger);

  // Setup SSH tunnel before registering with Consul
  await setupSSHTunnel(config, logger, port);

  registerWithConsul(config, logger, port);

  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: () => new BadRequestException('Validation error'),
      forbidUnknownValues: false,
    }),
  );

  app.getHttpAdapter().getInstance().set('etag', false);

  app.use(
    session({
      secret: config.get('jhipster.security.session.secret'),
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: 240000 },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req: any, res: any, next: any) => {
    if (req.session.user == null && req.path.startsWith(config.get('jhipster.swagger.path'))) {
      return res.redirect('/oauth2/authorization/oidc');
    }
    next();
  });

  const staticClientPath = config.getClientPath();
  if (fs.existsSync(staticClientPath)) {
    logger.log(`Serving static client resources on ${staticClientPath}`);
  } else {
    logger.log('No client it has been found');
  }

  setupSwagger(app);

  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

bootstrap();
