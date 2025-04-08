import React, { useEffect, useState } from "react";
import ResultModal from "./ResultModal";
import FinalModal from "./FinalModal"; 
import API_BASE_URL from '../config';

const Questions = ({ username }) => {
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(null);
  const [testNumber, setTestNumber] = useState(1);
  const [testCount, setTestCount] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);


  // ✅ Fetch total number of tests
  const fetchTestCount = async () => {
    try {
      const res = await fetch(`http://${API_BASE_URL}/api/test-count`);
      const data = await res.json();
      if (data.success) {
        setTestCount(data.testCount); // ✅ Set total number of tests
      }
    } catch (error) {
      console.error("Error fetching test count:", error);
    }
  };

  // ✅ Fetch question
  const fetchQuestion = async (index) => {
    setLoading(true);
    try {
      const res = await fetch(`http://${API_BASE_URL}/api/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testNumber: `test${testNumber}`, questionIndex: index, username }),
      });

      const data = await res.json();
      setQuestion(data.question);
      setIsLastQuestion(data.isLast);
      setTimeLeft(10);
    } catch (err) {
      console.error("Error fetching question:", err);
      setQuestion("Failed to load question.");
    }
    setLoading(false);
  };

  // ✅ Load test count FIRST, then fetch the first question
  useEffect(() => {
    fetchTestCount();
  }, []);

  useEffect(() => {
    if (testCount !== null) {
      fetchQuestion(0);
    }
  }, [testNumber, testCount]); // ✅ Wait for testCount before fetching questions

  // ✅ Timer logic (Only start when question is loaded)
  useEffect(() => {
    if (loading || !question) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 1) {
          handleNextQuestion();
        }
        return prevTime > 0 ? prevTime - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [question, loading]);

  // ✅ Handle next question
  const handleNextQuestion = async () => {
    if (!isLastQuestion) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      fetchQuestion(nextIndex);
    } else {
      try {
        const res = await fetch(`http://${API_BASE_URL}/api/validate-test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testNumber, username }),
        });

        const data = await res.json();
        setIsSuccess(data.success);
        setScore(data.marks); // ✅ Save score from backend
        setShowModal(true);

        if (data.success) {
          setTestNumber(testNumber + 1);
        }

      } catch (error) {
        console.error("Error validating test:", error);
        setIsSuccess(false);
        setShowModal(true);
      }
    }
  };

  // ✅ Retry function
  const handleRetry = () => {
    setShowModal(false);
    setCurrentIndex(0);
    setIsLastQuestion(false);
    fetchQuestion(0);
    setScore(null);
  };

  // ✅ Proceed function
  const handleProceed = () => {
    setShowModal(false);
    setCurrentIndex(0);
    setIsLastQuestion(false);
    fetchQuestion(0);
  };

  // ✅ Prevent modal from showing before test count is loaded
  if (testCount === null) {
    return <p style={styles.loading}>⏳ Loading test count...</p>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Test {testNumber}</h2>

      {loading ? <p style={styles.loading}>⏳ Loading...</p> : <p style={styles.questionText}>{question}</p>}

      {!loading && question !== "Finish" && <div style={styles.timer}>⏳ {timeLeft}s</div>}

      {!loading && !isLastQuestion && question !== "Finish" && (
        <button style={styles.button} onClick={handleNextQuestion}>Skip Question</button>
      )}

      {/* ✅ Only show FinalModal when ALL tests are cleared */}
      {testNumber > testCount ? (
        <FinalModal show={showModal} />
      ) : (
        <ResultModal
          show={showModal}
          isSuccess={isSuccess}
          onRetry={handleRetry}
          onProceed={handleProceed}
          score={score}
        />
      )}
    </div>
  );
};

// ✅ Styles
const styles = {
  container: {
    padding: "20px",
    color: "white",
    fontSize: "18px",
    textAlign: "center",
    position: "relative",
  },
  title: {
    fontWeight: "bold",
  },
  loading: {
    fontSize: "20px",
    color: "#FFD700",
  },
  questionText: {
    marginTop: "10px",
    fontSize: "20px",
  },
  timer: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: "black",
    color: "white",
    padding: "5px 10px",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "16px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Questions;
