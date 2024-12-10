import { Injectable, OnModuleInit } from '@nestjs/common';
import { ExpressPeerServer } from 'peer';
import { Server } from 'http';

@Injectable()
export class PeerJsGateway implements OnModuleInit {
  private peerServer: any;

  constructor(private readonly httpServer: Server) {}

  onModuleInit() {
    this.peerServer = ExpressPeerServer(this.httpServer, {
      path: '/peerjs', // Specify the WebSocket path
    });

    this.httpServer.on('request', (req, res) => {
      this.peerServer(req, res, () => {});
    });

    // Log PeerJS events for debugging
    this.peerServer.on('connection', (client) => {
      console.log(`Peer connected: ${client.id}`);
    });

    this.peerServer.on('disconnect', (client) => {
      console.log(`Peer disconnected: ${client.id}`);
    });

    console.log('PeerJS server is running');
  }
}
