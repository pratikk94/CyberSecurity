import React from 'react';

interface CallControlsProps {
  isMuted: boolean;
  toggleMute: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({ isMuted, toggleMute }) => {
  return (
    <div className="call-controls">
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button className="end-call-btn">End Call</button>
    </div>
  );
};

export default CallControls;