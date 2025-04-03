document.addEventListener("DOMContentLoaded", () => {
  console.log("index.js loaded successfully!");
});

// Global variable to prevent double logout requests
let isLoggingOut = false;

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    localStorage.setItem("username", username); // Store username for session
    document.getElementById('login-container').style.opacity = "0";
    setTimeout(() => {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('app-container').classList.add("app-visible"); // Remove blur effect
      startTerminal(username);
    }, 300);
  } else {
    errorMsg.innerText = "Invalid username or password.";
  }
}

function startTerminal(username) {
  const term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    rows: 40, // Ensure full height coverage
    theme: {
      background: '#000000'
    }
  });

  term.open(document.getElementById('terminal-container'));
  term.focus();

  const socket = new WebSocket(`ws://localhost:4000?username=${username}`);

  socket.onmessage = (event) => {
    term.write(event.data);
    setTimeout(() => {
      term.scrollToBottom(); // Auto-scroll to bottom
    }, 50);
  };

  term.onData((data) => socket.send(data));

  // Close WebSocket on logout
  socket.onclose = () => {
    console.log("WebSocket connection closed.");
  };
}

async function logoutUser() {
  if (isLoggingOut) return; // Prevent multiple requests
  isLoggingOut = true;

  const username = localStorage.getItem("username");
  if (!username) return;

  try {
    const res = await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    if (res.ok) {
      alert("Logged out successfully!");
      localStorage.removeItem("username");
      window.location.reload(); // Reload page to return to login
    } else {
      alert("Logout failed!");
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    isLoggingOut = false; // Reset flag after request completes
  }
}

// Auto-login if username is stored
document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("username");
  if (username) {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('app-container').classList.add("app-visible");
    startTerminal(username);
  }
});
