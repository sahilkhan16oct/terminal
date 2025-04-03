import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalComponent = ({ username }) => {
  const terminalRef = useRef(null);
  const termInstance = useRef(null);
  const fitAddon = useRef(null);

  useEffect(() => {
    if (!username || !terminalRef.current) return;

    // Initialize terminal
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 16,
      fontFamily: 'monospace',
      theme: { background: '#000000', foreground: '#00ff00' },
    });

    fitAddon.current = new FitAddon();
    term.loadAddon(fitAddon.current);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.current.fit();
    term.focus();

    // WebSocket Connection
    const socket = new WebSocket(`ws://localhost:4000?username=${username}`);

    socket.onmessage = (event) => term.write(event.data);
    term.onData((data) => socket.send(data));

    socket.onclose = () => term.write("\r\n\x1b[31mConnection Closed\x1b[0m");

    termInstance.current = term;

    // Handle window resizing
    const handleResize = () => {
      if (fitAddon.current && termInstance.current) {
        fitAddon.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      socket.close();
      term.dispose();
    };
  }, [username]);

  return <div ref={terminalRef} style={styles.terminalContainer}></div>;
};

const styles = {
  terminalContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
  },
};

export default TerminalComponent;
