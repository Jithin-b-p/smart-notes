import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { AllExpectionFilter } from '@common/filters/http-exception.filter';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './config/config.types';
import cookieParser from 'cookie-parser';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService<AppConfig>);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  app.enableCors({
    origin: config.getOrThrow<string>('frontendUrl'),
    credenitals: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExpectionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  if (config.getOrThrow('nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Smart notes API')
      .setDescription(
        'AI-powered note taking application API. All protected endpoints requires a bearer token.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          in: 'header',
        },
        'JWT',
      )
      .addTag('auth', 'Authentication and authorisation')
      .addTag('users', 'User profile management')
      .addTag('notes', 'Note CRUD and management')
      .addTag('folders', 'Folder organisation')
      .addTag('tags', 'Tag management')
      .addTag('ai', 'AI-powered features')
      .addTag('upload', 'File attachment management')
      .addServer('http://localhost:3001', 'Local development')
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationSorter: 'method',
      },
    });

    logger.log('swagger docs available at: http://localhost:3001.docs');
  }

  app.enableShutdownHooks();

  const port = config.getOrThrow<number>('port');
  await app.listen(port);
  logger.log(`Application running on: http://localhost:${port}/api`);
}
void bootstrap();
