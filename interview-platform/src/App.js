import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Questions from './components/Questions';
import Terminal from './components/Terminal';
import Header from './components/Header';
import Admin from './components/Admin';

const App = () => {
  const [username, setUsername] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Router>
      <div>
        {username && username !== 'admin' && <Header />}
        <Routes>
          {/* Redirect to Admin if username is "admin" */}
          <Route path="/" element={<RedirectHandler username={username} setUsername={setUsername} />} />

          {/* Admin Route */}
          <Route path="/admin" element={username === 'admin' ? <Admin /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

// Component to handle redirection based on username
const RedirectHandler = ({ username, setUsername }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (username === 'admin') {
      navigate('/admin');
    }
  }, [username, navigate]);

  return username ? (
    <div style={styles.container}>
      <div style={styles.questionsPanel}>
      <Questions username={username} />
      </div>
      <div style={styles.terminalPanel}>
        <Terminal username={username} />
      </div>
    </div>
  ) : (
    <Login onLogin={setUsername} />
  );
};

const styles = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 60px)',
    marginTop: '60px',
  },
  questionsPanel: {
    flex: 1,
    background: '#181818',
    padding: '10px',
    borderRight: '2px solid #444',
  },
  terminalPanel: {
    flex: 2,
  },
};

export default App;
