import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });
const logger = new Logger('Config');

export class Config {
  debugLogging = 'debug';
  'server.port' = '8080';
  'jhipster.clientApp.name' = 'gateway';
  'jhipster.registry.password' = 'admin';
  'jhipster.security.session.secret' = '';
  'jhipster.security.oauth2.client.provider.oidc.issuer-uri' = '';
  'jhipster.security.oauth2.client.registration.oidc.client-id' = '';
  'jhipster.security.oauth2.client.registration.oidc.client-secret' = '';
  'jhipster.mail.base-url' = 'http://127.0.0.1:${server.port}';
  'jhipster.mail.from' = 'gateway@localhost';
  'jhipster.swagger.default-include-pattern' = '/api/.*';
  'jhipster.swagger.title' = 'gateway API';
  'jhipster.swagger.description' = 'gateway API documentation';
  'jhipster.swagger.version' = '0.0.1';
  'jhipster.swagger.path' = '/api/v2/api-docs';
  'consul.enabled' = true;
  'consul.host' = 'consul.appf4s.io.vn';
  'consul.port' = 443;
  'consul.scheme' = 'https';
  'consul.service-name' = 'gateway';
  'consul.service-id' = 'gateway:${random.value}';
  'consul.health-check-interval' = '10s';
  'consul.health-check-timeout' = '5s';
  'consul.health-check-deregister-critical-service-after' = '30s';
  'consul.prefer-ip-address' = true;
  'consul.metadata-map.zone' = 'primary';
  'consul.metadata-map.git-version' = '${git.commit.id.describe:}';
  'consul.metadata-map.git-commit' = '${git.commit.id.abbrev:}';
  'consul.metadata-map.git-branch' = '${git.branch:}';
  'cloud.config.uri' = 'https://consul.appf4s.io.vn:443/v1/kv';
  'cloud.config.name' = 'gateway';
  'cloud.config.profile' = 'prod';
  'cloud.config.label' = 'master';
  'vault.enabled' = true;
  'vault.uri' = 'http://appf4s.io.vn:8200';
  'vault.token' = 'f4security';
  'vault.scheme' = 'http';
  'vault.kv.enabled' = true;
  'vault.kv.backend' = 'secret';
  'vault.kv.application-name' = 'common-kafka';
  'vault.configuration.infrastructure' = 'secret/infrastructure';
  'vault.service-registration.enabled' = true;
  'vault.service-registration.service-name' = 'gateway';
  'vault.service-registration.service-id' = 'gateway:${random.value}';
  'sshTunnel.vpsHost' = 'localhost';
  'sshTunnel.vpsUser' = 'root';
  'sshTunnel.vpsPassword' = '';
  'sshTunnel.servicePort' = 8080;
  'sshTunnel.localPort' = 8080;
  'sshTunnel.devSuffix' = '-dev';

  constructor(properties) {
    this.addAll(properties);
  }

  public get(key: string): any {
    return this[key];
  }

  public getClientPath(): string {
    return path.join(__dirname, '../dist/static');
  }
  public addAll(properties): any {
    properties = objectToArray(properties);
    for (const property in properties) {
      if (properties.hasOwnProperty(property)) {
        this[property] = properties[property];
      }
    }
    this.postProcess();
  }

  public postProcess(): any {
    const variables = { ...this, ...process.env };
    for (const property in this) {
      if (this.hasOwnProperty(property)) {
        const value = this[property];
        const processedValue = this.processTemplate(value, variables);
        this[property] = processedValue;
      }
    }
  }

  private processTemplate(template: any, variables: Record<string, any>): any {
    if (typeof template !== 'string') return template;

    return template.replace(/\${([^}]+)}/g, (_match, inside) => {
      // Support "NAME:default" or just "NAME"
      const [rawName, ...rest] = String(inside).split(':');
      const name = rawName?.trim();
      const def = rest.length ? rest.join(':').trim() : undefined;

      // Look up order: variables -> process.env -> default -> empty string
      const val = variables[name] ?? process.env[name] ?? def ?? '';
      return String(val);
    });
  }
}

const yamlConfigPath = path.join(__dirname, 'config', 'application.yml');
const envYamlConfigPath = path.join(__dirname, 'config', `application-${process.env.BACKEND_ENV}.yml`);

const yamlConfig = yaml.load(fs.readFileSync(yamlConfigPath, 'utf8'));
logger.log(`Actual process.env.BACKEND_ENV value: ${process.env.BACKEND_ENV}`);
logger.log('Standard allowed values are: dev, test or prod');
logger.log('if you run with a non standard BACKEND_ENV value, remember to add your application-{process.env.BACKEND_ENV}.yml file');
if (!fs.existsSync(envYamlConfigPath)) {
  logger.error(
    'An application-{process.env.BACKEND_ENV}.yml file with your process.env.BACKEND_ENV value does not exist under config folder!',
  );
}
const envYamlConfig = yaml.load(fs.readFileSync(envYamlConfigPath, 'utf8'));

const config = new Config({ ...objectToArray(yamlConfig), ...objectToArray(envYamlConfig), ipAddress: ipAddress() });

export { config };

function objectToArray(source, currentKey?, target?): any {
  target = target || {};
  for (const property in source) {
    if (source.hasOwnProperty(property)) {
      const newKey = currentKey ? `${currentKey}.${property}` : property;
      const newVal = source[property];

      if (typeof newVal === 'object') {
        objectToArray(newVal, newKey, target);
      } else {
        target[newKey] = newVal;
      }
    }
  }
  return target;
}

function ipAddress(): any {
  const interfaces = require('os').networkInterfaces();
  for (const dev in interfaces) {
    if (interfaces.hasOwnProperty(dev)) {
      const iface = interfaces[dev];
      for (const alias of iface) {
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          return alias.address;
        }
      }
    }
  }

  return null;
}
