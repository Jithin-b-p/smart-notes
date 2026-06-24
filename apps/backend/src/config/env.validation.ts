import { IsEnum, IsNumber, IsString, IsUrl, Min, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsString()
  REDIS_URL!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN!: string;

  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsUrl({ require_tld: false })
  GOOGLE_CALLBACK_URL!: string;

  @IsString()
  GEMINI_API_KEY!: string;

  @IsString()
  R2_ACCOUNT_ID!: string;

  @IsString()
  R2_ACCESS_KEY_ID!: string;

  @IsString()
  R2_SECRET_ACCESS_KEY!: string;

  @IsString()
  R2_BUCKET!: string;

  @IsUrl({ require_tld: false })
  FRONTEND_URL!: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validateConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validateConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) => {
      return Object.values(error.constraints || {}).map(
        (message) => `${error.property}: ${message}`,
      );
    });

    throw new Error(`Environment validation failed: \n ${messages.join('\n')}`);
  }

  return validateConfig;
}
