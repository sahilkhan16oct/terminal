import React from "react";

const FinalModal = ({ show }) => {
  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>🎉 Congratulations! 🎉</h2>
        <p>You have successfully cleared all tests!</p>
        <p>You're officially a pro! 🚀</p>
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
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // ✅ Semi-transparent dark overlay
    backdropFilter: "blur(10px)", // ✅ Blur effect applied
    WebkitBackdropFilter: "blur(10px)", // ✅ Safari support
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // ✅ Slightly transparent white
    padding: "25px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#333",
    boxShadow: "0px 0px 20px rgba(255, 215, 0, 0.8)",
  },
};

export default FinalModal;
