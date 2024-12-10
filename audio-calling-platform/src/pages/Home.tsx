import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>Welcome to the Audio Calling Platform</h1>
      <p>Select a role to continue:</p>
      <div className="button-container">
        <button className="nav-button sender" onClick={() => navigate('/send')}>
          Go to Sender
        </button>
        <button className="nav-button receiver" onClick={() => navigate('/receive')}>
          Go to Receiver
        </button>
      </div>
    </div>
  );
};

export default Home;