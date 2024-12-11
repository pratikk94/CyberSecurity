import React, { useEffect, useState, useRef } from 'react';
import Peer from 'peerjs';
import axios from 'axios';

const AudioReceiver: React.FC = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [receivedText, setReceivedText] = useState<string>('');
  const synthRef = useRef<SpeechSynthesis | null>(window.speechSynthesis);

  useEffect(() => {
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

    const initializePeer = async () => {
      const id = await fetchPeerId();
      if (!id) return;

      const peer = new Peer(id, {
        host: 'localhost',
        port: 3002,
        path: '/',
      });

      peer.on('open', () => {
        console.log('PeerJS connection established with ID:', id);
      });

      peer.on('connection', (conn) => {
        console.log('Text connection established with sender.');

        conn.on('data', (data) => {
          console.log('Received data:', data);
          if (data.type === 'text-chunk') {
            console.log('Translated text chunk:', data.text);
            setReceivedText((prev) => prev + ' ' + data.text);

            const utterance = new SpeechSynthesisUtterance(data.text);
            utterance.lang = 'en-US';
            utterance.onstart = () => console.log('Speaking:', data.text);
            utterance.onerror = (e) => console.error('Speech synthesis error:', e);
            synthRef.current?.speak(utterance);
          }
        });

        conn.on('close', () => {
          console.log('Connection closed.');
        });
      });

      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
      });
    };

    initializePeer();
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  return (
    <div>
      <h1>Audio Receiver</h1>
      <p>Your Peer ID: {peerId || 'Generating...'} </p>
      <p>Translated Text:</p>
      <div style={{ whiteSpace: 'pre-wrap', border: '1px solid #ccc', padding: '10px' }}>
        {receivedText}
      </div>
    </div>
  );
};

export default AudioReceiver;