import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      onLogin(username);
      toast.success('Login successful!', { autoClose: 2000 });
    } else {
      toast.error('Invalid credentials, try again!', { autoClose: 2000 });
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.card}>
        <h2 style={styles.heading}>Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={styles.input} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={styles.input} />
          <button type="submit" style={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e1e1e, #232526)',
  },
  card: {
    padding: '30px',
    width: '350px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
  },
  heading: {
    color: '#fff',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '12px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#4caf50',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    transition: '0.3s',
  },
};

export default Login;
