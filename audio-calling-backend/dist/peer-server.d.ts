export declare class PeerJsGateway {
    private peerServer;
    private app;
    private server;
    private speechClient;
    private translateClient;
    constructor();
    start(): void;
    private handleAudioStream;
}
