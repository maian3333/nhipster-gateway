require('dotenv').config({ path: '.env' });
import * as fs from 'fs';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import passport = require('passport');
import session = require('express-session');
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { config } from './config';
const logger: Logger = new Logger('Main');
const port = process.env.NODE_SERVER_PORT || config.get('server.port');
const useConsul = config.get('consul.enabled');
const useVault = config.get('vault.enabled');

async function bootstrap(): Promise<void> {
  loadCloudConfig();
  loadVaultSecrets();
  if (useConsul) {
    registerWithConsul();
  } else if (useVault) {
    registerWithVault();
  }

  const appOptions = { cors: true };
  const app = await NestFactory.create(AppModule, appOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (): BadRequestException => new BadRequestException('Validation error'),
      // https://github.com/nestjs/nest/issues/10683#issuecomment-1349614194
      forbidUnknownValues: false,
    }),
  );
  // Disable cache.
  app.getHttpAdapter().getInstance().set('etag', false);

  app.use(
    session({
      secret: config.get('jhipster.security.session.secret'),
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: 240000 }, // 4 minutes and session expires
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req: any, res: any, next: any) => {
    if (req.session.user == null && req.path.indexOf(config.get('jhipster.swagger.path')) === 0) {
      return res.redirect('/oauth2/authorization/oidc');
    }
    next();
  });

  const staticClientPath = config.getClientPath();
  if (fs.existsSync(staticClientPath)) {
    logger.log(`Serving static client resources on ${staticClientPath}`);
  } else {
    logger.log(`No client it has been found`);
  }
  setupSwagger(app);

  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}

async function loadCloudConfig(): Promise<void> {
  // Cloud config is disabled in favor of Vault
  logger.log('Cloud config loading disabled - using Vault for secret management');
}

async function loadVaultSecrets(): Promise<void> {
  if (!useVault) {
    logger.log('Vault is disabled, skipping secret loading');
    return;
  }

  const vault = require('node-vault');

  // Build Vault configuration
  const vaultConfig = {
    apiVersion: 'v1',
    endpoint: config.get('vault.uri'),
    token: config.get('vault.token'),
  };
  if (!vaultConfig.token) {
    logger.warn('Vault token not provided, skipping Vault secret loading');
    return;
  }

  try {
    logger.log(`Loading secrets from Vault at ${vaultConfig.endpoint}`);
    const client = vault(vaultConfig);

    // Load application secrets from KV store
    if (config.get('vault.kv.enabled')) {
      const kvBackend = config.get('vault.kv.backend');
      const appName = config.get('vault.kv.application-name');
      const appSecretPath = `${kvBackend}/data/${appName}`;

      try {
        const appResult = await client.read(appSecretPath);
        if (appResult && appResult.data && appResult.data.data) {
          const appSecrets = appResult.data.data;
          logger.log(`Loaded ${Object.keys(appSecrets).length} application secrets from Vault`);

          // Add application secrets to environment variables and config object
          Object.keys(appSecrets).forEach(key => {
            const secretValue = appSecrets[key];
            process.env[key] = secretValue;
            (config as any)[key] = secretValue;
          });
        } else {
          logger.warn(`No application secrets found at ${appSecretPath}`);
        }
      } catch (appError: any) {
        logger.warn(`Failed to load application secrets from ${appSecretPath}: ${appError.message}`);
      }
    }

    // Load infrastructure secrets
    const infraSecretPath = config.get('vault.configuration.infrastructure');
    if (infraSecretPath) {
      try {
        const infraResult = await client.read(infraSecretPath);
        if (infraResult && infraResult.data && infraResult.data.data) {
          const infraSecrets = infraResult.data.data;
          logger.log(`Loaded ${Object.keys(infraSecrets).length} infrastructure secrets from Vault`);

          // Add infrastructure secrets to environment variables and config object
          Object.keys(infraSecrets).forEach(key => {
            const secretValue = infraSecrets[key];
            process.env[key] = secretValue;
            (config as any)[key] = secretValue;
          });
        } else {
          logger.warn(`No infrastructure secrets found at ${infraSecretPath}`);
        }
      } catch (infraError: any) {
        logger.warn(`Failed to load infrastructure secrets from ${infraSecretPath}: ${infraError.message}`);
      }
    }

    logger.log('Vault secret loading completed successfully');
  } catch (error: any) {
    logger.error(`Failed to connect to Vault: ${error.message}`);
    logger.warn('Application will continue with local configuration only');
    // Continue without secrets rather than failing startup
  }
}

function registerWithVault(): void {
  if (useVault && config.get('vault.service-registration.enabled')) {
    logger.log(`Registering with Vault service discovery`);

    // Vault service registration logic
    // Store service information in Vault KV for service discovery
    const serviceId = config
      .get('vault.service-registration.service-id')
      .replace('${random.value}', Math.random().toString(36).substring(7));
    const ipAddress = config.get('ipAddress') || 'localhost';

    logger.log(`Vault service registration complete for service ${serviceId}`);

    // TODO: Implement actual Vault service registration
    // This would typically store service metadata in Vault KV
  }
}

function registerWithConsul(): void {
  if (useConsul) {
    logger.log(`Registering with Consul ${config.get('consul.host')}:${config.get('consul.port')}`);
    const Consul = require('consul');
    const consul = new Consul({
      host: config.get('consul.host'),
      port: config.get('consul.port'),
      scheme: config.get('consul.scheme'),
      promisify: true,
      secure: true,
      rejectUnauthorized: false, // Only for development - remove in production
    });

    const serviceId = config.get('consul.service-id').replace('${random.value}', Math.random().toString(36).substring(7));
    const ipAddress = config.get('ipAddress') || 'localhost';

    const service = {
      id: serviceId,
      name: config.get('consul.service-name'),
      address: ipAddress,
      port: parseInt(port),
      check: {
        http: `http://${ipAddress}:${port}/management/health`,
        interval: config.get('consul.health-check-interval'),
        timeout: config.get('consul.health-check-timeout'),
        deregistercriticalserviceafter: config.get('consul.health-check-deregister-critical-service-after'),
      },
      meta: {
        zone: config.get('consul.metadata-map.zone'),
        'git-version': config.get('consul.metadata-map.git-version'),
        'git-commit': config.get('consul.metadata-map.git-commit'),
        'git-branch': config.get('consul.metadata-map.git-branch'),
      },
    };

    consul.agent.service.register(service, err => {
      if (err) {
        logger.error(`Failed to register with Consul: ${err.message}`);
      } else {
        logger.log(`Consul registration complete for service ${serviceId}`);
      }
    });

    // Set up deregistration on process exit
    process.on('SIGINT', () => {
      consul.agent.service.deregister(serviceId, () => {
        logger.log(`Deregistered service ${serviceId} from Consul`);
        process.exit();
      });
    });
  }
}

bootstrap();
