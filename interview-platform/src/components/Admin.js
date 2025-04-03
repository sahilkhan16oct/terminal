import React from 'react';

const Admin = () => {
  return (
    <div style={styles.container}>
      <h1>Admin Panel</h1>
      <p>Welcome to the admin dashboard.</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    background: '#222',
    color: '#fff',
    height: '100vh',
  },
};

export default Admin;
