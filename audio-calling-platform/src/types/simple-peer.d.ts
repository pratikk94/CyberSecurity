/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'simple-peer' {
    import { Duplex } from 'stream';
  
    interface SignalData {
      type: 'offer' | 'answer' | 'pranswer' | 'rollback';
      sdp?: string;
      candidate?: RTCIceCandidateInit;
    }
  
    interface Options {
      initiator?: boolean;
      stream?: MediaStream;
      trickle?: boolean;
      config?: RTCConfiguration;
      offerOptions?: RTCOfferOptions;
      answerOptions?: RTCAnswerOptions;
      sdpTransform?: (sdp: string) => string;
      allowHalfTrickle?: boolean;
    }
  
    class SimplePeer extends Duplex {
      constructor(opts?: Options);
      signal(data: SignalData | string): void;
      destroy(err?: Error): void;
      send(data: string | ArrayBuffer | Blob): void;
      on(event: 'signal', cb: (data: SignalData) => void): this;
      on(event: 'connect' | 'close', cb: () => void): this;
      on(event: 'data', cb: (data: any) => void): this;
      on(event: 'stream', cb: (stream: MediaStream) => void): this;
    }
  
    export default SimplePeer;
  }