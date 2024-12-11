import { ExpressPeerServer } from 'peer';
import * as express from 'express';
import { createServer } from 'http';
import { SpeechClient } from '@google-cloud/speech';
import { v2 as Translate } from '@google-cloud/translate';

export class PeerJsGateway {
  private peerServer: any;
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private speechClient: SpeechClient;
  private translateClient: Translate.Translate;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.speechClient = new SpeechClient();
    this.translateClient = new Translate.Translate();
  }

  start() {
    // Add CORS middleware
    this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
      );
      next();
    });

    // Initialize PeerJS server
    this.peerServer = ExpressPeerServer(this.server, {
      path: '/',
      allow_discovery: true,
    //   cleanup_outdated_peers: true, // Automatically clean stale peers
    });

    this.app.use('/', this.peerServer);

    this.app.get('/peerjs/get_id', (req, res) => {
      const ts = req.query.ts || Date.now();
      const version = req.query.version || '1.5.4';
      res.json({ id: `peer-id-${ts}`, version });
    });

    // Log PeerJS events
    this.peerServer.on('connection', (client) => {
      console.log(`Peer connected: ${client.getId ? client.getId() : client}`);
    });

    this.peerServer.on('disconnect', (client) => {
      console.log(`Peer disconnected: ${client.getId ? client.getId() : client}`);
    });

    this.peerServer.on('call', (call) => {
      console.log(`Incoming call from peer: ${call.peer}`);
      call.answer();

      call.on('stream', (stream) => {
        console.log('Received audio stream');
        this.handleAudioStream(stream, call.peer);
      });

      call.on('close', () => {
        console.log(`Call with peer ${call.peer} ended`);
      });

      call.on('error', (err) => {
        console.error(`Call error with peer ${call.peer}:`, err);
      });
    });

    const PORT = 3002;
    this.server.listen(PORT, () => {
      console.log(`PeerJS server is running at http://localhost:${PORT}/peerjs`);
    });
  }

  private async handleAudioStream(
    stream: NodeJS.ReadableStream,
    peerId: string,
  ): Promise<void> {
    console.log(`Processing audio stream from peer: ${peerId}`);
    const request = {
      config: {
        encoding: 'LINEAR16' as const,
        sampleRateHertz: 16000,
        languageCode: 'mr-IN',
      },
      interimResults: true,
    };

    const recognizeStream = this.speechClient
      .streamingRecognize(request)
      .on('data', async (data) => {
        if (data.results[0]?.alternatives[0]) {
          const transcript = data.results[0].alternatives[0].transcript;
          console.log(`Transcribed: ${transcript}`);

          try {
            const [translatedText] = await this.translateClient.translate(
              transcript,
              'en',
            );
            console.log(`Translated: ${translatedText}`);
          } catch (error) {
            console.error('Translation error:', error);
          }
        }
      })
      .on('error', (err) => console.error('Speech recognition error:', err))
      .on('end', () => console.log('Speech recognition ended'));

    stream.on('data', (chunk) => {
      recognizeStream.write(chunk);
    });

    stream.on('end', () => {
      recognizeStream.end();
      console.log('Audio stream ended');
    });
  }
}