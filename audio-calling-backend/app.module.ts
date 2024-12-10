import { Module } from '@nestjs/common';
import { createServer } from 'http';
import { PeerJsGateway } from 'peer/peerjs.gateway';

@Module({
  providers: [
    {
      provide: PeerJsGateway,
      useFactory: () => {
        const httpServer = createServer();
        return new PeerJsGateway(httpServer);
      },
    },
  ],
})
export class AppModule {}
