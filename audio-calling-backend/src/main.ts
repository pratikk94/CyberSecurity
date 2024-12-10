import { NestFactory } from '@nestjs/core';

import { createServer } from 'http';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  const httpServer = createServer(app.getHttpAdapter().getInstance());

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

bootstrap();
