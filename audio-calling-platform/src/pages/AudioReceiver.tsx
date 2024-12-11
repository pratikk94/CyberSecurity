import React, { useEffect, useState, useRef } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';
import axios from 'axios';

const AudioReceiver: React.FC = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [receivedText, setReceivedText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);
  const peer = useRef<Peer | null>(null);
  const connection = useRef<DataConnection | null>(null);
  const callRef = useRef<MediaConnection | null>(null);

  useEffect(() => {
    // Function to fetch Peer ID from the backend
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

      peer.current.on('open', () => {
        console.log('PeerJS connection established with ID:', id);
      });

      peer.current.on('connection', (conn) => {
        console.log('Text connection established with sender.');
        connection.current = conn;

        conn.on('data', (data) => {
          console.log('Received data:', data);

          if (data.type === 'text-chunk') {
            console.log('Translated text chunk:', data.text);
            setReceivedText((prev) => prev + ' ' + data.text);

            // Convert received text to speech
            const utterance = new SpeechSynthesisUtterance(data.text);
            utterance.lang = 'en-US';
            setIsSpeaking(true);

            utterance.onstart = () => console.log('Speaking:', data.text);
            utterance.onerror = (e) => console.error('Speech synthesis error:', e);
            utterance.onend = () => setIsSpeaking(false);

            synthRef.current?.speak(utterance);
          }
        });

        conn.on('close', () => {
          console.log('Text connection closed.');
        });

        conn.on('error', (err) => {
          console.error('Connection error:', err);
        });
      });

      peer.current.on('call', (call) => {
        console.log('Incoming audio call from sender.');
        callRef.current = call;

        call.answer(); // Answer the call

        call.on('stream', (remoteStream) => {
          console.log('Received audio stream.');
          playAudioStream(remoteStream);
        });

        call.on('close', () => {
          console.log('Audio call closed.');
        });

        call.on('error', (err) => {
          console.error('Call error:', err);
        });
      });

      peer.current.on('error', (err) => {
        console.error('PeerJS error:', err);
      });
    };

    // Play the received audio stream
    const playAudioStream = (stream: MediaStream) => {
      const audioElement = document.createElement('audio');
      audioElement.srcObject = stream;
      audioElement.autoplay = true;
      audioElement.controls = true;
      document.body.appendChild(audioElement);
    };

    initializePeer();

    return () => {
      synthRef.current?.cancel();
      connection.current?.close();
      callRef.current?.close();
      peer.current?.destroy();
    };
  }, []);

  return (
    <div>
      <h1>Audio Receiver</h1>
      <p>Your Peer ID: {peerId || 'Generating...'}</p>
      <p>Translated Text:</p>
      <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px' }}>
        {receivedText}
      </div>
      {isSpeaking && <p>Speaking...</p>}
    </div>
  );
};

export default AudioReceiver;