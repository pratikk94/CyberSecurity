import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PeerJsGateway } from './peer-server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = 3001;
  await app.listen(port);
  console.log(`NestJS server is running on http://localhost:${port}`);

  // Start PeerJS server
  const peerJsGateway = new PeerJsGateway();
  peerJsGateway.start();
}

bootstrap();
