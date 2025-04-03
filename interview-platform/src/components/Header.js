import React from 'react';

const Header = () => {
  return (
    <div style={styles.header}>
      <h1 style={styles.title}>Linux Test and Practice</h1>
    </div>
  );
};

const styles = {
  header: {
    width: '100%',
    height: '60px',
    backgroundColor: '#1e1e1e',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    borderBottom: '2px solid #444',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  title: {
    margin: 0,
    fontFamily: 'Arial, sans-serif',
  },
};

export default Header;
