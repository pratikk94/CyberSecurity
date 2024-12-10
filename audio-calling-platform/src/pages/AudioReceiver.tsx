import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

const AudioReceiver: React.FC = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const peer = new Peer();

  useEffect(() => {
    peer.on('open', (id) => {
      setPeerId(id);
      console.log('Receiver Peer ID:', id);
    });

    peer.on('call', (call) => {
      console.log('Receiving call from sender...');
      call.answer(); // Answer the call without sending a stream

      call.on('stream', (stream) => {
        console.log('Received audio stream:', stream);
        if (audioRef.current) {
          audioRef.current.srcObject = stream;
          audioRef.current.play();
        }
      });

      call.on('close', () => {
        console.log('Call closed');
      });
    });

    return () => {
      peer.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Audio Receiver</h1>
      <p>Your Peer ID: {peerId}</p>
      <audio ref={audioRef} controls autoPlay />
    </div>
  );
};

export default AudioReceiver;