import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AudioSender from './pages/AudioSender';
import AudioReceiver from './pages/AudioReceiver';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<AudioSender />} />
        <Route path="/receive" element={<AudioReceiver />} />
      </Routes>
    </Router>
  );
};

export default App;