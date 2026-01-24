import { IsNotEmpty, IsString } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  readonly RABBITMQ_URL: string;

  @IsString()
  @IsNotEmpty()
  readonly RABBITMQ_QUEUE: string;
}
