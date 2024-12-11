import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import axios from 'axios';

const AudioSender: React.FC = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState<string>('');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const peer = useRef<Peer | null>(null);
  const connection = useRef<DataConnection | null>(null);
  const callRef = useRef<MediaConnection | null>(null);

  useEffect(() => {
    // Function to fetch a unique Peer ID from the backend
    const fetchPeerId = async () => {
      try {
        const response = await axios.get('http://localhost:3002/peerjs/get_id', {
          params: { ts: Date.now(), version: '1.5.4' },
        });
        console.log('Fetched Peer ID:', response.data.id);
        setPeerId(response.data.id);
        return response.data.id;
      } catch (error) {
        console.error('Error fetching Peer ID:', error);
        return null;
      }
    };

    // Initialize PeerJS with the fetched Peer ID
    const initializePeer = async () => {
      const id = await fetchPeerId();
      if (!id) return;

      peer.current = new Peer(id, {
        host: 'localhost',
        port: 3002,
        path: '/',
        debug: 2,
      });

      peer.current.on('open', (id) => {
        console.log('Sender Peer ID:', id);
      });

      peer.current.on('error', (err) => {
        console.error('PeerJS error:', err);
      });

      peer.current.on('disconnected', () => {
        console.log('Peer disconnected. Attempting to reconnect...');
        peer.current?.reconnect();
      });
    };

    initializePeer();

    return () => {
      peer.current?.destroy();
    };
  }, []);

  // Function to connect to the receiver via PeerJS
  const connectToReceiver = () => {
    if (!receiverId) {
      alert('Please enter a valid Receiver Peer ID');
      return;
    }

    console.log(`Attempting to connect to receiver with ID: ${receiverId}`);

    if (peer.current) {
      connection.current = peer.current.connect(receiverId);

      connection.current.on('open', () => {
        console.log(`Connection established with receiver: ${receiverId}`);
        const testMessage = { type: 'text-chunk', text: 'Hello, this is a test message!' };
        connection.current?.send(testMessage);
        console.log('Sent message to receiver:', testMessage);
      });

      connection.current.on('data', (data) => {
        console.log('Received data from receiver:', data);
      });

      connection.current.on('close', () => {
        console.log(`Connection with receiver ${receiverId} has been closed`);
      });

      connection.current.on('error', (err) => {
        console.error('Connection error:', err);
      });
    }
  };

  // Function to start streaming audio to the receiver
  const startStream = async () => {
    if (!receiverId) {
      alert('Please enter a valid Receiver Peer ID');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      console.log('Streaming audio to receiver...');
      if (peer.current) {
        callRef.current = peer.current.call(receiverId, stream);

        callRef.current.on('stream', (remoteStream) => {
          console.log('Received remote stream:', remoteStream);
        });

        callRef.current.on('close', () => {
          console.log('Call closed');
        });

        callRef.current.on('error', (err) => {
          console.error('Call error:', err);
        });
      }
    } catch (err) {
      console.error('Error starting audio stream:', err);
    }
  };

  // Stop streaming if necessary
  const stopStream = () => {
    if (callRef.current) {
      callRef.current.close();
      console.log('Stopped streaming audio to receiver.');
    }

    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }
  };

  return (
    <div>
      <h1>Audio Sender</h1>
      <p>Your Peer ID: {peerId || 'Generating...'}</p>
      <input
        type="text"
        placeholder="Enter Receiver Peer ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
      />
      <button onClick={connectToReceiver}>Connect to Receiver</button>
      <button onClick={startStream}>Start Stream</button>
      <button onClick={stopStream}>Stop Stream</button>
    </div>
  );
};

export default AudioSender;