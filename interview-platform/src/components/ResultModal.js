import React from "react";

const ResultModal = ({ show, isSuccess, onRetry, onProceed, score }) => {
  if (!show) return null; // Hide modal if not active

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={isSuccess ? styles.passText : styles.failText}>
          {isSuccess ? "🎉 Congratulations! You Passed!" : "❌ Sorry, You Failed!"}
        </h2>
        <h3 style={styles.scoreText}>
          {score !== null ? `🏅 Your Score: ${score}/100` : ""}
        </h3>

        {isSuccess ? (
          <button onClick={onProceed} style={styles.successButton}>
            🚀 Proceed to Next Test
          </button>
        ) : (
          <button onClick={onRetry} style={styles.failButton}>
            🔄 Retry
          </button>
        )}
      </div>
    </div>
  );
};

// ✅ Styles
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(5px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
    width: "350px",
  },
  passText: {
    color: "#28a745",
  },
  scoreText: {
    marginTop: "10px",
    fontSize: "18px",
    color: "#333",
  },  
  failText: {
    color: "#dc3545",
  },
  successButton: {
    marginTop: "15px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "0.3s",
  },
  failButton: {
    marginTop: "15px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#ff4d4d",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ResultModal;
