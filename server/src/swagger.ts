import { INestApplication, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { config } from './config';

export function setupSwagger(app: INestApplication): any {
  const logger: Logger = new Logger('Swagger');
  const swaggerEndpoint = config.get('jhipster.swagger.path');

  const options = new DocumentBuilder()
    .setTitle(config.get('jhipster.swagger.title'))
    .setDescription(config.get('jhipster.swagger.description'))
    .setVersion(config.get('jhipster.swagger.version'))
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(swaggerEndpoint, app, document);
  app.getHttpAdapter().get('/v3/api-docs', (req, res) => {
    res.type('application/json').send(document);
  });
  logger.log(`Added swagger on endpoint ${swaggerEndpoint}`);
}
