import React, { useEffect, useState } from 'react';
import Peer from 'peerjs';

const AudioSender: React.FC = () => {
  const [peerId, setPeerId] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState<string>('');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not connected');

  const peer = new Peer();

  useEffect(() => {
    peer.on('open', (id) => {
      setPeerId(id);
      console.log('Sender Peer ID:', id);
    });

    peer.on('connection', (conn) => {
      setConnectionStatus('Connected');
      console.log('Connected to receiver:', conn.peer);
    });

    return () => {
      peer.disconnect();
    };
  }, []);

  const startStreaming = async (receiverId: string) => {
    if (!selectedDevice) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDevice },
      });

      const call = peer.call(receiverId, stream);

      call.on('close', () => {
        setConnectionStatus('Connection closed');
        console.log('Call closed');
      });

      setConnectionStatus('Streaming audio...');
    } catch (err) {
      console.error('Error accessing audio device:', err);
    }
  };

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter((device) => device.kind === 'audioinput');
      setAudioDevices(audioInputs);
      if (audioInputs.length > 0) setSelectedDevice(audioInputs[0].deviceId);
    });
  }, []);

  return (
    <div>
      <h1>Audio Sender</h1>
      <p>Your Peer ID: {peerId}</p>
      <p>Status: {connectionStatus}</p>
      <select onChange={(e) => setSelectedDevice(e.target.value)} value={selectedDevice || ''}>
        {audioDevices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId}`}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Enter Receiver Peer ID"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
      />
      <button onClick={() => startStreaming(receiverId)}>Start Streaming</button>
    </div>
  );
};

export default AudioSender;